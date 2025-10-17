const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const auth = require('../middleware/auth');

/**
 * POST /api/ai-dermatologist/chat
 * Send a message to the AI Dermatologist
 */
router.post('/chat', auth, async (req, res) => {
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
});

/**
 * POST /api/ai-dermatologist/analyze
 * Analyze a skin concern or query
 */
router.post('/analyze', auth, async (req, res) => {
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
});

/**
 * POST /api/ai-dermatologist/routine
 * Generate a personalized skincare routine
 */
router.post('/routine', auth, async (req, res) => {
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
});

module.exports = router;
