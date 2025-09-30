const express = require('express')
const Ingredient = require('../models/Ingredient')

const router = express.Router()

// @route   GET /api/ingredients
// @desc    Get all ingredients with filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      skinType, 
      concern, 
      page = 1, 
      limit = 20,
      search,
      sort = 'rating'
    } = req.query
    
    const query = {}
    
    // Add filters
    if (category) query.category = category
    if (concern) query['concerns.concern'] = concern
    if (skinType) {
      query.$or = [
        { 'benefits.skinType': skinType },
        { 'benefits.skinType': 'all' }
      ]
    }
    
    if (search) {
      query.$text = { $search: search }
    }
    
    // Sort options
    let sortOption = {}
    switch (sort) {
      case 'rating':
        sortOption = { 'rating.average': -1, 'rating.count': -1 }
        break
      case 'name':
        sortOption = { name: 1 }
        break
      case 'category':
        sortOption = { category: 1, name: 1 }
        break
      default:
        sortOption = { 'rating.average': -1 }
    }
    
    if (search) {
      sortOption = { score: { $meta: 'textScore' }, ...sortOption }
    }
    
    const ingredients = await Ingredient.find(query)
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('name alternativeNames category description benefits concerns safetyInfo.pregnancySafe safetyInfo.comedogenicRating rating tags')
    
    const total = await Ingredient.countDocuments(query)
    
    res.json({
      success: true,
      ingredients,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    })
  } catch (error) {
    console.error('Get ingredients error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching ingredients',
      error: error.message
    })
  }
})

// @route   GET /api/ingredients/categories
// @desc    Get all ingredient categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Ingredient.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])
    
    res.json({
      success: true,
      categories
    })
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    })
  }
})

// @route   GET /api/ingredients/top-rated
// @desc    Get top-rated ingredients
// @access  Public
router.get('/top-rated', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    
    const topIngredients = await Ingredient.find({ 'rating.count': { $gte: 5 } })
      .sort({ 'rating.average': -1, 'rating.count': -1 })
      .limit(limit)
      .select('name category description rating benefits')
    
    res.json({
      success: true,
      ingredients: topIngredients
    })
  } catch (error) {
    console.error('Get top-rated ingredients error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching top-rated ingredients',
      error: error.message
    })
  }
})

// @route   GET /api/ingredients/by-concern/:concern
// @desc    Get ingredients that help with specific concern
// @access  Public
router.get('/by-concern/:concern', async (req, res) => {
  try {
    const { concern } = req.params
    const { skinType, limit = 10 } = req.query
    
    const ingredients = await Ingredient.findByConcern(concern, skinType)
      .limit(parseInt(limit))
      .select('name category description concerns benefits rating safetyInfo.pregnancySafe')
    
    res.json({
      success: true,
      concern,
      ingredients
    })
  } catch (error) {
    console.error('Get ingredients by concern error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching ingredients for concern',
      error: error.message
    })
  }
})

// @route   GET /api/ingredients/search-suggestions
// @desc    Get search suggestions for ingredient names
// @access  Public
router.get('/search-suggestions', async (req, res) => {
  try {
    const { q } = req.query
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        suggestions: []
      })
    }
    
    const suggestions = await Ingredient.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { alternativeNames: { $regex: q, $options: 'i' } }
      ]
    })
    .limit(8)
    .select('name alternativeNames category')
    
    const formattedSuggestions = suggestions.map(ingredient => ({
      name: ingredient.name,
      category: ingredient.category,
      alternatives: ingredient.alternativeNames
    }))
    
    res.json({
      success: true,
      suggestions: formattedSuggestions
    })
  } catch (error) {
    console.error('Get search suggestions error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching search suggestions',
      error: error.message
    })
  }
})

// @route   GET /api/ingredients/:name
// @desc    Get single ingredient by name
// @access  Public
router.get('/:name', async (req, res) => {
  try {
    const ingredientName = decodeURIComponent(req.params.name)
    
    const ingredient = await Ingredient.findOne({
      $or: [
        { name: { $regex: `^${ingredientName}$`, $options: 'i' } },
        { alternativeNames: { $regex: `^${ingredientName}$`, $options: 'i' } }
      ]
    })
    
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      })
    }
    
    // Find related ingredients in the same category
    const relatedIngredients = await Ingredient.find({
      category: ingredient.category,
      _id: { $ne: ingredient._id }
    })
    .limit(5)
    .select('name category description rating')
    
    res.json({
      success: true,
      ingredient: {
        ...ingredient.toObject(),
        safetyScore: ingredient.safetyScore
      },
      relatedIngredients
    })
  } catch (error) {
    console.error('Get ingredient error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching ingredient',
      error: error.message
    })
  }
})

// @route   POST /api/ingredients/:name/rate
// @desc    Rate an ingredient
// @access  Public
router.post('/:name/rate', async (req, res) => {
  try {
    const { rating } = req.body
    const ingredientName = decodeURIComponent(req.params.name)
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      })
    }
    
    const ingredient = await Ingredient.findOne({
      $or: [
        { name: { $regex: `^${ingredientName}$`, $options: 'i' } },
        { alternativeNames: { $regex: `^${ingredientName}$`, $options: 'i' } }
      ]
    })
    
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      })
    }
    
    // Update rating
    const currentTotal = ingredient.rating.average * ingredient.rating.count
    ingredient.rating.count += 1
    ingredient.rating.average = (currentTotal + rating) / ingredient.rating.count
    
    await ingredient.save()
    
    res.json({
      success: true,
      message: 'Rating submitted successfully',
      newRating: {
        average: ingredient.rating.average,
        count: ingredient.rating.count
      }
    })
  } catch (error) {
    console.error('Rate ingredient error:', error)
    res.status(500).json({
      success: false,
      message: 'Error submitting rating',
      error: error.message
    })
  }
})

// @route   GET /api/ingredients/:name/interactions
// @desc    Get ingredient interactions and compatibility
// @access  Public
router.get('/:name/interactions', async (req, res) => {
  try {
    const ingredientName = decodeURIComponent(req.params.name)
    
    const ingredient = await Ingredient.findOne({
      $or: [
        { name: { $regex: `^${ingredientName}$`, $options: 'i' } },
        { alternativeNames: { $regex: `^${ingredientName}$`, $options: 'i' } }
      ]
    }).select('name interactions')
    
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      })
    }
    
    res.json({
      success: true,
      ingredient: ingredient.name,
      interactions: ingredient.interactions
    })
  } catch (error) {
    console.error('Get interactions error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching interactions',
      error: error.message
    })
  }
})

module.exports = router