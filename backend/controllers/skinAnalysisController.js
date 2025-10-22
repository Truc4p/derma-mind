const { v4: uuidv4 } = require('uuid');
const SkinAnalysis = require('../models/SkinAnalysis');

/**
 * Skin analysis algorithm
 */
const analyzeSkin = (responses) => {
  let skinType = 'normal';
  let confidence = 70;
  let score = 75;
  const primaryConcerns = [];
  
  // Determine skin type based on responses
  const oilyIndicators = ['oily', 'shiny', 'large'];
  const dryIndicators = ['tight', 'flaky', 'rough', 'dull', 'small'];
  const sensitiveIndicators = ['moderate', 'severe'];
  
  let oilyScore = 0;
  let dryScore = 0;
  let sensitiveScore = 0;
  
  // Analyze responses
  if (oilyIndicators.includes(responses.skinFeeling)) oilyScore += 2;
  if (oilyIndicators.includes(responses.skinAppearance)) oilyScore += 2;
  if (oilyIndicators.includes(responses.poreSize)) oilyScore += 1;
  
  if (dryIndicators.includes(responses.skinFeeling)) dryScore += 2;
  if (dryIndicators.includes(responses.skinAppearance)) dryScore += 2;
  if (dryIndicators.includes(responses.poreSize)) dryScore += 1;
  
  if (sensitiveIndicators.includes(responses.skinReaction)) sensitiveScore += 3;
  
  // Determine primary skin type
  if (sensitiveScore >= 3) {
    skinType = 'sensitive';
    confidence = 85;
  } else if (oilyScore > dryScore && oilyScore >= 3) {
    skinType = 'oily';
    confidence = 80;
  } else if (dryScore > oilyScore && dryScore >= 3) {
    skinType = 'dry';
    confidence = 80;
  } else if (oilyScore > 0 && dryScore > 0) {
    skinType = 'combination';
    confidence = 75;
  }
  
  // Analyze primary concerns
  responses.primaryConcerns.forEach(concern => {
    let severity = 'mild';
    let priority = 1;
    
    if (['often', 'always'].includes(responses.breakoutFrequency) && concern === 'acne') {
      severity = 'moderate';
      priority = 1;
    }
    
    if (responses.ageGroup === 'forties' || responses.ageGroup === 'fifties_plus') {
      if (concern === 'aging') {
        severity = 'moderate';
        priority = 1;
      }
    }
    
    primaryConcerns.push({
      concern,
      severity,
      priority
    });
  });
  
  // Sort concerns by priority
  primaryConcerns.sort((a, b) => a.priority - b.priority);
  
  // Calculate overall score
  score = 75;
  if (['often', 'always'].includes(responses.breakoutFrequency)) score -= 15;
  if (responses.skinReaction === 'severe') score -= 20;
  if (responses.lifestyle.stressLevel === 'high') score -= 10;
  if (responses.lifestyle.sleepQuality === 'poor') score -= 10;
  
  return {
    skinType,
    skinTypeConfidence: confidence,
    primaryConcerns,
    overallScore: Math.max(score, 0)
  };
};

/**
 * Generate recommendations based on analysis
 */
