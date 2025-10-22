const Ingredient = require('../models/Ingredient');

/**
 * @desc    Get all ingredients with filtering
 * @route   GET /api/ingredients
 * @access  Public
 */
exports.getAllIngredients = async (req, res) => {
  try {
    const { 
      category, 
      skinType, 
      concern, 
      page = 1, 
      limit = 20,
      search,
      sort = 'rating'
    } = req.query;
    
    const query = {};
    
    // Add filters
    if (category) query.category = category;
    if (concern) query['concerns.concern'] = concern;
    if (skinType) {
      query.$or = [
        { 'benefits.skinType': skinType },
        { 'benefits.skinType': 'all' }
      ];
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'rating':
        sortOption = { 'rating.average': -1, 'rating.count': -1 };
        break;
      case 'name':
        sortOption = { name: 1 };
        break;
      case 'category':
        sortOption = { category: 1, name: 1 };
        break;
      default:
        sortOption = { 'rating.average': -1 };
    }
    
    if (search) {
      sortOption = { score: { $meta: 'textScore' }, ...sortOption };
    }
    
    const ingredients = await Ingredient.find(query)
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('name alternativeNames category description benefits concerns safetyInfo.pregnancySafe safetyInfo.comedogenicRating rating tags');
    
    const total = await Ingredient.countDocuments(query);
    
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
    });
  } catch (error) {
    console.error('Get ingredients error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ingredients',
      error: error.message
    });
  }
};

/**
 * @desc    Get all ingredient categories
 * @route   GET /api/ingredients/categories
 * @access  Public
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Ingredient.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

/**
 * @desc    Search ingredients by name (for ingredient analysis)
 * @route   GET /api/ingredients/search
 * @access  Public
 */
exports.searchIngredients = async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        ingredients: []
      });
    }
    
    const searchTerm = q.trim();
    
    // Try exact match first
    let ingredients = await Ingredient.find({
      $or: [
        { name: { $regex: new RegExp(`^${searchTerm}$`, 'i') } },
        { alternativeNames: { $regex: new RegExp(`^${searchTerm}$`, 'i') } }
      ]
    }).limit(parseInt(limit));
    
    // If no exact match, try partial matches
    if (ingredients.length === 0) {
      ingredients = await Ingredient.find({
        $or: [
          { name: { $regex: new RegExp(searchTerm, 'i') } },
          { alternativeNames: { $regex: new RegExp(searchTerm, 'i') } }
        ]
      }).limit(parseInt(limit));
    }
    
    // If still no match, try text search
    if (ingredients.length === 0) {
      ingredients = await Ingredient.find({
        $text: { $search: searchTerm }
      }).limit(parseInt(limit));
    }
    
    res.json({
      success: true,
      ingredients
    });
  } catch (error) {
    console.error('Search ingredients error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching ingredients',
      error: error.message
    });
  }
};

/**
 * @desc    Search multiple ingredients at once (for ingredient analysis)
 * @route   POST /api/ingredients/batch-search
 * @access  Public
 */
exports.batchSearchIngredients = async (req, res) => {
  try {
    const { ingredients: ingredientNames } = req.body;
    
    if (!ingredientNames || !Array.isArray(ingredientNames)) {
      return res.status(400).json({
        success: false,
        message: 'Ingredients array is required'
      });
    }
    
    const results = await Promise.all(
      ingredientNames.map(async (name) => {
        if (!name || name.trim().length === 0) {
          return { query: name, ingredient: null };
        }
        
        const searchTerm = name.trim();
        
        // Try exact match first
        let ingredient = await Ingredient.findOne({
          $or: [
            { name: { $regex: new RegExp(`^${searchTerm}$`, 'i') } },
            { alternativeNames: { $regex: new RegExp(`^${searchTerm}$`, 'i') } }
          ]
        });
        
        // If no exact match, try partial matches
        if (!ingredient) {
          ingredient = await Ingredient.findOne({
            $or: [
              { name: { $regex: new RegExp(searchTerm, 'i') } },
              { alternativeNames: { $regex: new RegExp(searchTerm, 'i') } }
            ]
          });
        }
        
        // If still no match, try text search
        if (!ingredient) {
          const textResults = await Ingredient.find({
            $text: { $search: searchTerm }
          }).limit(1);
          ingredient = textResults.length > 0 ? textResults[0] : null;
        }
        
        return {
          query: name,
          ingredient: ingredient
        };
      })
    );
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Batch search ingredients error:', error);
    res.status(500).json({
      success: false,
      message: 'Error batch searching ingredients',
      error: error.message
    });
  }
};

/**
 * @desc    Get top-rated ingredients
 * @route   GET /api/ingredients/top-rated
 * @access  Public
 */
