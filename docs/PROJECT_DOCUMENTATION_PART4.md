# Skin Study - Final Year Project Technical Documentation
## Part 4: Security, Performance, Deployment, and Testing

---

## 9. SECURITY IMPLEMENTATION

### 9.1 Authentication & Authorization

#### 9.1.1 JWT Authentication System
**Location:** `backend/middleware/auth.js`, `backend/controllers/authController.js`

**Token Generation:**
```javascript
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }  // 7 days expiration
  );
};
```

**Registration Process:**
```javascript
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }
    
    // Create new user (password hashed by pre-save middleware)
    const user = new User({ name, email, password });
    await user.save();
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed' 
    });
  }
};
```

**Login Process:**
```javascript
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user with password field (normally excluded)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Login failed' 
    });
  }
};
```

**Auth Middleware:**
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};
```

#### 9.1.2 Password Security

**Hashing with bcrypt:**
```javascript
const bcrypt = require('bcryptjs');

// Pre-save middleware in User model
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);  // 12 rounds
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

**Password Requirements:**
- Minimum 6 characters
- Stored as bcrypt hash with 12 salt rounds
- Never returned in API responses (select: false in schema)

### 9.2 API Security

#### 9.2.1 Security Headers (Helmet.js)
```javascript
const helmet = require('helmet');

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
```

**Helmet Protection:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HSTS)
- Content Security Policy (CSP)

#### 9.2.2 CORS Configuration
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5175',
  credentials: true
}));
```

#### 9.2.3 Rate Limiting
**Implementation Strategy:**
- Per-endpoint rate limits
- IP-based tracking
- Exponential backoff for AI API calls

```javascript
// Example rate limiting implementation
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // 100 requests per window
  message: 'Too many requests, please try again later'
});

app.use('/api/', apiLimiter);
```

#### 9.2.4 Input Validation & Sanitization

**MongoDB Injection Prevention:**
```javascript
// Email validation in User schema
email: {
  type: String,
  match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 
          'Please enter a valid email']
}

// Mongoose automatically sanitizes queries
```

**File Upload Security:**
```javascript
const multer = require('multer');

const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024  // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Allowed image types
    const allowedTypes = /jpeg|jpg|png|gif|webp|bmp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  }
});
```

### 9.3 Data Privacy

#### 9.3.1 User Data Protection
- Passwords hashed with bcrypt (12 rounds)
- JWT tokens for stateless auth
- User data accessible only to authenticated users
- Admin-only endpoints for statistics

#### 9.3.2 GDPR Considerations
- User consent for data collection
- Right to access personal data
- Right to delete account
- Data minimization
- Transparent data usage policies

---

## 10. PERFORMANCE OPTIMIZATION

### 10.1 Backend Optimizations

#### 10.1.1 Performance Monitoring
**File:** `backend/utils/performanceMonitor.js`

```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      totalTime: [],
      aiGeneration: [],
      vectorSearch: [],
      contextSize: [],
      chunksRetrieved: []
    };
  }

  startTimer() {
    return Date.now();
  }

  endTimer(startTime) {
    return Date.now() - startTime;
  }

  record(metric, value) {
    if (this.metrics[metric]) {
      this.metrics[metric].push(value);
    }
  }

  logRequest(data) {
    console.log('⏱️ Performance Metrics:');
    console.log(`   Total Time: ${data.totalTime}ms`);
    console.log(`   Context Size: ${data.contextSize} chars`);
    console.log(`   Chunks Retrieved: ${data.chunksRetrieved}`);
  }

  getAverages() {
    const averages = {};
    for (const [key, values] of Object.entries(this.metrics)) {
      if (values.length > 0) {
        averages[key] = values.reduce((a, b) => a + b, 0) / values.length;
      }
    }
    return averages;
  }
}

module.exports = new PerformanceMonitor();
```

**Usage in Controllers:**
```javascript
const performanceMonitor = require('../utils/performanceMonitor');

exports.chat = async (req, res) => {
  const totalStart = performanceMonitor.startTimer();
  
  // RAG query
  const ragResult = await vectorService.ragQuery(message);
  
  // AI generation
  const genStart = performanceMonitor.startTimer();
  const result = await geminiService.generateResponse(message, ragResult.context);
  const genTime = performanceMonitor.endTimer(genStart);
  
  const totalTime = performanceMonitor.endTimer(totalStart);
  
  performanceMonitor.record('totalTime', totalTime);
  performanceMonitor.record('aiGeneration', genTime);
  performanceMonitor.logRequest({ totalTime, contextSize: ragResult.context.length });
  
  res.json({ response: result.response });
};
```

#### 10.1.2 Database Indexing

**MongoDB Indexes:**
```javascript
// User model
userSchema.index({ email: 1 });  // Unique index (automatic)
userSchema.index({ 'skinProfile.skinType': 1 });

// SkinAnalysis model
skinAnalysisSchema.index({ sessionId: 1 });
skinAnalysisSchema.index({ user: 1, analysisDate: -1 });

// EducationContent model
educationContentSchema.index({ slug: 1 });  // Unique
educationContentSchema.index({ category: 1, difficulty: 1 });