const generateRecommendations = (skinType, concerns, responses) => {
  const routine = {
    morning: [
      { step: 1, product: 'Gentle Cleanser', purpose: 'Remove overnight buildup', frequency: 'Daily' },
      { step: 2, product: 'Moisturizer', purpose: 'Hydrate and protect', frequency: 'Daily' },
      { step: 3, product: 'Sunscreen SPF 30+', purpose: 'UV protection', frequency: 'Daily' }
    ],
    evening: [
      { step: 1, product: 'Cleanser', purpose: 'Remove makeup and impurities', frequency: 'Daily' },
      { step: 2, product: 'Treatment Serum', purpose: 'Target specific concerns', frequency: '3-4x per week' },
      { step: 3, product: 'Night Moisturizer', purpose: 'Overnight repair and hydration', frequency: 'Daily' }
    ]
  };
  
  const ingredients = {
    beneficial: [],
    avoid: []
  };
  
  // Customize based on skin type
  switch (skinType) {
    case 'oily':
      routine.morning.splice(1, 0, { 
        step: 2, 
        product: 'Niacinamide Serum', 
        purpose: 'Control oil production', 
        frequency: 'Daily' 
      });
      ingredients.beneficial.push(
        { name: 'Salicylic Acid', purpose: 'Exfoliation and pore clearing', concentration: '0.5-2%' },
        { name: 'Niacinamide', purpose: 'Oil control and pore refinement', concentration: '5-10%' }
      );
      ingredients.avoid.push(
        { name: 'Heavy oils', reason: 'Can clog pores' }
      );
      break;
      
    case 'dry':
      ingredients.beneficial.push(
        { name: 'Hyaluronic Acid', purpose: 'Deep hydration', concentration: '1-2%' },
        { name: 'Ceramides', purpose: 'Barrier repair', concentration: 'Various' }
      );
      ingredients.avoid.push(
        { name: 'Alcohol-based toners', reason: 'Can over-dry skin' }
      );
      break;
      
    case 'sensitive':
      ingredients.beneficial.push(
        { name: 'Centella Asiatica', purpose: 'Soothing and calming', concentration: '1-5%' },
        { name: 'Panthenol', purpose: 'Anti-inflammatory', concentration: '2-5%' }
      );
      ingredients.avoid.push(
        { name: 'Fragrances', reason: 'Can cause irritation' },
        { name: 'Strong acids', reason: 'May be too harsh' }
      );
      break;
  }
  
  // Add concern-specific recommendations
  concerns.forEach(concern => {
    if (concern.concern === 'acne') {
      ingredients.beneficial.push(
        { name: 'Benzoyl Peroxide', purpose: 'Antibacterial', concentration: '2.5-5%' }
      );
    }
    if (concern.concern === 'aging') {
      ingredients.beneficial.push(
        { name: 'Retinol', purpose: 'Cell renewal and collagen production', concentration: '0.25-1%' },
        { name: 'Vitamin C', purpose: 'Antioxidant protection', concentration: '10-20%' }
      );
    }
  });
  
  const lifestyle = [
    { 
      category: 'Sleep', 
      recommendation: 'Aim for 7-9 hours of quality sleep', 
      impact: 'Supports skin repair and regeneration' 
    },
    { 
      category: 'Diet', 
      recommendation: 'Include antioxidant-rich foods', 
      impact: 'Helps fight free radical damage' 
    },
    { 
      category: 'Hydration', 
      recommendation: 'Drink 8-10 glasses of water daily', 
      impact: 'Maintains skin moisture from within' 
    }
  ];
  
  return { routine, ingredients, lifestyle };
};

/**
 * @desc    Perform skin analysis
 * @route   POST /api/skin-analysis/analyze
 * @access  Public
 */
exports.analyzeSkin = async (req, res) => {
  try {
    const { responses, userId } = req.body;
    const sessionId = uuidv4();
    
    // Perform analysis
    const analysisResults = analyzeSkin(responses);
    const recommendations = generateRecommendations(
      analysisResults.skinType, 
      analysisResults.primaryConcerns, 
      responses
    );
    
    // Create analysis record
    const skinAnalysis = new SkinAnalysis({
      user: userId || null,
      sessionId,
      responses,
      results: {
        ...analysisResults,
        recommendations
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    await skinAnalysis.save();
    
    res.json({
      success: true,
      sessionId,
      results: {
        ...analysisResults,
        recommendations
      }
    });
  } catch (error) {
    console.error('Skin analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing skin analysis',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's analysis history
 * @route   GET /api/skin-analysis/history
 * @access  Private
 */
exports.getAnalysisHistory = async (req, res) => {
  try {
    const analyses = await SkinAnalysis.find({ user: req.user.id })
      .sort({ analysisDate: -1 })
      .select('results.skinType results.skinTypeConfidence results.overallScore results.primaryConcerns analysisDate');
    
    res.json({
      success: true,
      analyses: analyses.map(analysis => analysis.getSummary())
    });
  } catch (error) {
    console.error('Get analysis history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analysis history',
      error: error.message
    });
  }
};

/**
 * @desc    Get specific analysis results
 * @route   GET /api/skin-analysis/:sessionId
 * @access  Public
 */
exports.getAnalysisById = async (req, res) => {
  try {
    const analysis = await SkinAnalysis.findOne({ sessionId: req.params.sessionId });
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }
    
    res.json({
      success: true,
      analysis: {
        sessionId: analysis.sessionId,
        results: analysis.results,
        analysisDate: analysis.analysisDate
      }
    });
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analysis',
      error: error.message
    });
  }
};

/**
 * @desc    Get analysis statistics (admin)
 * @route   GET /api/skin-analysis/stats/overview
 * @access  Private (admin only)
 */
exports.getAnalysisStats = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const totalAnalyses = await SkinAnalysis.countDocuments();
    const skinTypeStats = await SkinAnalysis.aggregate([
      { $group: { _id: '$results.skinType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const concernStats = await SkinAnalysis.aggregate([
      { $unwind: '$results.primaryConcerns' },
      { $group: { _id: '$results.primaryConcerns.concern', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalAnalyses,
        skinTypeDistribution: skinTypeStats,
        topConcerns: concernStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};
