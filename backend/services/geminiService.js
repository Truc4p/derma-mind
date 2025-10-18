require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const DermatologyKnowledge = require('../models/DermatologyKnowledge');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiService {
    constructor() {
        this.model = genAI.getGenerativeModel({ 
            model: 'gemini-2.0-flash',
            generationConfig: {
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 2048,
            }
        });
        
        // System instruction for the dermatologist
        this.systemContext = `You are a Board-Certified Virtual Dermatologist with extensive knowledge in:
- Dermatology and skin conditions
- Skincare ingredients and formulations
- Cosmetic procedures and treatments
- Evidence-based skincare routines
- Product recommendations based on skin type and concerns

You provide professional, evidence-based advice while being empathetic and easy to understand.
Always cite the knowledge base when providing specific information.
If unsure, recommend consulting an in-person dermatologist for proper diagnosis.`;
    }

    /**
     * Get relevant knowledge from database based on query
     */
    async getRelevantKnowledge(userQuery, limit = 5) {
        try {
            // Extract keywords from query
            const keywords = userQuery.toLowerCase()
                .split(/\s+/)
                .filter(word => word.length > 3);

            // Search knowledge base
            const knowledge = await DermatologyKnowledge.find({
                $or: [
                    { keywords: { $in: keywords } },
                    { $text: { $search: userQuery } }
                ]
            })
            .limit(limit)
            .select('title content category sourceReference');

            return knowledge;
        } catch (error) {
            console.error('Error fetching knowledge:', error);
            return [];
        }
    }

    /**
     * Generate enhanced context from knowledge base
     */
    buildContextFromKnowledge(knowledgeItems) {
        if (!knowledgeItems || knowledgeItems.length === 0) {
            return '';
        }

        let context = '\n\nRelevant Knowledge Base Information:\n';
        knowledgeItems.forEach((item, index) => {
            context += `\n${index + 1}. ${item.title} (${item.category})\n`;
            context += `${item.content}\n`;
            context += `Source: ${item.sourceReference}\n`;
        });

        return context;
    }

    /**
     * Generate response using Gemini with knowledge base context
     */
    async generateResponse(userMessage, conversationHistory = []) {
        try {
            // Get relevant knowledge from database
            const relevantKnowledge = await this.getRelevantKnowledge(userMessage);
            const knowledgeContext = this.buildContextFromKnowledge(relevantKnowledge);

            // Build conversation context
            let fullPrompt = this.systemContext + knowledgeContext + '\n\n';
            
            // Add conversation history
            if (conversationHistory.length > 0) {
                fullPrompt += 'Previous conversation:\n';
                conversationHistory.slice(-5).forEach(msg => {
                    fullPrompt += `${msg.role === 'user' ? 'Patient' : 'Dermatologist'}: ${msg.content}\n`;
                });
            }

            fullPrompt += `\nPatient: ${userMessage}\nDermatologist:`;

            // Generate response
            const result = await this.model.generateContent(fullPrompt);
            const response = await result.response;
            const text = response.text();

            return {
                response: text,
                knowledgeSources: relevantKnowledge.map(k => ({
                    title: k.title,
                    source: k.sourceReference
                }))
            };
        } catch (error) {
            console.error('Error generating Gemini response:', error);
            throw new Error('Failed to generate response');
        }
    }

    /**
     * Analyze and categorize a medical query
     */
    async analyzeQuery(query) {
        try {
            const prompt = `Analyze this dermatology-related query and extract:
1. Main skin concern or topic
2. Skin type mentioned (if any)
3. Urgency level (routine, moderate, urgent)
4. Keywords for knowledge base search

Query: "${query}"

Respond in JSON format.`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Parse JSON response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            return null;
        } catch (error) {
            console.error('Error analyzing query:', error);
            return null;
        }
    }

    /**
     * Generate a personalized skincare routine
     */
    async generateSkincareRoutine(skinProfile) {
        try {
            const { skinType, concerns, currentProducts, budget } = skinProfile;

            // Get relevant knowledge for routine building
            const routineKnowledge = await DermatologyKnowledge.find({
                category: { $in: ['routines', 'ingredients', 'treatments'] },
                keywords: { $in: [skinType, ...concerns] }
            }).limit(10);

            const knowledgeContext = this.buildContextFromKnowledge(routineKnowledge);

            const prompt = `${this.systemContext}${knowledgeContext}

Create a comprehensive, personalized skincare routine for:
- Skin Type: ${skinType}
- Concerns: ${concerns.join(', ')}
- Current Products: ${currentProducts || 'None specified'}
- Budget: ${budget || 'Moderate'}

Provide:
1. Morning routine (step-by-step)
2. Evening routine (step-by-step)
3. Weekly treatments
4. Key ingredients to look for
5. Ingredients to avoid
6. Expected timeline for results
7. Product type recommendations (not specific brands unless in knowledge base)

Format the response with clear sections and bullet points.`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error generating routine:', error);
            throw new Error('Failed to generate skincare routine');
        }
    }
}

module.exports = new GeminiService();