exports.getTopRatedIngredients = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const topIngredients = await Ingredient.find({ 'rating.count': { $gte: 5 } })
      .sort({ 'rating.average': -1, 'rating.count': -1 })
      .limit(limit)
      .select('name category description rating benefits');
    
    res.json({
      success: true,
      ingredients: topIngredients
    });
  } catch (error) {
    console.error('Get top-rated ingredients error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top-rated ingredients',
      error: error.message
    });
  }
};

/**
 * @desc    Get ingredients that help with specific concern
 * @route   GET /api/ingredients/by-concern/:concern
 * @access  Public
 */
exports.getIngredientsByConcern = async (req, res) => {
  try {
    const { concern } = req.params;
    const { skinType, limit = 10 } = req.query;
    
    const ingredients = await Ingredient.findByConcern(concern, skinType)
      .limit(parseInt(limit))
      .select('name category description concerns benefits rating safetyInfo.pregnancySafe');
    
    res.json({
      success: true,
      concern,
      ingredients
    });
  } catch (error) {
    console.error('Get ingredients by concern error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ingredients for concern',
      error: error.message
    });
  }
};

/**
 * @desc    Get search suggestions for ingredient names
 * @route   GET /api/ingredients/search-suggestions
 * @access  Public
 */
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        suggestions: []
      });
    }
    
    const suggestions = await Ingredient.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { alternativeNames: { $regex: q, $options: 'i' } }
      ]
    })
    .limit(8)
    .select('name alternativeNames category');
    
    const formattedSuggestions = suggestions.map(ingredient => ({
      name: ingredient.name,
      category: ingredient.category,
      alternatives: ingredient.alternativeNames
    }));
    
    res.json({
      success: true,
      suggestions: formattedSuggestions
    });
  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching search suggestions',
      error: error.message
    });
  }
};

/**
 * @desc    Get single ingredient by name
 * @route   GET /api/ingredients/:name
 * @access  Public
 */
exports.getIngredientByName = async (req, res) => {
  try {
    const ingredientName = decodeURIComponent(req.params.name);
    
    const ingredient = await Ingredient.findOne({
      $or: [
        { name: { $regex: `^${ingredientName}$`, $options: 'i' } },
        { alternativeNames: { $regex: `^${ingredientName}$`, $options: 'i' } }
      ]
    });
    
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
    }
    
    // Find related ingredients in the same category
    const relatedIngredients = await Ingredient.find({
      category: ingredient.category,
      _id: { $ne: ingredient._id }
    })
    .limit(5)
    .select('name category description rating');
    
    res.json({
      success: true,
      ingredient: {
        ...ingredient.toObject(),
        safetyScore: ingredient.safetyScore
      },
      relatedIngredients
    });
  } catch (error) {
    console.error('Get ingredient error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ingredient',
      error: error.message
    });
  }
};

/**
 * @desc    Rate an ingredient
 * @route   POST /api/ingredients/:name/rate
 * @access  Public
 */
exports.rateIngredient = async (req, res) => {
  try {
    const { rating } = req.body;
    const ingredientName = decodeURIComponent(req.params.name);
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const ingredient = await Ingredient.findOne({
      $or: [
        { name: { $regex: `^${ingredientName}$`, $options: 'i' } },
        { alternativeNames: { $regex: `^${ingredientName}$`, $options: 'i' } }
      ]
    });
    
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
    }
    
    // Update rating
    const currentTotal = ingredient.rating.average * ingredient.rating.count;
    ingredient.rating.count += 1;
    ingredient.rating.average = (currentTotal + rating) / ingredient.rating.count;
    
    await ingredient.save();
    
    res.json({
      success: true,
      message: 'Rating submitted successfully',
      newRating: {
        average: ingredient.rating.average,
        count: ingredient.rating.count
      }
    });
  } catch (error) {
    console.error('Rate ingredient error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting rating',
      error: error.message
    });
  }
};

/**
 * @desc    Get ingredient interactions and compatibility
 * @route   GET /api/ingredients/:name/interactions
 * @access  Public
 */
exports.getIngredientInteractions = async (req, res) => {
  try {
    const ingredientName = decodeURIComponent(req.params.name);
    
    const ingredient = await Ingredient.findOne({
      $or: [
        { name: { $regex: `^${ingredientName}$`, $options: 'i' } },
        { alternativeNames: { $regex: `^${ingredientName}$`, $options: 'i' } }
      ]
    }).select('name interactions');
    
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingredient not found'
      });
    }
    
    res.json({
      success: true,
      ingredient: ingredient.name,
      interactions: ingredient.interactions
    });
  } catch (error) {
    console.error('Get interactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching interactions',
      error: error.message
    });
  }
};
