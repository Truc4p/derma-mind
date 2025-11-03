require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const DermatologyKnowledge = require('../models/DermatologyKnowledge');
const fs = require('fs').promises;
const path = require('path');
const speechService = require('./speechService');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

class GeminiService {
    constructor() {
        this.model = genAI.getGenerativeModel({ 
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
1. Use ALL the information provided in the knowledge base sections
2. Synthesize information from multiple sources when available to provide comprehensive answers
3. Provide detailed, thorough responses that cover all relevant aspects found in the knowledge base
4. Format your responses in clear, easy-to-read markdown with headers, lists, and proper formatting

Always strive to be comprehensive by utilizing all available knowledge base information.
If unsure about something not in the knowledge base, recommend consulting an in-person dermatologist for proper diagnosis.`;
    }

    /**
     * Generate content with retry logic for handling API overload
     */
    async generateWithRetry(prompt, maxRetries = 3, initialDelay = 1000) {
        let lastError;
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await this.model.generateContent(prompt);
            } catch (error) {
                lastError = error;
                
                // Check if it's a retryable error (503 Service Unavailable or 429 Rate Limit)
                if (error.status === 503 || error.status === 429) {
                    if (attempt < maxRetries - 1) {
                        // Exponential backoff: wait longer with each retry
                        const delay = initialDelay * Math.pow(2, attempt);
                        console.log(`🔄 Gemini API overloaded (attempt ${attempt + 1}/${maxRetries}). Retrying in ${delay}ms...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                }
                
                // If it's not retryable or we've exhausted retries, throw the error
                throw error;
            }
        }
        
