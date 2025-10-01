const mongoose = require('mongoose')

const educationContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'skin-basics', 'skin-types', 'ingredients', 'routines', 
      'concerns', 'myths', 'science', 'lifestyle', 'products'
    ]
  },
  subcategory: String,
  content: {
    summary: {
      type: String,
      required: true,
      maxLength: 300
    },
    body: {
      type: String,
      required: true
    },
    keyPoints: [String],
    takeaways: [String]
  },
  metadata: {
    readingTime: {
      type: Number,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    sources: [{
      title: String,
      url: String,
      type: {
        type: String,
        enum: ['study', 'review', 'clinical_trial', 'expert_opinion', 'medical_journal']
      }
    }]
  },
  media: {
    featuredImage: {
      url: String,
      alt: String,
      caption: String
    },
    images: [{
      url: String,
      alt: String,
      caption: String
    }],
    videos: [{
      url: String,
      title: String,
      duration: Number
    }]
  },
  relatedTopics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EducationContent'
  }],
  tags: [String],
  targetAudience: {
    skinTypes: [{
      type: String,
      enum: ['oily', 'dry', 'combination', 'sensitive', 'normal', 'all']
    }],
    concerns: [{
      type: String,
      enum: ['acne', 'aging', 'dark_spots', 'dryness', 'sensitivity', 'large_pores', 'uneven_tone', 'general']
    }],
    experienceLevel: [{
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    }]
  },
  engagement: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
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
    },
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      content: String,
      date: {
        type: Date,
        default: Date.now
      },
      helpful: {
        type: Number,
        default: 0
      }
    }]
  },
  seo: {
    metaDescription: String,
    keywords: [String],
    canonicalUrl: String
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  author: {
    name: String,
    credentials: String,
    bio: String,
    image: String
  },
  publishDate: Date,
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Indexes for better performance
// Note: slug index is automatically created by unique: true
educationContentSchema.index({ category: 1, subcategory: 1 })
educationContentSchema.index({ status: 1, publishDate: -1 })
educationContentSchema.index({ tags: 1 })
educationContentSchema.index({ 'targetAudience.skinTypes': 1 })
educationContentSchema.index({ 'targetAudience.concerns': 1 })
educationContentSchema.index({ 'engagement.rating.average': -1 })
educationContentSchema.index({ 'engagement.views': -1 })
educationContentSchema.index({ featured: -1, publishDate: -1 })

// Text index for search
educationContentSchema.index({ 
  title: 'text', 
  'content.summary': 'text', 
  'content.body': 'text',
  tags: 'text'
})

// Virtual for URL
educationContentSchema.virtual('url').get(function() {
  return `/education/${this.category}/${this.slug}`
})

// Method to increment views
educationContentSchema.methods.incrementViews = function() {
  this.engagement.views += 1
  return this.save()
}

// Method to add rating
educationContentSchema.methods.addRating = function(rating) {
  const currentTotal = this.engagement.rating.average * this.engagement.rating.count
  this.engagement.rating.count += 1
  this.engagement.rating.average = (currentTotal + rating) / this.engagement.rating.count
  return this.save()
}

// Static method to find by target audience
educationContentSchema.statics.findForAudience = function(skinType, concerns = [], difficulty = null) {
  const query = {
    status: 'published',
    $or: [
      { 'targetAudience.skinTypes': skinType },
      { 'targetAudience.skinTypes': 'all' }
    ]
  }
  
  if (concerns.length > 0) {
    query['targetAudience.concerns'] = { $in: [...concerns, 'general'] }
  }
  
  if (difficulty) {
    query['targetAudience.experienceLevel'] = difficulty
  }
  
  return this.find(query)
    .sort({ 'engagement.rating.average': -1, 'engagement.views': -1 })
    .populate('relatedTopics', 'title slug category')
}

// Static method to get popular content
educationContentSchema.statics.getPopular = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ 'engagement.views': -1, 'engagement.rating.average': -1 })
    .limit(limit)
    .select('title slug category content.summary media.featuredImage engagement')
}

module.exports = mongoose.model('EducationContent', educationContentSchema)