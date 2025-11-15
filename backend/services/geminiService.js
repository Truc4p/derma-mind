require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const DermatologyKnowledge = require('../models/DermatologyKnowledge');
const fs = require('fs').promises;
const performanceMonitor = require('../utils/performanceMonitor');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiService {
    constructor() {
        this.model = genAI.getGenerativeModel({ 
            model: 'gemini-2.0-flash', // Using faster experimental model
            generationConfig: {
                temperature: 0.7,  // Slightly reduced for faster, more focused responses
                topP: 0.9,
                topK: 40,          // Reduced for faster token selection
                maxOutputTokens: 4096, // OPTIMIZED: Reduced from 8192 for faster generation
            }
        });
        
        // Translation model for non-English queries
        this.translationModel = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                temperature: 0.1, // Low temperature for accurate translation
                maxOutputTokens: 500,
            }
        });
        
        // Retry configuration for rate limiting
        this.maxRetries = 3;
        this.retryDelay = 1000; // Start with 1 second
        
        // System instruction for the Dermatology Expert
        this.systemContext = `You are a Virtual Dermatology Expert with extensive knowledge in:
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
     * Detect if text is in a non-English language and needs translation
     */
    async detectAndTranslate(text) {
        try {
            console.log(`🌐 Detecting language for text: "${text}"`);
            
            // Always use Gemini for language detection (more reliable than ASCII check)
            // This handles German, French, Spanish which use mostly ASCII characters
            const prompt = `Analyze this text and respond ONLY with a JSON object (no markdown, no code blocks):
{
  "language": "<detected language code like 'en', 'vi', 'de', 'zh', 'ja', 'fr', 'es', etc.>",
  "languageName": "<language name like 'English', 'Vietnamese', 'German', 'Chinese', etc.>",
  "translation": "<English translation of the text if not English, or same text if English>"
}

Text to analyze: "${text}"

IMPORTANT: 
- Return ONLY the JSON object, nothing else
- If the text is in English, set language to 'en' and translation to the same text
- Be accurate with language detection`;

            const result = await this.translationModel.generateContent(prompt);
            const response = await result.response;
            let responseText = response.text().trim();
            
            // Remove markdown code blocks if present
            responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            
            console.log('🔍 Translation API response:', responseText);
            
            const parsed = JSON.parse(responseText);
            
            const isEnglish = parsed.language === 'en' || parsed.language === 'eng' || parsed.language.toLowerCase() === 'english';
            
            console.log(`✅ Detected language: ${parsed.languageName} (${parsed.language})`);
            if (!isEnglish) {
                console.log(`🔄 English translation: "${parsed.translation}"`);
            } else {
                console.log(`✅ Text is already in English, no translation needed`);
            }
            
            return {
                isEnglish: isEnglish,
                originalText: text,
                translatedText: parsed.translation,
                detectedLanguage: parsed.language,
                languageName: parsed.languageName
            };
        } catch (error) {
            console.error('⚠️ Translation failed, using original text:', error.message);
            // Fallback: use original text if translation fails
            return { isEnglish: true, originalText: text, translatedText: text, detectedLanguage: 'unknown' };
        }
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
            
            // Detect language and translate if needed
            const translationResult = await this.detectAndTranslate(userMessage);
            const queryForRAG = translationResult.translatedText; // Use translated text for better RAG results
            const shouldTranslateResponse = !translationResult.isEnglish;
            
            // Build prompt with RAG context
            let fullPrompt = this.systemContext;
            
            // Add language instruction if user is using non-English
            if (shouldTranslateResponse) {
                fullPrompt += `\n\nIMPORTANT: The user is communicating in ${translationResult.languageName}. You MUST respond in ${translationResult.languageName}, not English.`;
            }
            
            // Add RAG context
            fullPrompt += '\n\n=== RELEVANT KNOWLEDGE FROM DERMATOLOGY TEXTBOOK ===\n';
            fullPrompt += ragContext;
            fullPrompt += '\n=== END OF KNOWLEDGE BASE ===\n\n';
            
            fullPrompt += `CRITICAL INSTRUCTIONS:
