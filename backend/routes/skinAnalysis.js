const express = require('express');
const auth = require('../middleware/auth');
const skinAnalysisController = require('../controllers/skinAnalysisController');

const router = express.Router();

// @route   POST /api/skin-analysis/analyze
// @desc    Perform skin analysis
// @access  Public
router.post('/analyze', skinAnalysisController.analyzeSkin);

// @route   GET /api/skin-analysis/history
// @desc    Get user's analysis history
// @access  Private
router.get('/history', auth, skinAnalysisController.getAnalysisHistory);

// @route   GET /api/skin-analysis/:sessionId
// @desc    Get specific analysis results
// @access  Public
router.get('/:sessionId', skinAnalysisController.getAnalysisById);

// @route   GET /api/skin-analysis/stats/overview
// @desc    Get analysis statistics (admin)
// @access  Private (admin only)
router.get('/stats/overview', auth, skinAnalysisController.getAnalysisStats);

module.exports = router;
