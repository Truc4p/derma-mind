const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const aiDermatologistController = require('../controllers/aiDermatologistController');

// Configure multer for audio file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/audio/'); // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        console.log('📋 [MULTER] Incoming file:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });
        
        // Accept audio files only
        const allowedMimes = ['audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/aac'];
        if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
            console.log('✅ [MULTER] File accepted');
            cb(null, true);
        } else {
            console.error('❌ [MULTER] File rejected - invalid mimetype');
            cb(new Error('Only audio files are allowed'));
        }
    }
});

/**
 * POST /api/ai-dermatologist/chat
 * Send a message to the AI Dermatologist
 */
router.post('/chat', aiDermatologistController.chat);

/**
 * POST /api/ai-dermatologist/transcribe
 * Transcribe audio to text
 */
router.post('/transcribe', upload.single('audio'), aiDermatologistController.transcribeAudio);

/**
 * POST /api/ai-dermatologist/text-to-speech
 * Convert text to speech using Google Cloud TTS
 */
router.post('/text-to-speech', aiDermatologistController.textToSpeech);

module.exports = router;