1. Use the information from the knowledge base above to provide accurate, evidence-based answers
2. Be comprehensive but concise - focus on the most relevant information for the user's specific question
3. When the knowledge base contains step-by-step procedures, numbered lists, or treatment protocols:
   - Include the ALL steps
   - Maintain the original sequence
   - Include key details and specific instructions
4. Structure your response clearly with headers and bullet points for readability

CITATION REQUIREMENT (Numbered Reference Style):
5. ALWAYS cite your sources inline using bracketed numbers when making statements based on the knowledge base
   - Use bracketed superscript format: [1], [2], [3], etc. to reference the source chunks
   - Place citation numbers at the end of sentences or clauses where you use information from that source
   - For multiple sources, list them together: [1,3] for consecutive numbers (not [1-3] or [1, 3])
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
                    fullPrompt += `${msg.role === 'user' ? 'Patient' : 'Dermatology Expert'}: ${msg.content}\n`;
                });
            }

            fullPrompt += `\nPatient: ${userMessage}\nDermatology Expert:`;

            // Generate response with retry logic
            const genStart = performanceMonitor.startTimer();
            const result = await this.generateWithRetry(fullPrompt);
            const response = await result.response;
            let text = response.text();
            const genTime = performanceMonitor.endTimer(genStart);
            
            performanceMonitor.record('aiGeneration', genTime);
            console.log(`⏱️ AI Generation: ${genTime}ms`);
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
     * Transcribe audio file to text using Gemini's multimodal capabilities
     */
    async transcribeAudio(audioFilePath) {
        const startTime = Date.now();
        try {
            console.log('\n=== 🎤️ [GEMINI SERVICE] TRANSCRIPTION REQUEST ===');
            console.log('⏰ [GEMINI SERVICE] Start time:', new Date().toISOString());
            console.log('📁 [GEMINI SERVICE] Audio file:', audioFilePath);
            
            // Use Gemini's multimodal model for audio transcription
            console.log('🚀 [GEMINI SERVICE] Using Gemini multimodal transcription...');
            
            // Read audio file
            const audioData = await fs.readFile(audioFilePath);
            const base64Audio = audioData.toString('base64');
            const mimeType = this.getMimeType(audioFilePath);
            
            console.log(`📊 [GEMINI SERVICE] Audio size: ${audioData.length} bytes, MIME: ${mimeType}`);
            
            // Use Gemini's multimodal model for transcription
            const model = genAI.getGenerativeModel({ 
                model: 'gemini-2.0-flash' // Supports audio input
            });
            
            const result = await model.generateContent([
                {
                    inlineData: {
                        data: base64Audio,
                        mimeType: mimeType
                    }
                },
                'Transcribe this audio to text. Provide only the transcription without any additional commentary or formatting.'
            ]);
            
            const response = await result.response;
            const transcription = response.text().trim();
            
            const duration = Date.now() - startTime;
            console.log(`✅ [GEMINI SERVICE] Transcription completed in ${duration}ms`);
            console.log('📝 [GEMINI SERVICE] Result:', transcription);
            console.log('=== ✅ [GEMINI SERVICE] SUCCESS ===\n');
            
            return transcription;
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`❌ [GEMINI SERVICE] Transcription failed after ${duration}ms:`, error.message);
            throw new Error('Failed to transcribe audio: ' + error.message);
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

    /**
     * Analyze skin image and provide dermatological assessment
     */
    async analyzeSkinImage(imageFilePath, userMessage, ragContext, conversationHistory = []) {
        const startTime = Date.now();
        try {
            console.log('\n=== 🖼️ [GEMINI SERVICE] SKIN IMAGE ANALYSIS REQUEST ===');
            console.log('⏰ [GEMINI SERVICE] Start time:', new Date().toISOString());
            console.log('📁 [GEMINI SERVICE] Image file:', imageFilePath);
            console.log('💬 [GEMINI SERVICE] User message:', userMessage);
            
            // Read image file
            const imageData = await fs.readFile(imageFilePath);
            const base64Image = imageData.toString('base64');
            const imageMimeType = this.getImageMimeType(imageFilePath);
            
            console.log(`📊 [GEMINI SERVICE] Image size: ${imageData.length} bytes, MIME: ${imageMimeType}`);
            
            // Build comprehensive prompt for skin analysis
            let fullPrompt = `You are an expert Virtual Dermatology Expert analyzing a skin image. Provide a detailed, professional assessment.

=== RELEVANT KNOWLEDGE FROM DERMATOLOGY TEXTBOOK ===
${ragContext}
=== END OF KNOWLEDGE BASE ===

ANALYSIS INSTRUCTIONS:
1. Carefully examine the image for any visible skin conditions, concerns, or features
2. Describe what you observe in the image (texture, color, lesions, inflammation, etc.)
3. Provide possible conditions or concerns based on visible features (if any)
4. Use the knowledge base above to provide evidence-based recommendations
5. Suggest appropriate skincare routines, products, or treatments
6. Cite your sources using bracketed numbers [1], [2], etc. when referencing the knowledge base
7. Include a "### References" section at the end with unique book titles

IMPORTANT DISCLAIMERS:
- This is an AI assessment and NOT a medical diagnosis
- Always recommend consulting a dermatologist in-person for proper diagnosis
- If the image shows concerning features, emphasize the importance of professional evaluation

`;
            
            // Add conversation history
            if (conversationHistory.length > 0) {
                fullPrompt += 'Previous conversation:\n';
                conversationHistory.slice(-5).forEach(msg => {
                    if (msg.role === 'user' && !msg.image) {
                        fullPrompt += `Patient: ${msg.content}\n`;
                    } else if (msg.role === 'assistant') {
                        fullPrompt += `Dermatology Expert: ${msg.content}\n`;
                    }
                });
            }

            fullPrompt += `\nPatient's question: ${userMessage}\n\nProvide your detailed analysis:`;
            
            // Use Gemini's vision model for image analysis
            const visionModel = genAI.getGenerativeModel({ 
                model: 'gemini-2.0-flash', // Supports vision input
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.9,
                    topK: 40,
                    maxOutputTokens: 4096,
                }
            });
            
            console.log('🚀 [GEMINI SERVICE] Analyzing image with Gemini Vision...');
            const genStart = performanceMonitor.startTimer();
            
            // Use retry logic for image analysis
            let result;
            let retryAttempt = 0;
            const maxRetries = 3;
            
            while (retryAttempt < maxRetries) {
                try {
                    result = await visionModel.generateContent([
                        {
                            inlineData: {
                                data: base64Image,
                                mimeType: imageMimeType
                            }
                        },
                        fullPrompt
                    ]);
                    break; // Success, exit retry loop
                } catch (error) {
                    const isRateLimitError = error.message.includes('429') || 
                                            error.message.includes('rate limit') ||
                                            error.message.includes('RESOURCE_EXHAUSTED') ||
                                            error.status === 429 ||
                                            error.status === 503;
                    
                    if (!isRateLimitError || retryAttempt >= maxRetries - 1) {
                        throw error; // Not rate limit or exhausted retries
                    }
                    
                    retryAttempt++;
                    const delay = 2000 * Math.pow(2, retryAttempt - 1); // 2s, 4s, 8s
                    console.log(`⏳ [GEMINI SERVICE] Rate limited. Retrying in ${delay}ms (attempt ${retryAttempt}/${maxRetries})...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
            
            const response = await result.response;
            const analysisText = response.text().trim();
            
            const genTime = performanceMonitor.endTimer(genStart);
            const duration = Date.now() - startTime;
            
            performanceMonitor.record('imageAnalysis', genTime);
            console.log(`⏱️ Image Analysis: ${genTime}ms`);
            console.log(`✅ [GEMINI SERVICE] Analysis completed in ${duration}ms`);
            console.log('📝 [GEMINI SERVICE] Result (first 500 chars):', analysisText.substring(0, 500));
            console.log('=== ✅ [GEMINI SERVICE] SUCCESS ===\n');
            
            return {
                response: analysisText,
                method: 'vision-analysis-with-rag'
            };
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`❌ [GEMINI SERVICE] Image analysis failed after ${duration}ms:`, error.message);
            throw new Error('Failed to analyze skin image: ' + error.message);
        }
    }

    /**
     * Helper function to determine image MIME type from file path
     */
    getImageMimeType(filePath) {
        const extension = filePath.split('.').pop().toLowerCase();
        const mimeTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'bmp': 'image/bmp'
        };
        return mimeTypes[extension] || 'image/jpeg';
    }
}

module.exports = new GeminiService();
