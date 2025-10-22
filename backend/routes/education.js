const express = require('express');
const educationController = require('../controllers/educationController');

const router = express.Router();

// @route   GET /api/education
// @desc    Get all published education content
// @access  Public
router.get('/', educationController.getAllContent);

// @route   GET /api/education/categories
// @desc    Get all categories and their counts
// @access  Public
router.get('/categories', educationController.getCategories);

// @route   GET /api/education/popular
// @desc    Get popular education content
// @access  Public
router.get('/popular', educationController.getPopularContent);

// @route   GET /api/education/featured
// @desc    Get featured education content
// @access  Public
router.get('/featured', educationController.getFeaturedContent);

// @route   GET /api/education/recommendations
// @desc    Get personalized content recommendations
// @access  Private (optional)
router.get('/recommendations', educationController.getRecommendations);

// @route   GET /api/education/:slug
// @desc    Get single education content by slug
// @access  Public
router.get('/:slug', educationController.getContentBySlug);

// @route   POST /api/education/:slug/rate
// @desc    Rate education content
// @access  Public
router.post('/:slug/rate', educationController.rateContent);

// @route   POST /api/education/:slug/like
// @desc    Like education content
// @access  Public
router.post('/:slug/like', educationController.likeContent);

module.exports = router;
