# Skin Study - AI-Powered Dermatology Platform

## Overview

**Skin Study** is a comprehensive web and mobile platform that leverages artificial intelligence and vector search technology to provide personalized skincare advice, ingredient analysis, and dermatological education. The platform features an AI-powered dermatologist assistant with RAG (Retrieval-Augmented Generation) system, voice-to-text and text-to-speech capabilities, live voice chat, searchable conversation history, and an extensive skincare knowledge base powered by 10 professional dermatology textbooks.

## Platform Compatibility

### Web Application Browser Support
- **Chrome**: Version 90+ (recommended)
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Edge**: Version 90+
- **Opera**: Version 76+

**Minimum Requirements:**
- JavaScript enabled
- Cookies and local storage enabled
- Modern CSS support (Flexbox, Grid)
- IndexedDB support for offline data
- WebRTC support for voice features
- Web Audio API for speech synthesis

### Mobile Application Support
- **iOS**: Version 13.0 and above
  - iPhone 6s and newer
  - iPad 5th generation and newer
  - iPad Air 2 and newer
  - iPad Pro (all models)
  - iPad mini 4 and newer
- **Android**: Version 5.0 (Lollipop, API Level 21) and above
  - Minimum 2GB RAM recommended
  - OpenGL ES 2.0 support
  - 64-bit and 32-bit architectures supported

**Mobile Features:**
- Native camera integration
- Voice recording and playback
- AsyncStorage for offline data
- Expo managed workflow support
- OCR capabilities (Tesseract.js)

## Technology Stack

### Backend
- **Runtime**: Node.js with Express.js 4.19.2
- **Database**: MongoDB Atlas (Mongoose ODM 8.18.3)
- **AI/ML**:
  - Google Generative AI (@google/generative-ai 0.21.0)
  - LangChain (0.3.36) + LangChain Google GenAI
  - Qdrant Vector Database (@qdrant/js-client-rest 1.15.1)
- **Authentication**: JWT (jsonwebtoken 9.0.2) + bcryptjs 3.0.2
- **Security**: Helmet 8.1.0, CORS 2.8.5
- **Audio Transcription**: Google Gemini (multimodal audio transcription)
- **Text-to-Speech**: gTTS - Google Text-to-Speech (node-gtts 2.0.2)
- **File Processing**: Multer 2.0.2, pdf-parse 2.4.3
- **Utilities**: uuid 13.0.0, morgan 1.10.1

### Frontend (Web)
- **Framework**: Vue.js 3.5.22 with Composition API
- **Build Tool**: Vite 7.1.7
- **Router**: Vue Router 4.5.1
- **HTTP Client**: Axios 1.12.2
- **Markdown**: marked 16.4.1
- **OCR**: Tesseract.js 6.0.1 (ingredient label scanning)

### Mobile App
- **Framework**: React Native with Expo ~51.0.0
- **React**: 18.2.0
- **React Native**: 0.74.5
- **Navigation**: React Navigation 6.1.9
- **Storage**: AsyncStorage 1.23.1
- **Markdown**: react-native-markdown-display 7.0.2
- **HTTP Client**: Axios 1.6.2
- **Audio**: Expo Audio (recording and playback)
- **Speech Recognition**: Google Gemini (multimodal audio transcription)

## Project Architecture

