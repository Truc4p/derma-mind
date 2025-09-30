const mongoose = require('mongoose')

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  alternativeNames: [String],
  category: {
    type: String,
    required: true,
    enum: [
      'active', 'moisturizer', 'cleanser', 'exfoliant', 'antioxidant', 
      'anti-aging', 'acne-treatment', 'brightening', 'soothing', 
      'sunscreen', 'preservative', 'emulsifier', 'fragrance'
    ]
  },
  description: {
    type: String,
    required: true,
    maxLength: 1000
  },
  benefits: [{
    skinType: {
      type: String,
      enum: ['oily', 'dry', 'combination', 'sensitive', 'normal', 'all']
    },
    benefit: String,
    effectivenessRating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  concerns: [{
    concern: {
      type: String,
      enum: ['acne', 'aging', 'dark_spots', 'dryness', 'sensitivity', 'large_pores', 'uneven_tone']
    },
    effectiveness: {
      type: String,
      enum: ['low', 'moderate', 'high', 'very_high']
    }
  }],
  safetyInfo: {
    pregnancySafe: {
      type: Boolean,
      default: true
    },
    concentration: {
      typical: String,
      maximum: String,
      beginnerRecommended: String
    },
    phLevel: {
      min: Number,
      max: Number
    },
    photosensitizing: {
      type: Boolean,
      default: false
    },
    comedogenicRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    }
  },
  interactions: {
    avoid: [{
      ingredient: String,
      reason: String,
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe']
      }
    }],
    synergistic: [{
      ingredient: String,
      benefit: String
    }]
  },
  usage: {
    timeOfDay: {
      type: String,
      enum: ['morning', 'evening', 'both', 'any'],
      default: 'any'
    },
    frequency: {
      beginner: String,
      experienced: String
    },
    application: String,
    waitTime: String
  },
  researchLevel: {
    type: String,
    enum: ['limited', 'moderate', 'extensive', 'gold_standard'],
    required: true
  },
  sources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['study', 'review', 'clinical_trial', 'expert_opinion']
    }
  }],
  popularProducts: [{
    name: String,
    brand: String,
    concentration: String,
    priceRange: String
  }],
  tags: [String],
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
})

// Indexes for better search performance
ingredientSchema.index({ name: 'text', alternativeNames: 'text', description: 'text' })
ingredientSchema.index({ category: 1 })
ingredientSchema.index({ 'benefits.skinType': 1 })
ingredientSchema.index({ 'concerns.concern': 1 })
ingredientSchema.index({ tags: 1 })
ingredientSchema.index({ 'rating.average': -1 })

// Virtual for safety score
ingredientSchema.virtual('safetyScore').get(function() {
  let score = 100
  if (!this.safetyInfo.pregnancySafe) score -= 20
  if (this.safetyInfo.photosensitizing) score -= 15
  if (this.safetyInfo.comedogenicRating > 2) score -= 10
  if (this.interactions.avoid.length > 0) score -= (this.interactions.avoid.length * 5)
  return Math.max(score, 0)
})

// Method to get benefits for specific skin type
ingredientSchema.methods.getBenefitsForSkinType = function(skinType) {
  return this.benefits.filter(benefit => 
    benefit.skinType === skinType || benefit.skinType === 'all'
  )
}

// Method to check if ingredient helps with specific concern
ingredientSchema.methods.helpsWithConcern = function(concern) {
  return this.concerns.find(c => c.concern === concern)
}

// Static method to find ingredients by concern
ingredientSchema.statics.findByConcern = function(concern, skinType = null) {
  const query = { 'concerns.concern': concern }
  if (skinType) {
    query.$or = [
      { 'benefits.skinType': skinType },
      { 'benefits.skinType': 'all' }
    ]
  }
  return this.find(query).sort({ 'rating.average': -1 })
}

module.exports = mongoose.model('Ingredient', ingredientSchema)