// Ingredient model
ingredientSchema.index({ name: 1 });
ingredientSchema.index({ category: 1 });
```

**Qdrant Vector Index:**
- HNSW (Hierarchical Navigable Small World) index
- Optimized for fast approximate nearest neighbor search
- Cosine distance metric

#### 10.1.3 RAG Optimizations

**Reduced Chunk Retrieval:**
```javascript
// Optimized from 5 to 3 chunks
async ragQuery(userQuery, conversationHistory = []) {
  const relevantDocs = await this.searchRelevantDocs(userQuery, 3);  // Was 5
  // ...
}
```

**Optimized Token Generation:**
```javascript
generationConfig: {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,              // Reduced from default for faster selection
  maxOutputTokens: 4096  // Reduced from 8192 for faster generation
}
```

**Batch Processing for Indexing:**
```javascript
async indexDocuments(documents) {
  const batchSize = 50;  // Process 50 documents at a time
  
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    
    // Generate embeddings in batch
    const embeddings = await this.embeddings.embedDocuments(
      batch.map(doc => doc.pageContent)
    );
    
    // Upload batch to Qdrant
    await this.qdrantClient.upsert(this.collectionName, {
      wait: true,
      points: /* batch points */
    });
    
    // Small delay between batches
    await sleep(100);
  }
}
```

#### 10.1.4 Retry Logic with Exponential Backoff

**AI API Calls:**
```javascript
async generateWithRetry(prompt, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await this.model.generateContent(prompt);
    } catch (error) {
      lastError = error;
      
      if (error.status === 503 || error.status === 429) {
        if (attempt < maxRetries - 1) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = initialDelay * Math.pow(2, attempt);
          console.log(`Retrying in ${delay}ms...`);
          await sleep(delay);
          continue;
        }
      }
      throw error;
    }
  }
  throw lastError;
}
```

### 10.2 Frontend Optimizations

#### 10.2.1 Build Optimizations (Vite)
```javascript
// vite.config.js
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'axios'],
          'markdown': ['marked']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

#### 10.2.2 Lazy Loading Routes
```javascript
// router/index.js
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/skin-analysis',
    name: 'SkinAnalysis',
    component: () => import('../views/SkinAnalysis.vue')
  },
  {
    path: '/ai-dermatology-expert',
    name: 'AIDermatologyExpert',
    component: () => import('../views/AIDermatologyExpert.vue')
  }
];
```

### 10.3 Mobile App Optimizations

#### 10.3.1 Component Memoization
```javascript
const MessageComponent = memo(({ message, index }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return (
    prevProps.message.content === nextProps.message.content &&
    prevProps.isThisMessageSpeaking === nextProps.isThisMessageSpeaking
  );
});
```

#### 10.3.2 Optimized State Updates
```javascript
// Avoid unnecessary re-renders with useMemo
const contentWidth = useMemo(() => width * 0.8, [width]);
const tagsStyles = useMemo(() => ({ /* styles */ }), []);
const convertMarkdownToHtml = useMemo(() => (md) => { /* convert */ }, []);
```

#### 10.3.3 Sentence-by-Sentence TTS
```javascript
// Instead of generating full audio at once, stream sentences
const sentences = splitIntoSentences(text);

for (const sentence of sentences) {
  const response = await liveChatService.textToSpeech(sentence);
  await playAudio(response.audio);
}
```

**Benefits:**
- Faster initial playback (no waiting for full audio)
- Better user experience
- Reduced memory usage

---

## 11. DEPLOYMENT

### 11.1 Environment Configuration

#### 11.1.1 Backend Environment Variables
**File:** `.env`

```bash
# Server Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skinStudyWeb

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Google AI
GEMINI_API_KEY=your-gemini-api-key

# Qdrant Vector Database
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=optional-api-key

# Note: TTS uses free node-gtts library (Google Translate TTS)
# No additional credentials required for TTS
```

#### 11.1.2 Frontend Environment Variables
**File:** `.env`

```bash
VITE_API_URL=https://your-backend-domain.com/api
```

#### 11.1.3 Mobile App Configuration
**File:** `services/api.js`

```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3004/api'  // Development
  : 'https://your-backend-domain.com/api';  // Production
```

### 11.2 Deployment Strategies

#### 11.2.1 Backend Deployment (Node.js)

**Platform Options:**
1. **Heroku**
2. **AWS EC2**
3. **DigitalOcean**
4. **Railway**
5. **Render**

**Deployment Steps (Generic):**
```bash
# 1. Install dependencies
npm install --production

# 2. Build (if needed)
# No build step for pure Node.js

# 3. Start server
npm start
```

**Process Manager (PM2):**
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name skin-study-api

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

**Docker Deployment:**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - qdrant
      - mongodb

  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - ./qdrant_storage:/qdrant/storage

  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

#### 11.2.2 Qdrant Deployment

**Option 1: Docker (Recommended)**
```bash
docker run -p 6333:6333 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  qdrant/qdrant
```

**Option 2: Qdrant Cloud**
- Managed service
- Automatic scaling
- Built-in backups

**Existing Setup:**
```yaml
# backend/docker-compose.qdrant.yml
version: '3.8'

services:
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - ./qdrant_storage:/qdrant/storage
```

#### 11.2.3 Frontend Deployment

**Build for Production:**
```bash
npm run build
```

**Deployment Platforms:**
1. **Vercel** (Recommended for Vue/Vite)
2. **Netlify**
3. **GitHub Pages**
4. **AWS S3 + CloudFront**

**Vercel Deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Netlify Deployment:**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 11.2.4 Mobile App Deployment

**Expo Build:**
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

**Expo Application Services (EAS):**
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project
eas build:configure

# Build for both platforms
eas build --platform all
```

**App Store Submission:**
1. **iOS:** Submit to Apple App Store via App Store Connect
2. **Android:** Submit to Google Play Console

### 11.3 Production Checklist

**Security:**
- [ ] All API keys in environment variables
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Security headers (Helmet.js)

**Performance:**
- [ ] Database indexes created
- [ ] Caching implemented
- [ ] CDN for static assets
- [ ] Gzip compression enabled
- [ ] Optimized images

**Monitoring:**
- [ ] Error tracking (Sentry, LogRocket)
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Log aggregation

**Backup:**
- [ ] MongoDB automated backups
- [ ] Qdrant vector database backups
- [ ] Regular backup testing

---

*Continued in Part 5...*
