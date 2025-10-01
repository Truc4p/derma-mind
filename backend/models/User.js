const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxLength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  skinProfile: {
    skinType: {
      type: String,
      enum: ['oily', 'dry', 'combination', 'sensitive', 'normal'],
      default: null
    },
    skinConcerns: [{
      type: String,
      enum: ['acne', 'aging', 'dark_spots', 'dryness', 'sensitivity', 'large_pores', 'uneven_tone']
    }],
    skinTone: {
      type: String,
      enum: ['fair', 'light', 'medium', 'tan', 'deep'],
      default: null
    },
    age: {
      type: Number,
      min: 13,
      max: 100
    },
    lifestyle: {
      climate: String,
      activityLevel: {
        type: String,
        enum: ['low', 'moderate', 'high']
      },
      sleepHours: {
        type: Number,
        min: 4,
        max: 12
      }
    }
  },
  skinAnalysisHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    results: {
      skinType: String,
      concerns: [String],
      recommendations: [String],
      score: Number
    }
  }],
  preferences: {
    newsletter: {
      type: Boolean,
      default: true
    },
    skinReminders: {
      type: Boolean,
      default: true
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
})

// Index for better performance
// Note: email index is automatically created by unique: true
userSchema.index({ 'skinProfile.skinType': 1 })

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject()
  delete user.password
  delete user.__v
  return user
}

module.exports = mongoose.model('User', userSchema)