```
skin-study/
├── backend/                           # Node.js/Express API Server
│   ├── server.js                     # Application entry point
│   ├── docker-compose.qdrant.yml     # Qdrant vector DB configuration
│   │
│   ├── controllers/                  # Business logic layer
│   │   ├── aiDermatologistController.js
│   │   ├── authController.js
│   │   ├── educationController.js
│   │   ├── ingredientController.js
│   │   ├── routineController.js
│   │   └── skinAnalysisController.js
│   │
│   ├── models/                       # MongoDB schemas
│   │   ├── User.js
│   │   ├── SkinAnalysis.js
│   │   ├── Ingredient.js
│   │   ├── EducationContent.js
│   │   └── DermatologyKnowledge.js   # RAG knowledge base
│   │
│   ├── routes/                       # API endpoints
│   │   ├── auth.js
│   │   ├── skinAnalysis.js
│   │   ├── education.js
│   │   ├── ingredients.js
│   │   ├── routines.js
│   │   └── aiDermatologist.js
│   │
│   ├── services/                     # External services
│   │   ├── geminiService.js         # Google Gemini AI integration
│   │   ├── ttsService.js            # gTTS text-to-speech
│   │   └── vectorService.js         # Qdrant vector search
│   │
│   ├── middleware/                   # Express middleware
│   │   └── auth.js                  # JWT authentication
│   │
│   ├── utils/                        # Utility functions
│   │   └── scoreAnalyzer.js         # Vector similarity analysis
│   │
│   ├── scripts/                      # Database & utility scripts
│   │   ├── seed/                    # Data seeding scripts
│   │   │   ├── seedIngredients.js
│   │   │   ├── seedEducation.js
│   │   │   ├── seedKnowledgeBase.js
│   │   │   └── seedExtractedKnowledge.js
│   │   ├── vectorDB/                # Vector database setup
│   │   ├── debugScore.js            # Similarity debugging
│   │   └── testRAG.js              # RAG system testing
│   │
│   ├── tools/                        # Python utilities
│   │   ├── extract_with_pdfminer.py
│   │   └── remove_metadata.py
│   │
│   ├── knowledge-sources/           # Knowledge base content
│   │   └── extracted-content/       # Extracted PDF content
│   │
│   ├── md-files/                    # Markdown documentation
│   └── qdrant_storage/              # Vector database storage
│
├── frontend/                         # Vue.js 3 Web Application
│   ├── index.html                   # HTML entry point
│   ├── vite.config.js               # Vite configuration
│   │
│   └── src/
│       ├── App.vue                  # Root component
│       ├── main.js                  # Application entry
│       │
│       ├── views/                   # Page components
│       │   ├── Home.vue
│       │   ├── SkinAnalysis.vue
│       │   ├── AIDermatologist.vue  # AI chat interface
│       │   ├── Education.vue
│       │   ├── EducationArticle.vue
│       │   ├── Ingredients.vue
│       │   ├── IngredientStudy.vue
│       │   ├── SkincareRoutines.vue
│       │   ├── Auth.vue
│       │   └── About.vue
│       │
│       ├── components/              # Reusable components
│       ├── router/                  # Vue Router config
│       ├── services/                # API services
│       └── assets/                  # Static assets
│
└── mobile-chat-app/                 # React Native Mobile App
    ├── App.js                       # Main app with navigation
    ├── app.json                     # Expo configuration
    ├── index.js                     # Entry point
    ├── install.sh                   # Installation script
    │
    ├── components/                  # React Native components
    │   ├── AIDermatologist.js      # AI chat screen
    │   ├── AIDermatologist.styles.js
    │   ├── ChatHistory.js          # Chat history with search
    │   └── LiveChatAI.js           # Live voice chat screen
    │
    ├── services/                    # API client
    │   └── api.js                   # Axios + AsyncStorage
    │
    ├── config/                      # Configuration files
    ├── assets/                      # App icons & images
    │
    ├── QUICKSTART.md               # Quick start guide
    ├── START_HERE.md               # Getting started
    └── README.md                   # Full documentation
```

## Core Features

### 1. **AI Dermatologist Assistant**
- **RAG-Powered Responses**: Uses Retrieval-Augmented Generation for accurate medical advice
- **Vector Search**: Qdrant vector database for semantic similarity matching
- **Context-Aware**: Retrieves relevant dermatology knowledge before generating responses
- **Multi-Platform**: Available on web (Vue.js) and mobile (React Native)
- **Chat History**: Persistent conversation storage with search functionality
- **Search Chat**: Search through conversation history across all sessions
- **Markdown Support**: Rich text formatting in responses
- **Offline Fallback**: Context-aware responses when backend unavailable
- **Voice-to-Text**: Audio transcription using Gemini multimodal API
- **Text-to-Speech**: AI responses converted to audio using gTTS with sentence-by-sentence streaming
- **Optimized TTS**: Sentence-level streaming for faster initial playback (~500ms vs 3-5s)
- **Clean Speech**: Automatic removal of markdown formatting and citations from spoken text
- **Live Chat**: Real-time voice conversation with AI (mobile app)

#### How It Works:
1. User asks question (text or voice) → converted to 768-dimensional vector embedding
2. Qdrant searches knowledge base for similar content (10 dermatology textbooks)
3. Top matching documents retrieved (cosine similarity scoring)
4. Context + question sent to Google Gemini AI
5. AI generates personalized response using retrieved context
6. Response formatted in markdown and displayed/spoken

