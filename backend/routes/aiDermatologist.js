const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const aiDermatologistController = require('../controllers/aiDermatologistController');

/**
 * POST /api/ai-dermatologist/chat
 * Send a message to the AI Dermatologist
 */
router.post('/chat', aiDermatologistController.chat);

module.exports = router;
