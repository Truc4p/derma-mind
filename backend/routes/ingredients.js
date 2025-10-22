const express = require('express');
const ingredientController = require('../controllers/ingredientController');

const router = express.Router();

// @route   GET /api/ingredients
// @desc    Get all ingredients with filtering
// @access  Public
router.get('/', ingredientController.getAllIngredients);

// @route   GET /api/ingredients/categories
// @desc    Get all ingredient categories
// @access  Public
router.get('/categories', ingredientController.getCategories);

// @route   GET /api/ingredients/search
// @desc    Search ingredients by name (for ingredient analysis)
// @access  Public
router.get('/search', ingredientController.searchIngredients);

// @route   POST /api/ingredients/batch-search
// @desc    Search multiple ingredients at once (for ingredient analysis)
// @access  Public
router.post('/batch-search', ingredientController.batchSearchIngredients);

// @route   GET /api/ingredients/top-rated
// @desc    Get top-rated ingredients
// @access  Public
router.get('/top-rated', ingredientController.getTopRatedIngredients);

// @route   GET /api/ingredients/by-concern/:concern
// @desc    Get ingredients that help with specific concern
// @access  Public
router.get('/by-concern/:concern', ingredientController.getIngredientsByConcern);

// @route   GET /api/ingredients/search-suggestions
// @desc    Get search suggestions for ingredient names
// @access  Public
router.get('/search-suggestions', ingredientController.getSearchSuggestions);

// @route   GET /api/ingredients/:name
// @desc    Get single ingredient by name
// @access  Public
router.get('/:name', ingredientController.getIngredientByName);

// @route   POST /api/ingredients/:name/rate
// @desc    Rate an ingredient
// @access  Public
router.post('/:name/rate', ingredientController.rateIngredient);

// @route   GET /api/ingredients/:name/interactions
// @desc    Get ingredient interactions and compatibility
// @access  Public
router.get('/:name/interactions', ingredientController.getIngredientInteractions);

module.exports = router;
