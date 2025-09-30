const express = require('express')
const auth = require('../middleware/auth')

const router = express.Router()

// Pre-defined routine templates
const routineTemplates = {
  oily: {
    morning: [
      { step: 1, product: 'Gentle Foaming Cleanser', purpose: 'Remove overnight oil buildup', time: '2 minutes', ingredients: ['Salicylic Acid', 'Tea Tree Oil'] },
      { step: 2, product: 'BHA Toner', purpose: 'Exfoliate and clear pores', time: '1 minute', ingredients: ['Salicylic Acid', 'Niacinamide'] },
      { step: 3, product: 'Niacinamide Serum', purpose: 'Control oil production', time: '2 minutes', ingredients: ['Niacinamide', 'Zinc'] },
      { step: 4, product: 'Lightweight Moisturizer', purpose: 'Hydrate without clogging pores', time: '1 minute', ingredients: ['Hyaluronic Acid', 'Glycerin'] },
      { step: 5, product: 'Broad Spectrum SPF 30+', purpose: 'UV protection', time: '2 minutes', ingredients: ['Zinc Oxide', 'Titanium Dioxide'] }
    ],
    evening: [
      { step: 1, product: 'Oil Cleanser (if wearing makeup)', purpose: 'Remove makeup and sunscreen', time: '2 minutes', ingredients: ['Jojoba Oil', 'Emulsifiers'] },
      { step: 2, product: 'Gentle Foaming Cleanser', purpose: 'Deep clean pores', time: '2 minutes', ingredients: ['Salicylic Acid', 'Tea Tree Oil'] },
      { step: 3, product: 'BHA Treatment (3x/week)', purpose: 'Deep pore exfoliation', time: '5 minutes', ingredients: ['Salicylic Acid'] },
      { step: 4, product: 'Hydrating Serum', purpose: 'Balance moisture', time: '2 minutes', ingredients: ['Hyaluronic Acid', 'Panthenol'] },
      { step: 5, product: 'Night Moisturizer', purpose: 'Overnight repair', time: '2 minutes', ingredients: ['Ceramides', 'Peptides'] }
    ],
    weekly: [
      { frequency: '2x per week', product: 'Clay Mask', purpose: 'Deep pore cleansing', ingredients: ['Bentonite Clay', 'Charcoal'] },
      { frequency: '1x per week', product: 'Gentle Scrub', purpose: 'Physical exfoliation', ingredients: ['Jojoba Beads', 'Fruit Enzymes'] }
    ]
  },
  dry: {
    morning: [
      { step: 1, product: 'Cream Cleanser', purpose: 'Gentle cleansing without stripping', time: '2 minutes', ingredients: ['Ceramides', 'Glycerin'] },
      { step: 2, product: 'Hydrating Toner', purpose: 'Add moisture layer', time: '1 minute', ingredients: ['Hyaluronic Acid', 'Rose Water'] },
      { step: 3, product: 'Vitamin C Serum', purpose: 'Antioxidant protection', time: '2 minutes', ingredients: ['L-Ascorbic Acid', 'Vitamin E'] },
      { step: 4, product: 'Hyaluronic Acid Serum', purpose: 'Deep hydration', time: '2 minutes', ingredients: ['Hyaluronic Acid', 'Sodium Hyaluronate'] },
      { step: 5, product: 'Rich Moisturizer', purpose: 'Lock in moisture', time: '2 minutes', ingredients: ['Ceramides', 'Shea Butter'] },
      { step: 6, product: 'Moisturizing SPF 30+', purpose: 'UV protection + hydration', time: '2 minutes', ingredients: ['Chemical Sunscreens', 'Glycerin'] }
    ],
    evening: [
      { step: 1, product: 'Oil Cleanser', purpose: 'Gentle makeup removal', time: '2 minutes', ingredients: ['Argan Oil', 'Vitamin E'] },
      { step: 2, product: 'Cream Cleanser', purpose: 'Nourishing cleanse', time: '2 minutes', ingredients: ['Ceramides', 'Oat Extract'] },
      { step: 3, product: 'Hydrating Essence', purpose: 'Prep skin for treatments', time: '1 minute', ingredients: ['Snail Mucin', 'Panthenol'] },
      { step: 4, product: 'Retinol Serum (2x/week)', purpose: 'Anti-aging and renewal', time: '5 minutes', ingredients: ['Retinol', 'Squalane'] },
      { step: 5, product: 'Face Oil', purpose: 'Deep nourishment', time: '2 minutes', ingredients: ['Rosehip Oil', 'Marula Oil'] },
      { step: 6, product: 'Night Cream', purpose: 'Overnight repair', time: '2 minutes', ingredients: ['Peptides', 'Ceramides'] }
    ],
    weekly: [
      { frequency: '1x per week', product: 'Hydrating Mask', purpose: 'Intensive moisture boost', ingredients: ['Hyaluronic Acid', 'Collagen'] },
      { frequency: '1x per week', product: 'Gentle Enzyme Exfoliant', purpose: 'Remove dead skin cells', ingredients: ['Papaya Enzyme', 'Pineapple Extract'] }
    ]
  },
  combination: {
    morning: [
      { step: 1, product: 'Balanced Gel Cleanser', purpose: 'Clean without over-drying', time: '2 minutes', ingredients: ['Gentle Surfactants', 'Aloe Vera'] },
      { step: 2, product: 'Balancing Toner', purpose: 'Prep skin and balance pH', time: '1 minute', ingredients: ['Witch Hazel', 'Niacinamide'] },
      { step: 3, product: 'Multi-zone Treatment', purpose: 'Target different areas', time: '3 minutes', ingredients: ['BHA for T-zone', 'Hyaluronic Acid for cheeks'] },
      { step: 4, product: 'Lightweight Moisturizer', purpose: 'Balanced hydration', time: '2 minutes', ingredients: ['Glycerin', 'Dimethicone'] },
      { step: 5, product: 'Broad Spectrum SPF 30+', purpose: 'Universal protection', time: '2 minutes', ingredients: ['Zinc Oxide', 'Octinoxate'] }
    ],
    evening: [
      { step: 1, product: 'Micellar Water', purpose: 'Gentle makeup removal', time: '2 minutes', ingredients: ['Micelles', 'Cucumber Extract'] },
      { step: 2, product: 'Balanced Gel Cleanser', purpose: 'Thorough cleanse', time: '2 minutes', ingredients: ['Gentle Surfactants', 'Chamomile'] },
      { step: 3, product: 'Zone-specific Treatment', purpose: 'Address different needs', time: '3 minutes', ingredients: ['Salicylic Acid', 'Peptides'] },
      { step: 4, product: 'Hydrating Serum', purpose: 'Add moisture', time: '2 minutes', ingredients: ['Hyaluronic Acid', 'B5'] },
      { step: 5, product: 'Balanced Night Moisturizer', purpose: 'Overnight care', time: '2 minutes', ingredients: ['Ceramides', 'Niacinamide'] }
    ],
    weekly: [
      { frequency: '1x per week', product: 'Clay Mask (T-zone only)', purpose: 'Control oil in T-zone', ingredients: ['Kaolin Clay', 'Charcoal'] },
      { frequency: '1x per week', product: 'Hydrating Mask (cheeks)', purpose: 'Boost moisture in dry areas', ingredients: ['Hyaluronic Acid', 'Aloe'] }
    ]
  },
  sensitive: {
    morning: [
      { step: 1, product: 'Ultra-Gentle Cleanser', purpose: 'Minimal irritation cleansing', time: '1 minute', ingredients: ['Ceramides', 'Oat Extract'] },
      { step: 2, product: 'Soothing Mist', purpose: 'Calm and prep skin', time: '1 minute', ingredients: ['Thermal Water', 'Allantoin'] },
      { step: 3, product: 'Calming Serum', purpose: 'Reduce inflammation', time: '2 minutes', ingredients: ['Centella Asiatica', 'Panthenol'] },
      { step: 4, product: 'Barrier Repair Moisturizer', purpose: 'Strengthen skin barrier', time: '2 minutes', ingredients: ['Ceramides', 'Cholesterol'] },
      { step: 5, product: 'Mineral SPF 30+', purpose: 'Gentle sun protection', time: '2 minutes', ingredients: ['Zinc Oxide', 'Titanium Dioxide'] }
    ],
    evening: [
      { step: 1, product: 'Gentle Micellar Water', purpose: 'No-rinse cleansing', time: '2 minutes', ingredients: ['Gentle Micelles', 'Rose Water'] },
      { step: 2, product: 'Ultra-Gentle Cleanser', purpose: 'Soothing cleanse', time: '1 minute', ingredients: ['Oat Milk', 'Ceramides'] },
      { step: 3, product: 'Calming Essence', purpose: 'Prep and soothe', time: '1 minute', ingredients: ['Snail Mucin', 'Madecassoside'] },
      { step: 4, product: 'Repair Serum', purpose: 'Overnight healing', time: '2 minutes', ingredients: ['Peptides', 'Hyaluronic Acid'] },
      { step: 5, product: 'Intensive Night Cream', purpose: 'Deep repair', time: '2 minutes', ingredients: ['Ceramides', 'Cholesterol'] }
    ],
    weekly: [
      { frequency: '1x per week', product: 'Gentle Hydrating Mask', purpose: 'Soothing treatment', ingredients: ['Aloe Vera', 'Cucumber'] },
      { frequency: 'As needed', product: 'Calming Spot Treatment', purpose: 'Target irritation', ingredients: ['Centella', 'Zinc Oxide'] }
    ]
  },
  normal: {
    morning: [
      { step: 1, product: 'Gentle Daily Cleanser', purpose: 'Fresh start cleansing', time: '2 minutes', ingredients: ['Gentle Surfactants', 'Glycerin'] },
      { step: 2, product: 'Vitamin C Serum', purpose: 'Antioxidant protection', time: '2 minutes', ingredients: ['L-Ascorbic Acid', 'Ferulic Acid'] },
      { step: 3, product: 'Hydrating Moisturizer', purpose: 'Daily hydration', time: '2 minutes', ingredients: ['Hyaluronic Acid', 'Ceramides'] },
      { step: 4, product: 'Broad Spectrum SPF 30+', purpose: 'Daily protection', time: '2 minutes', ingredients: ['Mixed UV filters'] }
    ],
    evening: [
      { step: 1, product: 'Oil Cleanser (if needed)', purpose: 'Remove makeup/sunscreen', time: '2 minutes', ingredients: ['Light oils', 'Emulsifiers'] },
      { step: 2, product: 'Gentle Daily Cleanser', purpose: 'Clean and refresh', time: '2 minutes', ingredients: ['Gentle Surfactants'] },
      { step: 3, product: 'Active Treatment (alternating)', purpose: 'Skin improvement', time: '5 minutes', ingredients: ['Retinol', 'AHA/BHA'] },
      { step: 4, product: 'Hydrating Serum', purpose: 'Moisture boost', time: '2 minutes', ingredients: ['Hyaluronic Acid', 'Niacinamide'] },
      { step: 5, product: 'Night Moisturizer', purpose: 'Overnight care', time: '2 minutes', ingredients: ['Peptides', 'Ceramides'] }
    ],
    weekly: [
      { frequency: '1-2x per week', product: 'Exfoliating Treatment', purpose: 'Cell renewal', ingredients: ['AHA/BHA', 'Enzymes'] },
      { frequency: '1x per week', product: 'Hydrating Mask', purpose: 'Extra nourishment', ingredients: ['Hyaluronic Acid', 'Vitamins'] }
    ]
  }
}

