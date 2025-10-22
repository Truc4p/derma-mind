const geminiService = require('../services/geminiService');

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

        // Generate response using Gemini with knowledge base
        const result = await geminiService.generateResponse(
            message,
            conversationHistory || []
        );

        res.json({
            response: result.response,
            sources: result.knowledgeSources,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('AI Chat error:', error);
        res.status(500).json({ 
            error: 'Failed to generate response',
            message: error.message 
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
