const mongoose = require('mongoose')

const skinAnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous analysis
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  responses: {
    skinFeeling: {
      type: String,
      enum: ['tight', 'comfortable', 'oily', 'flaky', 'rough'],
      required: true
    },
    skinAppearance: {
      type: String,
      enum: ['shiny', 'matte', 'patchy', 'dull', 'smooth', 'rough'],
      required: true
    },
    poreSize: {
      type: String,
      enum: ['small', 'medium', 'large', 'varied'],
      required: true
    },
    breakoutFrequency: {
      type: String,
      enum: ['never', 'rarely', 'sometimes', 'often', 'always'],
      required: true
    },
    skinReaction: {
      type: String,
      enum: ['none', 'mild', 'moderate', 'severe'],
      required: true
    },
    ageGroup: {
      type: String,
      enum: ['teens', 'twenties', 'thirties', 'forties', 'fifties_plus'],
      required: true
    },
    primaryConcerns: [{
      type: String,
      enum: ['acne', 'aging', 'dark_spots', 'dryness', 'sensitivity', 'large_pores', 'uneven_tone', 'wrinkles']
    }],
    currentProducts: [{
      type: String,
      enum: ['cleanser', 'moisturizer', 'sunscreen', 'serum', 'toner', 'exfoliant', 'mask', 'none']
    }],
    lifestyle: {
      stressLevel: {
        type: String,
        enum: ['low', 'moderate', 'high']
      },
      sleepQuality: {
        type: String,
        enum: ['poor', 'fair', 'good', 'excellent']
      },
      diet: {
        type: String,
        enum: ['poor', 'average', 'healthy', 'very_healthy']
      },
      exercise: {
        type: String,
        enum: ['none', 'light', 'moderate', 'intense']
      }
    }
  },
  results: {
    skinType: {
      type: String,
      enum: ['oily', 'dry', 'combination', 'sensitive', 'normal'],
      required: true
    },
    skinTypeConfidence: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    primaryConcerns: [{
      concern: String,
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe']
      },
      priority: Number
    }],
    recommendations: {
      routine: {
        morning: [{
          step: Number,
          product: String,
          purpose: String,
          frequency: String
        }],
        evening: [{
          step: Number,
          product: String,
          purpose: String,
          frequency: String
        }]
      },
      ingredients: {
        beneficial: [{
          name: String,
          purpose: String,
          concentration: String
        }],
        avoid: [{
          name: String,
          reason: String
        }]
      },
      lifestyle: [{
        category: String,
        recommendation: String,
        impact: String
      }]
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    }
  },
  analysisDate: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
})

// Indexes for better performance
// Note: sessionId index is automatically created by unique: true
skinAnalysisSchema.index({ user: 1, analysisDate: -1 })
skinAnalysisSchema.index({ 'results.skinType': 1 })
skinAnalysisSchema.index({ analysisDate: -1 })

// Virtual for analysis age
skinAnalysisSchema.virtual('analysisAge').get(function() {
  return Math.floor((Date.now() - this.analysisDate) / (1000 * 60 * 60 * 24))
})

// Method to get summary
skinAnalysisSchema.methods.getSummary = function() {
  return {
    id: this._id,
    sessionId: this.sessionId,
    skinType: this.results.skinType,
    confidence: this.results.skinTypeConfidence,
    score: this.results.overallScore,
    primaryConcerns: this.results.primaryConcerns.slice(0, 3),
    date: this.analysisDate
  }
}

module.exports = mongoose.model('SkinAnalysis', skinAnalysisSchema)