### 2. **Skin Analysis System**
- **6-Question Quiz**: Comprehensive skin assessment
- **AI-Powered Analysis**: Machine learning-based skin type detection
- **Personalized Recommendations**: 
  - Morning skincare routine
  - Evening skincare routine
  - Beneficial ingredients
  - Ingredients to avoid
- **Session-Based**: Anonymous analysis with unique session IDs
- **History Tracking**: Authenticated users can view past analyses
- **Confidence Scoring**: Analysis confidence percentages

### 3. **Ingredient Database**
- **Comprehensive Database**: 25+ skincare ingredients with detailed profiles
- **Advanced Search**: Full-text search with autocomplete
- **Filtering**: By category, skin type, concern, safety rating
- **Detailed Information**:
  - Benefits and effectiveness
  - Safety information (comedogenic rating, irritation potential)
  - Pregnancy safety
  - Photosensitivity warnings
  - Ingredient interactions (avoid/synergistic)
  - Usage guidelines (time of day, application, wait times)
- **User Ratings**: 5-star rating system
- **Safety Scores**: Automated safety scoring algorithm
- **OCR Feature**: Scan product labels with Tesseract.js

### 4. **Education Content System**
- **Article Database**: Comprehensive skincare education
- **Categories**: Organized by topics (basics, concerns, treatments, etc.)
- **Tags**: Multi-tag filtering system
- **Search**: Full-text search across title and content
- **Author Profiles**: Expert credentials and bios
- **Metadata**: Read time, difficulty level, last reviewed date
- **SEO Optimization**: Meta titles, descriptions, keywords
- **Featured Content**: Promoted articles
- **View Tracking**: Article popularity metrics

### 5. **Skincare Routine Builder**
- **Custom Routines**: Create personalized morning/evening routines
- **Step-by-Step**: Ordered steps with timing instructions
- **Product Categories**: Cleanser, toner, serum, moisturizer, sunscreen, etc.
- **Wait Times**: Inter-step wait times for product absorption
- **Sharing**: Public/private routine visibility
- **Tagging**: Organize routines by skin type and concerns
- **User Management**: Save, edit, delete personal routines

### 6. **Vector Database (RAG System)**
- **Qdrant Vector DB**: High-performance vector similarity search
- **Embeddings**: 768-dimensional vectors via Google Generative AI
- **Collection Management**: Organized knowledge collections
- **Semantic Search**: Cosine similarity matching
- **Score Analysis**: Detailed similarity score debugging
- **Batch Processing**: Efficient bulk knowledge ingestion
- **Docker Support**: Containerized Qdrant deployment

## Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  profile: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    skinProfile: {
      currentSkinType: String,
      primaryConcerns: [String],
      allergies: [String],
      currentProducts: [String]
    }
  },
  analysisHistory: [ObjectId],  // References to SkinAnalysis
  routines: [ObjectId],         // References to SkincareRoutine
  createdAt: Date,
  updatedAt: Date
}
```

### SkinAnalysis Model
```javascript
{
  _id: ObjectId,
  sessionId: String (unique),
  userId: ObjectId (optional),
  responses: {
    skinType: String,
    oiliness: String,
    sensitivity: String,
    acneProneness: String,
    aging: String,
    environment: String
  },
  results: {
    primarySkinType: String,
    confidence: Number,
    concerns: [String],
    recommendations: {
      morning: [Object],
      evening: [Object],
      ingredients: {
        beneficial: [String],
        avoid: [String]
      }
    }
  },
  createdAt: Date
}
```

### Ingredient Model
```javascript
{
  _id: ObjectId,
  name: String (unique, required),
  alternativeNames: [String],
  category: String,
  description: String,
  benefits: [{
    benefit: String,
    skinType: String,
    effectivenessRating: Number
  }],
  concerns: [{
    concern: String,
    effectiveness: String
  }],
  safetyInfo: {
    comedogenicRating: Number (0-5),
    irritationPotential: String,
    pregnancySafe: Boolean,
    photosensitizing: Boolean
  },
  interactions: {
    avoid: [{
      ingredient: String,
      reason: String,
      severity: String
    }],
    synergistic: [{
      ingredient: String,
      benefit: String
    }]
  },
  usage: {
    timeOfDay: String,
    application: String,
    waitTime: String
  },
  rating: {
    average: Number,
    count: Number
  },
  safetyScore: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### DermatologyKnowledge Model (RAG)
```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  source: String,
  category: String,
  tags: [String],
  embedding: [Number],  // 768-dimensional vector
  metadata: {
    author: String,
    publicationDate: Date,
    reliability: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### EducationContent Model
```javascript
{
  _id: ObjectId,
  title: String (required),
  slug: String (unique),
  excerpt: String,
  content: String (required),
  category: String,
  tags: [String],
  author: {
    name: String,
    credentials: String,
    bio: String
  },
  metadata: {
    readTime: Number,
    difficulty: String,
    lastReviewed: Date
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  published: Boolean,
  featured: Boolean,
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## API Documentation

### Base URL
```
http://localhost:3004/api
```

### Authentication Routes (`/api/auth`)

#### POST `/register`
Register new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "userId",
    "email": "user@example.com",
    "profile": { ... }
  }
}
```

#### POST `/login`
Authenticate user and return JWT.

#### GET `/profile` (Protected)
Get current user profile.

#### PUT `/profile` (Protected)
Update user profile.

### Skin Analysis Routes (`/api/skin-analysis`)

#### POST `/analyze`
Submit skin analysis quiz.

**Request:**
```json
{
  "responses": {
    "skinType": "combination",
    "oiliness": "moderate",
    "sensitivity": "low",
    "acneProneness": "occasional",
    "aging": "prevention",
    "environment": "urban"
  },
  "userId": "optional_user_id"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "unique_session_id",
  "results": {
    "primarySkinType": "combination",
    "confidence": 85,
    "concerns": ["oiliness", "blackheads"],
    "recommendations": {
      "morning": [...],
      "evening": [...],
      "ingredients": {
        "beneficial": ["hyaluronic acid", "niacinamide"],
        "avoid": ["harsh alcohols", "fragrance"]
      }
    }
  }
}
```

#### GET `/history` (Protected)
Get user's analysis history.

#### GET `/:sessionId`
Get specific analysis by session ID.

### AI Dermatologist Routes (`/api/ai-dermatologist`)

#### POST `/chat`
Send message to AI dermatologist.

**Request:**
```json
{
  "message": "What should I do for dehydrated skin?",
  "conversationHistory": [
    { "role": "user", "content": "Previous question" },
    { "role": "assistant", "content": "Previous answer" }
  ]
}
```

**Response:**
```json
{
  "response": "For dehydrated skin, I recommend...",
  "sources": [...],
  "images": [],
  "timestamp": "2025-11-03T..."
}
```

**Features:**
- RAG-powered responses using vector search
- Retrieves top 3 most relevant knowledge documents from 10 dermatology textbooks
- Uses Google Gemini AI for response generation
- Markdown-formatted responses
- Context-aware recommendations
- Conversation history support

#### POST `/transcribe`
Transcribe audio to text using Gemini's multimodal API.

**Request:**
- `multipart/form-data`
- Field: `audio` (audio file, max 10MB)
- Supported formats: mp4, mpeg, wav, m4a, aac

**Response:**
```json
{
  "transcription": "What causes acne and how can I treat it?",
  "timestamp": "2025-11-06T...",
  "processingTime": 856
}
```

**Features:**
- Fast audio transcription using Google Gemini 2.0 Flash
- Multimodal AI-powered speech recognition
- Automatic punctuation and formatting
- English language support (expandable to 100+ languages)
- Error handling for empty/unclear audio

#### POST `/text-to-speech`
Convert text to speech audio using gTTS (Google Text-to-Speech).

**Request:**
```json
{
  "text": "For acne-prone skin, I recommend using salicylic acid..."
}
```

**Response:**
- Returns audio file (MP3 format)
- Content-Type: `audio/mpeg`
- Generated using Google Translate TTS API

**Features:**
- Natural-sounding voice synthesis
- Free Google Text-to-Speech (gTTS)
- Multiple language support (100+ languages)
- High-quality audio output
- Fast audio generation
- **Sentence-by-sentence streaming**: Plays first sentence in ~500ms instead of waiting for full response
- **Clean speech output**: Automatically removes markdown formatting and citations
  - Removes citation numbers: `[1]`, `[2]`, `[1,2]`, `[1-3]`
  - Removes markdown headers: `#`, `##`, `###`
  - Removes bold/italic markers: `**bold**`, `*italic*`
  - Removes bullet points and list markers
- **Progressive playback**: Displays text while speaking for better user experience

### Education Routes (`/api/education`)

#### GET `/content`
Get educational articles.

**Query Parameters:**
- `category` - Filter by category
- `tag` - Filter by tag
- `search` - Search in title/content
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

#### GET `/content/:id`
Get specific article.

#### GET `/categories`
Get all categories with counts.

#### GET `/search`
Full-text search.

### Ingredients Routes (`/api/ingredients`)

#### GET `/`
Get ingredients with filtering.

**Query Parameters:**
- `category` - Filter by category
- `skinType` - Filter by suitable skin type
- `concern` - Filter by skin concern
- `search` - Search ingredient names
- `sort` - Sort by: name, rating, category
- `page` - Page number
- `limit` - Items per page

#### GET `/:name`
Get detailed ingredient info.

#### POST `/:name/rate`
Rate ingredient (1-5 stars).

#### GET `/search/suggestions`
Get autocomplete suggestions.

#### GET `/categories`
Get ingredient categories.

#### GET `/top-rated`
Get top-rated ingredients.

### Skincare Routines Routes (`/api/routines`) (Protected)

#### GET `/`
Get user's routines.

#### POST `/`
Create new routine.

#### GET `/:id`
Get specific routine.

#### PUT `/:id`
Update routine.

#### DELETE `/:id`
Delete routine.

## Vector Search (RAG) System

### Architecture

```
User Question
    ↓
Generate Embedding (768-dim vector)
    ↓
Query Qdrant Vector DB
    ↓
Retrieve Top K Similar Documents (cosine similarity)
    ↓
Extract Context from Retrieved Documents
    ↓
Combine Context + Question
    ↓
Send to Google Gemini AI
    ↓
Generate Response
    ↓
Return to User
```

### Vector Similarity Scoring

**Cosine Similarity Formula:**
```
similarity = (A · B) / (||A|| × ||B||)
```

Where:
- A = Query embedding vector
- B = Document embedding vector
- A · B = Dot product
- ||A||, ||B|| = Vector magnitudes

**Score Interpretation:**
- 90-100%: Excellent match
- 70-90%: Good relevance
- 50-70%: Moderate relevance
- 30-50%: Weak relevance
- 0-30%: Poor relevance

### Qdrant Configuration

**Docker Compose Setup:**
```yaml
services:
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"  # REST API
      - "6334:6334"  # gRPC API
    volumes:
      - ./qdrant_storage:/qdrant/storage
```

**Collection Schema:**
- Vector size: 768 dimensions
- Distance metric: Cosine
- Payload: title, content, metadata
- Indexing: HNSW algorithm

## Development Setup

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)
- Docker (for Qdrant)
- Expo CLI (for mobile app)

