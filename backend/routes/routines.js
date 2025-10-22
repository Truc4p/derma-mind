const express = require('express');
const auth = require('../middleware/auth');
const routineController = require('../controllers/routineController');

const router = express.Router();

// @route   GET /api/routines
// @desc    Get routine templates
// @access  Public
router.get('/', routineController.getRoutines);

// @route   POST /api/routines/customize
// @desc    Get customized routine based on user profile
// @access  Public
router.post('/customize', routineController.customizeRoutine);

// @route   GET /api/routines/product-suggestions
// @desc    Get product suggestions for routine steps
// @access  Public
router.get('/product-suggestions', routineController.getProductSuggestions);

module.exports = router;
