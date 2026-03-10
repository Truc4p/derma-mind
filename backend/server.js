require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const mongoose = require('mongoose')
const path = require('path')

// Import routes
const authRoutes = require('./routes/auth')
const skinAnalysisRoutes = require('./routes/skinAnalysis')
const educationRoutes = require('./routes/education')
const ingredientsRoutes = require('./routes/ingredients')
const routinesRoutes = require('./routes/routines')
const aiDermatologyExpertRoutes = require('./routes/aiDermatologyExpert')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// Allow requests from frontend and mobile app
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5175',
  'http://localhost:5175',
  'http://192.168.88.55:8081', // Mobile app (Expo)
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('192.168.')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}))

// Conditional logging - less verbose in development
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'))
} else {
  // Only log errors and important requests in development
  app.use(morgan('dev', {
    skip: function (req, res) {
      // Skip logging for successful API requests to reduce noise
      return res.statusCode < 400 && req.url.startsWith('/api/')
    }
  }))
}

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Database connection
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set')
  process.exit(1)
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err)
    process.exit(1)
  })

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/skin-analysis', skinAnalysisRoutes)
app.use('/api/education', educationRoutes)
app.use('/api/ingredients', ingredientsRoutes)
app.use('/api/routines', routinesRoutes)
app.use('/api/ai-dermatology-expert', aiDermatologyExpertRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Skin Study API is running',
    timestamp: new Date().toISOString()
  })
})

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Skin Study API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      skinAnalysis: '/api/skin-analysis',
      education: '/api/education',
      ingredients: '/api/ingredients',
      routines: '/api/routines',
      aiDermatologyExpert: '/api/ai-dermatology-expert'
    }
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  })
})

// 404 handler - catch all unmatched routes
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5175'}`)
  console.log(`🔗 API URL: http://localhost:${PORT}`)
  console.log(`📱 Mobile API URL: http://192.168.88.55:${PORT}`)
})