// @route   GET /api/routines
// @desc    Get routine templates
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { skinType, concern, experience = 'beginner' } = req.query
    
    if (skinType && routineTemplates[skinType]) {
      let routine = { ...routineTemplates[skinType] }
      
      // Customize routine based on experience level
      if (experience === 'beginner') {
        // Simplify routine for beginners
        routine.morning = routine.morning.filter(step => !step.product.includes('Advanced'))
        routine.evening = routine.evening.filter(step => !step.product.includes('Advanced'))
      }
      
      // Add concern-specific modifications
      if (concern) {
        routine = addConcernSpecificSteps(routine, concern)
      }
      
      return res.json({
        success: true,
        routine,
        skinType,
        experience,
        totalSteps: {
          morning: routine.morning.length,
          evening: routine.evening.length,
          weekly: routine.weekly?.length || 0
        },
        estimatedTime: {
          morning: calculateRoutineTime(routine.morning),
          evening: calculateRoutineTime(routine.evening)
        }
      })
    }
    
    // If no specific skin type, return all templates overview
    const templatesOverview = Object.keys(routineTemplates).map(type => ({
      skinType: type,
      description: getSkinTypeDescription(type),
      stepCount: {
        morning: routineTemplates[type].morning.length,
        evening: routineTemplates[type].evening.length
      },
      time: {
        morning: calculateRoutineTime(routineTemplates[type].morning),
        evening: calculateRoutineTime(routineTemplates[type].evening)
      }
    }))
    
    res.json({
      success: true,
      availableRoutines: templatesOverview
    })
  } catch (error) {
    console.error('Get routines error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching routines',
      error: error.message
    })
  }
})

