const geminiService = require('../services/geminiService');
const vectorService = require('../services/vectorService');
const fs = require('fs').promises;
const path = require('path');

/**
 * @desc    Send a message to the AI Dermatologist
 * @route   POST /api/ai-dermatologist/chat
 * @access  Public
 */
exports.chat = async (req, res) => {
    try {
        const { message, conversationHistory } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Use RAG to retrieve relevant context
        const ragResult = await vectorService.ragQuery(message, conversationHistory || []);

        // Generate response using Gemini with retrieved context
        const result = await geminiService.generateResponseWithContext(
            message,
            ragResult.context,
            conversationHistory || []
        );

        res.json({
            response: result.response,
            sources: ragResult.sources,
            images: result.images || [],
            timestamp: new Date()
        });
    } catch (error) {
        console.error('AI Chat error:', error);
        
        // Determine appropriate user-facing error message
        let userMessage = 'Failed to generate response';
        let statusCode = 500;
        
        if (error.message.includes('overloaded')) {
            userMessage = 'The AI service is currently experiencing high traffic. Please try again in a moment.';
            statusCode = 503;
        } else if (error.message.includes('rate limit')) {
            userMessage = 'Too many requests. Please wait a moment and try again.';
            statusCode = 429;
        }
        
        res.status(statusCode).json({ 
            error: userMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Transcribe audio to text using Gemini
 * @route   POST /api/ai-dermatologist/transcribe
 * @access  Public
 */
exports.transcribeAudio = async (req, res) => {
    let tempFilePath = null;
    
    try {
        const requestStartTime = Date.now();
        console.log('\n=== 📥 [BACKEND] TRANSCRIPTION REQUEST RECEIVED ===');
        console.log('⏰ [BACKEND] Request time:', new Date().toISOString());
        
        // Check if file was uploaded
        if (!req.file) {
            console.error('❌ [BACKEND] No file in request');
            return res.status(400).json({ error: 'No audio file provided' });
        }

        console.log('📁 [BACKEND] File details:', {
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            sizeInMB: (req.file.size / 1024 / 1024).toFixed(2) + ' MB'
        });

        tempFilePath = req.file.path;

        console.log('🎤 [BACKEND] Calling geminiService.transcribeAudio...');
        const transcribeStartTime = Date.now();
        
        // Transcribe the audio using Gemini/AssemblyAI
        const transcribedText = await geminiService.transcribeAudio(tempFilePath);
        
        const transcribeDuration = Date.now() - transcribeStartTime;
        console.log(`✅ [BACKEND] Transcription completed in ${transcribeDuration}ms`);

        // Clean up the temporary file
        console.log('🗑️ [BACKEND] Cleaning up temp file:', tempFilePath);
        await fs.unlink(tempFilePath);
        tempFilePath = null;

        const totalDuration = Date.now() - requestStartTime;
        console.log(`✅ [BACKEND] Request completed in ${totalDuration}ms`);
        console.log('=== ✅ [BACKEND] TRANSCRIPTION SUCCESS ===\n');

        res.json({
            transcription: transcribedText,
            timestamp: new Date(),
            processingTime: totalDuration
        });
    } catch (error) {
        console.error('\n=== ❌ [BACKEND] TRANSCRIPTION ERROR ===');
        console.error('❌ [BACKEND] Error type:', error.name);
        console.error('❌ [BACKEND] Error message:', error.message);
        console.error('❌ [BACKEND] Full error:', error);
        console.error('=== ❌ [BACKEND] ERROR END ===\n');
        
        // Clean up temp file if it exists
        if (tempFilePath) {
            try {
                console.log('🗑️ [BACKEND] Cleaning up temp file after error');
                await fs.unlink(tempFilePath);
            } catch (unlinkError) {
                console.error('Error deleting temp file:', unlinkError);
            }
        }
        
        res.status(500).json({ 
            error: 'Failed to transcribe audio',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
