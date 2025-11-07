const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const aiDermatologistController = require('../controllers/aiDermatologistController');

// Configure multer for audio file uploads
const audioStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/audio/'); // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const audioUpload = multer({ 
    storage: audioStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        console.log('📋 [MULTER] Incoming audio file:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });
        
        // Accept audio files only
        const allowedMimes = ['audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/aac'];
        if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
            console.log('✅ [MULTER] Audio file accepted');
            cb(null, true);
        } else {
            console.error('❌ [MULTER] File rejected - invalid mimetype');
            cb(new Error('Only audio files are allowed'));
        }
    }
});

// Configure multer for image file uploads
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/images/'); // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'skin-image-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const imageUpload = multer({ 
    storage: imageStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        console.log('📋 [MULTER] Incoming image file:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });
        
        // Accept image files only
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            console.log('✅ [MULTER] Image file accepted');
            cb(null, true);
        } else {
            console.error('❌ [MULTER] File rejected - invalid mimetype');
            cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
        }
    }
});

/**
 * POST /api/ai-dermatologist/chat
 * Send a message to the AI Dermatologist
 */
router.post('/chat', aiDermatologistController.chat);

/**
 * POST /api/ai-dermatologist/analyze-skin
 * Analyze skin image with AI Dermatologist
 */
router.post('/analyze-skin', imageUpload.single('image'), aiDermatologistController.analyzeSkinImage);

/**
 * POST /api/ai-dermatologist/transcribe
 * Transcribe audio to text
 */
router.post('/transcribe', audioUpload.single('audio'), aiDermatologistController.transcribeAudio);

/**
 * POST /api/ai-dermatologist/text-to-speech
 * Convert text to speech using Google Cloud TTS
 */
router.post('/text-to-speech', aiDermatologistController.textToSpeech);

module.exports = router;
