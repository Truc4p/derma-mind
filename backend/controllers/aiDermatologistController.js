const geminiService = require('../services/geminiService');
const vectorService = require('../services/vectorService');

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