        // If we get here, all retries failed
        throw lastError;
    }

    /**
     * Generate response using RAG-retrieved context from vector database
     */
    async generateResponseWithContext(userMessage, ragContext, conversationHistory = []) {
        try {
            console.log(`📚 Using RAG context for query: "${userMessage}"`);
            
            // Build prompt with RAG context
            let fullPrompt = this.systemContext;
            
            // Add RAG context
            fullPrompt += '\n\n=== RELEVANT KNOWLEDGE FROM DERMATOLOGY TEXTBOOK ===\n';
            fullPrompt += ragContext;
            fullPrompt += '\n=== END OF KNOWLEDGE BASE ===\n\n';
            
            fullPrompt += `CRITICAL INSTRUCTIONS:
1. Use the information from the knowledge base above to provide accurate, evidence-based answers
2. When the knowledge base contains step-by-step procedures, numbered lists, or treatment protocols:
   - Include ALL steps in their COMPLETE form
   - Do NOT summarize, condense, or skip steps
   - Maintain the original numbering and sequence
   - Include all details, measurements, times, and specific instructions from each step
3. Be comprehensive and thorough in your responses, covering all relevant aspects found in the knowledge base
4. Only summarize when the content is descriptive or explanatory, NOT when it's procedural or instructional

CITATION REQUIREMENT (Numbered Reference Style):
5. ALWAYS cite your sources inline using bracketed numbers when making statements based on the knowledge base
   - Use bracketed superscript format: [1], [2], [3], etc. to reference the source chunks
   - Place citation numbers at the end of sentences or clauses where you use information from that source
   - For multiple sources, list them together: [1,3] or [1-3] for consecutive numbers
   - Place citations after the final punctuation mark
   - Examples:
     * "The successful treatment of acne scars often requires a combination of treatments.[1,3]"
     * "CO2 laser resurfacing is a great technique but may not adequately treat deeper scars.[1]"
     * "A serial, multimodal approach is essential.[1] Three sessions of combined therapy are recommended.[1]"
6. Cite sources consistently throughout your entire response - don't let citations drop off in later sections
7. When paraphrasing or directly referencing specific information, always include the source citation
8. At the END of your response, add a "### References" section with UNIQUE book titles (NO DUPLICATES):
   - Look CAREFULLY at each [Source X - "Book Title"] header in the knowledge base above
   - Extract the EXACT book title from the quotes after the dash in each header
   - CRITICAL: Group sources ONLY if they have the EXACT SAME book title string
   - Example: [Source 1 - "Book A"] and [Source 5 - "Book A"] → same book
   - Example: [Source 2 - "Book A"] and [Source 3 - "Book B"] → DIFFERENT books, do NOT group
   - Be precise - even slight differences in titles mean they are different books
   - Combine source numbers only when the book titles match character-by-character
   - Format: "[numbers] Book Title" (copy the exact title from the source headers)
   - List them in order of first appearance
   - Example format:
     ### References
     [1,5,8] Skin Care: Beyond the Basics, 4th Edition
     [2,6] Lasers in Dermatology and Medicine: Dermatologic Applications by Keyvan Nouri
     [3] Textbook of Cosmetic Dermatology
     [4,7] Cosmetic Dermatology: Principles and Practice
`;
            
            // Add conversation history
            if (conversationHistory.length > 0) {
                fullPrompt += 'Previous conversation:\n';
                conversationHistory.slice(-5).forEach(msg => {
                    fullPrompt += `${msg.role === 'user' ? 'Patient' : 'Dermatologist'}: ${msg.content}\n`;
                });
            }

            fullPrompt += `\nPatient: ${userMessage}\nDermatologist:`;

            // Generate response with retry logic
            const result = await this.generateWithRetry(fullPrompt);
            const response = await result.response;
            let text = response.text();

            console.log('🔍 Raw AI response (first 4000 chars):', text.substring(0, 4000));

            return {
                response: text, // Return markdown, let frontend handle HTML conversion
                method: 'rag-vector-search'
            };
        } catch (error) {
            console.error('Error generating RAG response:', error);
            
            // Check if it's a rate limit or overload error
            if (error.status === 503 || error.status === 429) {
                throw new Error('The AI service is currently overloaded. Please try again in a few moments.');
            }
            
            throw new Error('Failed to generate response with RAG context');
        }
    }

    /**
     * Transcribe audio file to text using FREE Gemini File API
     */
    async transcribeAudio(audioFilePath) {
        try {
            console.log('🎤 Starting Gemini audio transcription:', audioFilePath);
            
            // Get MIME type from file extension
            const mimeType = this.getMimeType(audioFilePath);
            console.log('📄 Audio MIME type:', mimeType);
            
            // Upload audio file to Gemini
            console.log('📤 Uploading audio file to Gemini...');
            const uploadResult = await fileManager.uploadFile(audioFilePath, {
                mimeType: mimeType,
                displayName: path.basename(audioFilePath),
            });
            console.log('✅ Upload successful! File URI:', uploadResult.file.uri);
            
            // Use Gemini to transcribe the audio
            console.log('🤖 Requesting transcription from Gemini...');
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
            const result = await model.generateContent([
                {
                    fileData: {
                        mimeType: uploadResult.file.mimeType,
                        fileUri: uploadResult.file.uri
                    }
                },
                { text: "Please transcribe the speech in this audio file. Only return the transcribed text without any additional commentary or formatting." },
            ]);
            
            const transcription = result.response.text().trim();
            console.log('✅ Gemini transcription successful:', transcription);
            
            // Clean up: delete the uploaded file from Gemini
            try {
                await fileManager.deleteFile(uploadResult.file.name);
                console.log('🗑️ Cleaned up uploaded file from Gemini');
            } catch (deleteError) {
                console.log('⚠️ Failed to delete file from Gemini:', deleteError.message);
            }
            
            return transcription;
            
        } catch (error) {
            console.error('❌ Gemini transcription error:', error);
            
            // Check if it's a model availability error
            if (error.message && error.message.includes('not found')) {
                console.log('⚠️ Gemini model not available, trying gemini-1.5-pro...');
                
                try {
                    // Try with gemini-1.5-pro as fallback
                    const uploadResult = await fileManager.uploadFile(audioFilePath, {
                        mimeType: this.getMimeType(audioFilePath),
                        displayName: path.basename(audioFilePath),
                    });
                    
                    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
                    const result = await model.generateContent([
                        {
                            fileData: {
                                mimeType: uploadResult.file.mimeType,
                                fileUri: uploadResult.file.uri
                            }
                        },
                        { text: "Please transcribe the speech in this audio file. Only return the transcribed text without any additional commentary or formatting." },
                    ]);
                    
                    const transcription = result.response.text().trim();
                    
                    // Cleanup
                    try {
                        await fileManager.deleteFile(uploadResult.file.name);
                    } catch (deleteError) {
                        console.log('⚠️ Failed to delete file:', deleteError.message);
                    }
                    
                    return transcription;
                    
                } catch (fallbackError) {
                    console.error('❌ Fallback to gemini-1.5-pro also failed:', fallbackError);
                    throw new Error('TRANSCRIPTION_NOT_AVAILABLE');
                }
            }
            
            throw new Error('TRANSCRIPTION_NOT_AVAILABLE');
        }
    }

    /**
     * Helper function to determine MIME type from file path
     */
    getMimeType(filePath) {
        const extension = filePath.split('.').pop().toLowerCase();
        const mimeTypes = {
            'm4a': 'audio/mp4',
            'mp4': 'audio/mp4',
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'aac': 'audio/aac',
            'ogg': 'audio/ogg',
            'flac': 'audio/flac'
        };
        return mimeTypes[extension] || 'audio/mp4';
    }
}

module.exports = new GeminiService();
