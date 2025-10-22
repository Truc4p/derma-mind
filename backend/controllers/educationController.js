const EducationContent = require('../models/EducationContent');

/**
 * @desc    Get all published education content
 * @route   GET /api/education
 * @access  Public
 */
exports.getAllContent = async (req, res) => {
  try {
    const { 
      category, 
      skinType, 
      concern, 
      difficulty, 
      page = 1, 
      limit = 12,
      search,
      featured
    } = req.query;
    
    const query = { status: 'published' };
    
    // Add filters
    if (category) query.category = category;
    if (difficulty) query['targetAudience.experienceLevel'] = difficulty;
    if (featured === 'true') query.featured = true;
    
    if (skinType) {
      query.$or = [
        { 'targetAudience.skinTypes': skinType },
        { 'targetAudience.skinTypes': 'all' }
      ];
    }
    
    if (concern) {
      query['targetAudience.concerns'] = { $in: [concern, 'general'] };
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: search ? { score: { $meta: 'textScore' } } : { 'engagement.rating.average': -1, publishDate: -1 },
      select: 'title slug category subcategory content.summary media.featuredImage metadata.readingTime metadata.difficulty engagement.rating publishDate featured'
    };
    
    const result = await EducationContent.find(query)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit)
      .select(options.select);
    
    const total = await EducationContent.countDocuments(query);
    
    res.json({
      success: true,
      content: result,
      pagination: {
        current: options.page,
        pages: Math.ceil(total / options.limit),
        total,
        hasNext: options.page * options.limit < total,
        hasPrev: options.page > 1
      }
    });
  } catch (error) {
    console.error('Get education content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching education content',
      error: error.message
    });
  }
};

/**
 * @desc    Get all categories and their counts
 * @route   GET /api/education/categories
 * @access  Public
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await EducationContent.aggregate([
      { $match: { status: 'published' } },
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
 * @desc    Get popular education content
 * @route   GET /api/education/popular
 * @access  Public
 */
exports.getPopularContent = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    const popularContent = await EducationContent.getPopular(limit);
    
    res.json({
      success: true,
      content: popularContent
    });
  } catch (error) {
    console.error('Get popular content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular content',
      error: error.message
    });
  }
};

/**
 * @desc    Get featured education content
 * @route   GET /api/education/featured
 * @access  Public
 */
exports.getFeaturedContent = async (req, res) => {
  try {
    const featuredContent = await EducationContent.find({ 
      status: 'published', 
      featured: true 
    })
    .sort({ publishDate: -1 })
    .limit(3)
    .select('title slug category content.summary media.featuredImage metadata.readingTime');
    
    res.json({
      success: true,
      content: featuredContent
    });
  } catch (error) {
    console.error('Get featured content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured content',
      error: error.message
    });
  }
};

/**
 * @desc    Get personalized content recommendations
 * @route   GET /api/education/recommendations
 * @access  Private (optional)
 */
exports.getRecommendations = async (req, res) => {
  try {
    const { skinType, concerns } = req.query;
    
    if (!skinType) {
      return res.status(400).json({
        success: false,
        message: 'Skin type is required for recommendations'
      });
    }
    
    const concernsArray = concerns ? concerns.split(',') : [];
    
    const recommendations = await EducationContent.findForAudience(
      skinType, 
      concernsArray, 
      'beginner'
    ).limit(8);
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recommendations',
      error: error.message
    });
  }
};

/**
 * @desc    Get single education content by slug
 * @route   GET /api/education/:slug
 * @access  Public
 */
exports.getContentBySlug = async (req, res) => {
  try {
    const content = await EducationContent.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    }).populate('relatedTopics', 'title slug category content.summary');
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    // Increment view count
    await content.incrementViews();
    
    res.json({
      success: true,
      content
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content',
      error: error.message
    });
  }
};

/**
 * @desc    Rate education content
 * @route   POST /api/education/:slug/rate
 * @access  Public
 */
exports.rateContent = async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const content = await EducationContent.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    });
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    await content.addRating(rating);
    
    res.json({
      success: true,
      message: 'Rating submitted successfully',
      newRating: {
        average: content.engagement.rating.average,
        count: content.engagement.rating.count
      }
    });
  } catch (error) {
    console.error('Rate content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting rating',
      error: error.message
    });
  }
};

/**
 * @desc    Like education content
 * @route   POST /api/education/:slug/like
 * @access  Public
 */
exports.likeContent = async (req, res) => {
  try {
    const content = await EducationContent.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    });
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    content.engagement.likes += 1;
    await content.save();
    
    res.json({
      success: true,
      message: 'Content liked successfully',
      likes: content.engagement.likes
    });
  } catch (error) {
    console.error('Like content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error liking content',
      error: error.message
    });
  }
};