// @route   POST /api/routines/customize
// @desc    Get customized routine based on user profile
// @access  Public
router.post('/customize', async (req, res) => {
  try {
    const { 
      skinType, 
      concerns = [], 
      age, 
      experience = 'beginner',
      budget = 'moderate',
      timePreference = 'moderate',
      productPreferences = {}
    } = req.body
    
    if (!skinType || !routineTemplates[skinType]) {
      return res.status(400).json({
        success: false,
        message: 'Valid skin type is required'
      })
    }
    
    let customRoutine = { ...routineTemplates[skinType] }
    
    // Customize based on concerns
    concerns.forEach(concern => {
      customRoutine = addConcernSpecificSteps(customRoutine, concern)
    })
    
    // Adjust for age
    if (age > 30) {
      customRoutine = addAntiAgingSteps(customRoutine)
    }
    
    // Adjust for experience level
    if (experience === 'beginner') {
      customRoutine = simplifyRoutine(customRoutine)
    } else if (experience === 'advanced') {
      customRoutine = enhanceRoutine(customRoutine)
    }
    
    // Adjust for time preference
    if (timePreference === 'minimal') {
      customRoutine = createMinimalRoutine(customRoutine)
    } else if (timePreference === 'extensive') {
      customRoutine = expandRoutine(customRoutine)
    }
    
    // Add product alternatives based on budget
    customRoutine = addBudgetAlternatives(customRoutine, budget)
    
    // Generate routine insights
    const insights = generateRoutineInsights(customRoutine, { skinType, concerns, age, experience })
    
    res.json({
      success: true,
      customRoutine,
      insights,
      parameters: {
        skinType,
        concerns,
        age,
        experience,
        budget,
        timePreference
      },
      estimatedTime: {
        morning: calculateRoutineTime(customRoutine.morning),
        evening: calculateRoutineTime(customRoutine.evening)
      },
      estimatedCost: estimateRoutineCost(customRoutine, budget)
    })
  } catch (error) {
    console.error('Customize routine error:', error)
    res.status(500).json({
      success: false,
      message: 'Error customizing routine',
      error: error.message
    })
  }
})