### Backend Setup

```bash
cd backend
npm install

# Create .env file
PORT=3004
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_key
FRONTEND_URL=http://localhost:5175

# Start Qdrant
docker-compose -f docker-compose.qdrant.yml up -d

# Seed database
npm run seed
npm run seed:education
npm run seed:knowledge

# Setup vector DB
npm run setup:rag

# Start server
npm run dev  # Development
npm start    # Production
```

### Frontend Setup

```bash
cd frontend
npm install

# Start dev server
npm run dev  # http://localhost:5175

# Build for production
npm run build
```

### Mobile App Setup

```bash
cd mobile-chat-app
npm install

# Configure API URL in services/api.js
# For iOS Simulator: http://localhost:3004/api
# For Android Emulator: http://10.0.2.2:3004/api
# For Physical Device: http://YOUR_IP:3004/api

# Start Expo
npm start

# Run on platforms
npm run ios     # iOS Simulator
npm run android # Android Emulator
# OR scan QR code with Expo Go app
```

## Scripts & Utilities

### Backend Scripts

Located in `backend/scripts/`:

**Seed Scripts (`scripts/seed/`):**
- `seedIngredients.js` - Seed 25+ ingredients
- `seedEducation.js` - Seed educational content
- `seedKnowledgeBase.js` - Seed dermatology knowledge
- `seedExtractedKnowledge.js` - Import from JSON files

**Vector DB Scripts (`scripts/vectorDB/`):**
- Setup vector database
- Create collections
- Generate embeddings

