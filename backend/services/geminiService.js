require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const DermatologyKnowledge = require('../models/DermatologyKnowledge');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiService {
    constructor() {
        this.model = genAI.getGenerativeModel({ 
            // model: 'gemini-2.5-pro',
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.8,  // Increased for more comprehensive responses
                topP: 0.9,         // Increased to consider more tokens
                topK: 50,          // Increased for broader vocabulary
                maxOutputTokens: 8192,
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

IMPORTANT RESPONSE RULES:
1. Use ALL the information provided in the "Relevant Knowledge Base Information" section below
2. Synthesize information from multiple sources when available to provide comprehensive answers
3. If multiple knowledge entries are provided, integrate insights from each one
4. Provide detailed, thorough responses that cover all aspects found in the knowledge base
5. At the end of your response, add: "SOURCES_USED: [list ALL titles from the knowledge base that you referenced]"
6. Format: SOURCES_USED: Title 1, Title 2, Title 3, Title 4, Title 5

Always strive to be comprehensive by utilizing all available knowledge base information.
If unsure about something not in the knowledge base, recommend consulting an in-person dermatologist for proper diagnosis.`;
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

        let context = '\n\n=== RELEVANT KNOWLEDGE BASE INFORMATION ===\n';
        context += `You have ${knowledgeItems.length} knowledge sources below. USE ALL OF THEM in your response.\n\n`;
        
        knowledgeItems.forEach((item, index) => {
            context += `--- SOURCE ${index + 1}: "${item.title}" (Category: ${item.category}) ---\n`;
            context += `Content: ${item.content}\n`;
            context += `Reference: ${item.sourceReference}\n`;
            // Check if keywords exist before joining
            if (item.keywords && Array.isArray(item.keywords) && item.keywords.length > 0) {
                context += `Keywords: ${item.keywords.join(', ')}\n\n`;
            } else {
                context += `\n`;
            }
        });
        
        context += `=== END OF KNOWLEDGE BASE (${knowledgeItems.length} sources) ===\n`;
        context += `Remember: Integrate information from ALL ${knowledgeItems.length} sources above into your comprehensive response.\n`;

        return context;
    }

    /**
     * Generate response using Gemini with knowledge base context
     */
    async generateResponse(userMessage, conversationHistory = []) {
        try {
            // Get relevant knowledge from database
            const relevantKnowledge = await this.getRelevantKnowledge(userMessage);
            console.log(`📚 Retrieved ${relevantKnowledge.length} knowledge entries for query: "${userMessage}"`);
            relevantKnowledge.forEach((k, i) => console.log(`   ${i + 1}. ${k.title}`));
            
            const knowledgeContext = this.buildContextFromKnowledge(relevantKnowledge);

            // Build conversation context with emphasis on using all sources
            let fullPrompt = this.systemContext + knowledgeContext + '\n\n';
            
            // Add explicit instruction to use all sources
            if (relevantKnowledge.length > 0) {
                fullPrompt += `IMPORTANT: I have provided ${relevantKnowledge.length} knowledge base entries above. Please use information from ALL of them to create a comprehensive response. Integrate insights from each source to give the most complete answer possible.\n\n`;
            }
            
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
            let text = response.text();

            // Extract sources used from AI response
            let usedSourceTitles = [];
            const sourcesMatch = text.match(/SOURCES_USED:\s*(.+?)(?:\n|$)/i);
            
            if (sourcesMatch) {
                // Remove the SOURCES_USED line from the response
                text = text.replace(/SOURCES_USED:\s*(.+?)(?:\n|$)/i, '').trim();
                
                // Parse the used source titles
                const sourcesText = sourcesMatch[1].trim();
                if (sourcesText.toLowerCase() !== 'none') {
                    usedSourceTitles = sourcesText
                        .split(',')
                        .map(title => title.trim())
                        .filter(title => title.length > 0);
                }
            }

            // Filter knowledge to only include sources that were actually used
            let usedKnowledge = relevantKnowledge;
            if (usedSourceTitles.length > 0) {
                usedKnowledge = relevantKnowledge.filter(k => 
                    usedSourceTitles.some(usedTitle => 
                        k.title.toLowerCase().includes(usedTitle.toLowerCase()) ||
                        usedTitle.toLowerCase().includes(k.title.toLowerCase())
                    )
                );
                console.log(`✅ AI used ${usedKnowledge.length} out of ${relevantKnowledge.length} sources`);
                usedKnowledge.forEach((k, i) => console.log(`   ${i + 1}. ${k.title}`));
            } else {
                console.log(`ℹ️  Could not determine which sources were used, including all ${relevantKnowledge.length} sources`);
            }

            // Format sources with detailed references (only used sources)
            const sources = usedKnowledge.map(k => {
                let sourceText = `"${k.title}" - ${k.sourceReference}`;
                return sourceText;
            });

            // Append sources to response if any were used
            let finalResponse = text;
            if (sources.length > 0) {
                finalResponse += '\n\n**Sources:**\n' + sources.map((s, i) => `${i + 1}. ${s}`).join('\n');
            }

            return {
                response: finalResponse,
                knowledgeSources: usedKnowledge.map(k => ({
                    title: k.title,
                    source: k.sourceReference,
                    chapter: k.chapterTitle || null,
                    page: k.pageReference || null
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