// @route   GET /api/routines/product-suggestions
// @desc    Get product suggestions for routine steps
// @access  Public
router.get('/product-suggestions', async (req, res) => {
  try {
    const { category, skinType, concern, budget = 'moderate' } = req.query
    
    const suggestions = getProductSuggestions(category, skinType, concern, budget)
    
    res.json({
      success: true,
      category,
      suggestions
    })
  } catch (error) {
    console.error('Get product suggestions error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching product suggestions',
      error: error.message
    })
  }
})

// Helper functions
function calculateRoutineTime(steps) {
  return steps.reduce((total, step) => {
    const time = parseInt(step.time?.replace(' minutes', '') || '2')
    return total + time
  }, 0)
}

function getSkinTypeDescription(skinType) {
  const descriptions = {
    oily: 'Excess oil production, enlarged pores, prone to breakouts',
    dry: 'Lacks moisture, feels tight, may have flaky patches',
    combination: 'Oily T-zone with normal to dry cheeks',
    sensitive: 'Easily irritated, reactive to products and environment',
    normal: 'Balanced, few concerns, well-functioning barrier'
  }
  return descriptions[skinType] || 'Balanced skin type'
}

function addConcernSpecificSteps(routine, concern) {
  // Implementation would add specific products/steps for concerns
  // This is a simplified version
  return routine
}

function addAntiAgingSteps(routine) {
  // Add anti-aging specific steps
  return routine
}

function simplifyRoutine(routine) {
  // Reduce steps for beginners
  return {
    ...routine,
    morning: routine.morning.slice(0, 4),
    evening: routine.evening.slice(0, 4)
  }
}

function enhanceRoutine(routine) {
  // Add advanced steps
  return routine
}

function createMinimalRoutine(routine) {
  return {
    morning: routine.morning.slice(0, 3),
    evening: routine.evening.slice(0, 3),
    weekly: []
  }
}

function expandRoutine(routine) {
  // Add more comprehensive steps
  return routine
}

function addBudgetAlternatives(routine, budget) {
  // Add product alternatives based on budget
  return routine
}

function generateRoutineInsights(routine, params) {
  return {
    keyBenefits: ['Improved hydration', 'Enhanced protection', 'Targeted treatment'],
    timeCommitment: 'Moderate - 10-15 minutes daily',
    expectedResults: 'Visible improvements in 4-6 weeks',
    tips: [
      'Start slowly with active ingredients',
      'Always patch test new products',
      'Consistency is key for best results'
    ]
  }
}

function estimateRoutineCost(routine, budget) {
  const budgetRanges = {
    budget: { min: 50, max: 150 },
    moderate: { min: 150, max: 400 },
    premium: { min: 400, max: 800 }
  }
  return budgetRanges[budget] || budgetRanges.moderate
}

function getProductSuggestions(category, skinType, concern, budget) {
  // Mock product suggestions - in real app, this would query a products database
  return [
    {
      name: 'Gentle Daily Cleanser',
      brand: 'SkinCare Pro',
      price: 25,
      rating: 4.5,
      ingredients: ['Ceramides', 'Glycerin'],
      suitable: true
    },
    {
      name: 'Hydrating Moisturizer',
      brand: 'Beauty Plus',
      price: 35,
      rating: 4.3,
      ingredients: ['Hyaluronic Acid', 'Vitamin E'],
      suitable: true
    }
  ]
}

module.exports = router