**Debugging Scripts:**
- `debugScore.js` - Analyze similarity scores
- `testRAG.js` - Test RAG system
- `testScoreCalculation.js` - Vector math debugging
- `getChunkText.js` - Extract chunk content

**Python Tools (`tools/`):**
- `extract_with_pdfminer.py` - Extract text from PDFs
- `remove_metadata.py` - Clean PDF metadata

### Usage Examples

```bash
# Seed all data
node scripts/seed/seedIngredients.js
node scripts/seed/seedEducation.js
node scripts/seed/seedKnowledgeBase.js

# Test RAG system
node scripts/testRAG.js

# Debug vector scores
node scripts/debugScore.js

# Extract PDF content
python tools/extract_with_pdfminer.py input.pdf output.txt
```

## Security Features

### Backend Security
- **JWT Authentication**: Stateless token-based auth
- **Password Hashing**: bcryptjs with salt rounds
- **Helmet**: Security HTTP headers
- **CORS**: Controlled cross-origin access
- **Input Validation**: Mongoose schema validation
- **Rate Limiting**: Request throttling (planned)
- **Environment Variables**: Sensitive data protection

### Frontend Security
- **XSS Prevention**: Input sanitization
- **CSRF Protection**: Token-based protection
- **Secure Storage**: Token storage in localStorage
- **Route Guards**: Protected route access
- **HTTPS**: Production SSL/TLS

### Mobile Security
- **AsyncStorage**: Secure local data storage
- **Token Management**: Automatic token refresh
- **Secure API Calls**: HTTPS enforcement
- **Input Validation**: Client-side validation

## Performance Optimizations

### Backend
- **Database Indexing**: Optimized MongoDB indexes
- **Vector Search**: Efficient HNSW algorithm in Qdrant
- **Connection Pooling**: MongoDB connection management
- **Response Compression**: Gzip compression
- **Caching**: Response caching (planned)
- **Gemini Multimodal**: Single API for both transcription and AI responses (~850ms transcription)

### Frontend
- **Code Splitting**: Route-based lazy loading
- **Vite Optimization**: Fast build tool
- **Asset Optimization**: Image and CSS optimization
- **Tree Shaking**: Unused code elimination

### Mobile
- **Native Components**: React Native performance
- **Lazy Loading**: Component lazy loading
- **AsyncStorage**: Fast local storage
- **Optimized Rendering**: FlatList for long lists
- **Sentence-by-sentence TTS**: 83% faster initial audio playback (500ms vs 3-5s)
- **Ref-based State Management**: Immediate audio control without re-render delays
- **Progressive Text Display**: Show text while audio plays for better UX

## Performance Metrics

### TTS Optimization Results
- **Before optimization**: 3-5 seconds wait before audio starts playing
- **After optimization**: ~500ms until first sentence plays (83% improvement)
- **Method**: Split response into sentences, stream audio generation and playback
- **User Experience**: Near-instant feedback, similar to Gemini Live

### Audio Transcription Performance
- **Gemini Multimodal**: ~850ms average transcription time (65% improvement)
- **Benefit**: Faster voice-to-text conversion, simpler architecture (single API)

## Testing

### Backend Testing (Planned)
```bash
npm test              # Run all tests
npm run test:coverage # Coverage report
```

**Test Categories:**
- Unit tests: Models, controllers, services
- Integration tests: API endpoints
- RAG tests: Vector search accuracy

### Frontend Testing (Planned)
- Component testing with Vue Test Utils
- E2E testing with Cypress
- Visual regression testing

### Mobile Testing
```bash
npm run ios     # Test on iOS
npm run android # Test on Android
```

## Deployment

### Backend Deployment

**Environment Variables:**
```env
NODE_ENV=production
PORT=3004
MONGODB_URI=mongodb+srv://...
JWT_SECRET=production_secret
GEMINI_API_KEY=production_key
FRONTEND_URL=https://skinstudy.com
```

**Deployment Platforms:**
- Railway
- Heroku
- AWS (EC2, ECS)
- DigitalOcean

**Qdrant Deployment:**
- Docker container
- Qdrant Cloud (managed service)
- Self-hosted with persistent volumes

### Frontend Deployment

**Build:**
```bash
npm run build
# Output: dist/
```

**Platforms:**
- Netlify (recommended)
- Vercel
- AWS S3 + CloudFront
- GitHub Pages

