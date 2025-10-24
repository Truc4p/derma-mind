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
 * @desc    Analyze a skin concern or query
 * @route   POST /api/ai-dermatologist/analyze
 * @access  Private
 */
exports.analyzeQuery = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const analysis = await geminiService.analyzeQuery(query);
        res.json(analysis);
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ 
            error: 'Failed to analyze query',
            message: error.message 
        });
    }
};

/**
 * @desc    Generate a personalized skincare routine
 * @route   POST /api/ai-dermatologist/routine
 * @access  Private
 */
exports.generateRoutine = async (req, res) => {
    try {
        const skinProfile = req.body;

        if (!skinProfile.skinType || !skinProfile.concerns) {
            return res.status(400).json({ 
                error: 'Skin type and concerns are required' 
            });
        }

        const routine = await geminiService.generateSkincareRoutine(skinProfile);
        res.json({
            routine,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Routine generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate routine',
            message: error.message 
        });
    }
};
