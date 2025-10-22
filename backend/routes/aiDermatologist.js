const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const aiDermatologistController = require('../controllers/aiDermatologistController');

/**
 * POST /api/ai-dermatologist/chat
 * Send a message to the AI Dermatologist
 */
router.post('/chat', aiDermatologistController.chat);

/**
 * POST /api/ai-dermatologist/analyze
 * Analyze a skin concern or query
 */
router.post('/analyze', auth, aiDermatologistController.analyzeQuery);

/**
 * POST /api/ai-dermatologist/routine
 * Generate a personalized skincare routine
 */
router.post('/routine', auth, aiDermatologistController.generateRoutine);

module.exports = router;