### Mobile App Deployment

**iOS:**
```bash
expo build:ios
# Submit to App Store
```

**Android:**
```bash
expo build:android
# Submit to Play Store
```

## Mobile App Features

### Core Features

**Text Chat with AI Dermatologist:**
- Full-featured chat interface with markdown support
- Conversation history with search
- Session management and recovery
- Offline message queuing

**Live Voice Chat:**
- Real-time voice conversation with AI
- Automatic speech-to-text transcription using Gemini multimodal API
- Text-to-speech AI responses (gTTS - Google Text-to-Speech)
- **Sentence-by-sentence TTS streaming** for instant feedback
- **Clean speech output** without markdown or citation numbers
- Visual feedback with pulsing animations
- Recording controls (pause, resume, stop)
- Conversation history with timestamps

**Search Functionality:**
- Search across all chat sessions (text and live)
- Filter by chat type (text/live/all)
- Search in message content, titles, and previews
- Real-time search results

**Session Management:**
- Save and load conversation sessions
- Auto-generated session titles from first message
- Session previews showing last message
- Delete individual sessions
- Timestamp display (Today, Yesterday, X days ago)

### Platform-Specific

**iOS:**
- Native navigation
- Face ID/Touch ID (planned)
- Push notifications (planned)

**Android:**
- Material Design components
- Biometric auth (planned)
- Firebase messaging (planned)

### Offline Capabilities
- Cached chat history
- Fallback responses
- Queue API requests
- Sync when online

## Knowledge Base

### Content Sources

The vector database is powered by **10 comprehensive dermatology textbooks** providing expert-level medical knowledge:

1. **Chemical Peels - Procedures in Cosmetic Dermatology Series, 3rd Edition (2020)** by Suzan Obagi
2. **Cosmeceuticals and Cosmetic Ingredients**
3. **Cosmetic Dermatology - Principles and Practice**
4. **Cosmetic Dermatology - Products and Procedures** by Draelos, 2nd Edition (2016)
5. **Cosmetics and Dermatological Problems and Solutions - A Problem-Based Approach**
6. **Fitzpatrick's Dermatology in General Medicine (8th Edition)**
7. **Lasers in Dermatology and Medicine - Dermatologic Applications** by Keyvan Nouri
8. **Skin Care - Beyond the Basics, 4th Edition**
9. **Textbook of Cosmetic Dermatology**
10. **The Art of Skin Health Restoration and Rejuvenation - The Science of Clinical Practice**

All texts are stored in `backend/knowledge-sources/extracted-content/` and processed into vector embeddings for semantic search.

### Content Processing
1. PDF extraction with pdfminer
2. Text cleaning and chunking
3. Embedding generation (768-dim vectors)
4. Storage in Qdrant vector database
5. Indexing for fast retrieval using HNSW algorithm

### Quality Assurance
- Medical-grade dermatology textbooks
- Reliability scoring
- Source verification
- Regular content updates
- Expert review process

## Monitoring & Analytics

### Backend Monitoring (Planned)
- API response times
- Error tracking
- Usage analytics
- Vector search performance

### Frontend Analytics (Planned)
- Page views
- User interactions
- Conversion tracking
- Performance metrics

## Recent Enhancements (2025)

### Knowledge Base Expansion
- **10 Professional Dermatology Textbooks**: Expanded vector database with comprehensive medical literature including Fitzpatrick's Dermatology, Cosmetic Dermatology textbooks, and specialized works on chemical peels, lasers, and skin health restoration
- **Enhanced RAG System**: Improved context retrieval from 10,000+ medical text chunks
- **Higher Accuracy**: More precise answers backed by authoritative medical sources

### Voice & Audio Features
- **Audio Transcription**: Gemini multimodal API integration for fast, high-quality speech-to-text conversion
  - **Gemini transcription**: ~850ms
  - **Direct audio processing**: Base64-encoded audio sent to Gemini 2.0 Flash
  - **No external API dependencies**: Single API for both AI responses and transcription
- **Text-to-Speech Optimization**: Major performance improvements in audio playback
  - **Sentence-by-sentence streaming**: First sentence plays in ~500ms (was 3-5s)
  - **Progressive audio generation**: Each sentence requested and played sequentially
  - **Clean speech output**: Automatic removal of markdown and citations
    - Filters out citation formats: `[1]`, `[2]`, `[1,2]`, `[1-3]`, `[10]`, etc.
    - Removes markdown headers, bold/italic markers, bullet points
    - Preserves natural speech flow
  - **Immediate playback control**: Stop/pause audio instantly with ref-based state management
- **Live Voice Chat**: Real-time voice conversation with AI dermatologist (mobile app)
- **Recording Controls**: Pause, resume, and stop functionality for voice interactions
- **Visual Feedback**: Animated pulsing effects during recording and AI speech

### Search & History
- **Search Chat**: Full-text search across all conversation history
- **Multi-Session Search**: Search through both text chats and live voice chat sessions
- **Session Management**: Load, save, and delete individual chat sessions
- **Auto-Generated Titles**: Automatic session titles based on first message
- **Smart Timestamps**: Relative timestamps (Today, Yesterday, X days ago)

### Mobile App Enhancements
- **ChatHistory Component**: Unified history viewer for all chat types
- **LiveChatAI Component**: Dedicated live voice chat screen with animations
- **Session Recovery**: Resume previous conversations seamlessly
- **Offline Queue**: Queue messages when offline, sync when reconnected
- **Better UX**: Improved visual design with pink theme and gradient backgrounds
- **Optimized TTS Performance**: 
  - Sentence-by-sentence streaming reduces initial wait time by 83% (500ms vs 3-5s)
  - Progressive text display during speech playback
  - Ref-based playback control for immediate stop/pause
- **Clean Audio Output**: Automatic filtering of markdown and citations from speech

## Future Enhancements

### Planned Features
- [ ] Multi-language support
- [ ] Product recommendations
- [ ] Skin tracking photos
- [ ] Community forum
- [ ] Expert consultations
- [ ] Telemedicine integration
- [ ] Advanced analytics dashboard
- [ ] Social sharing features
- [ ] Subscription plans
- [ ] Progressive Web App (PWA)

### Technical Improvements
- [x] **Advanced RAG System**: 10 dermatology textbooks vectorized for semantic search
- [x] **Voice Integration**: Gemini multimodal audio transcription + gTTS (Google Text-to-Speech)
- [x] **Optimized TTS Performance**: Sentence-by-sentence streaming for 83% faster playback
- [x] **Clean Speech Output**: Automatic removal of markdown and citations from audio
- [x] **Search Functionality**: Full-text search across conversation history
- [x] **Session Management**: Save, load, and search chat sessions
- [ ] Redis caching layer
- [ ] GraphQL API
- [ ] WebSocket real-time updates
- [ ] Multi-modal AI (image analysis)
- [ ] Microservices architecture
- [ ] CI/CD pipeline
- [ ] Comprehensive testing suite

## Documentation Files

### Backend
- `README.md` - Complete backend documentation
- `SCORE_EXPLANATION.md` - Vector similarity analysis guide
- `scripts/README.md` - Scripts documentation
- `controllers/README.md` - Controller documentation

### Frontend
- `README.md` - Web app documentation
- Design system documentation
- Component library docs

### Mobile
- `README.md` - Full mobile app docs
- `START_HERE.md` - Getting started guide
- `QUICKSTART.md` - Quick reference
- `config/API_CONFIG.md` - API configuration

## Contributing

### Development Workflow
1. Fork repository
2. Create feature branch
3. Implement changes
4. Add tests
5. Update documentation
6. Submit pull request

### Code Standards
- ESLint for JavaScript
- Prettier for formatting
- Conventional commits
- JSDoc comments
- Comprehensive error handling

## License

This project is developed for educational purposes as part of a university final year project.

## Support & Resources

### Documentation
- Backend API: `/backend/README.md`
- Frontend: `/frontend/README.md`
- Mobile: `/mobile-chat-app/README.md`
- Vector Search: `/backend/SCORE_EXPLANATION.md`

### External Resources
- [Google Generative AI](https://ai.google.dev/)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [LangChain Docs](https://js.langchain.com/docs/)
- [Vue.js 3](https://vuejs.org/)
- [React Native](https://reactnative.dev/)
- [Expo](https://docs.expo.dev/)

---

**Project**: Skin Study - AI Dermatology Platform  
**Version**: 1.2.0  
**Last Updated**: November 6, 2025  
**Repository**: Truc4p/final-project  
**Type**: Final Year Project (FYP)
