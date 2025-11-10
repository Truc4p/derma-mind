# Skin Study - Final Year Project Technical Documentation
## Part 1: Overview, Architecture, and Technology Stack

---

## 1. PROJECT OVERVIEW

### 1.1 Project Name
**Skin Study - Intelligent Facial Skin Health & Beauty Platform**

### 1.2 Project Description
Skin Study is a comprehensive multi-platform application that provides AI-powered dermatological consultation, personalized skin analysis, educational content, and skincare recommendations. The system leverages advanced technologies including:
- **Retrieval-Augmented Generation (RAG)** with vector databases
- **Google Gemini AI** for natural language processing and vision analysis
- **Multi-modal AI** supporting text, image, and voice interactions
- **Cross-platform architecture** (Web, Mobile)

### 1.3 Project Scope
The project consists of three main platforms:
1. **Web Application** - Full-featured platform for skin analysis, education, and AI consultation
2. **Mobile Chat App** - React Native mobile application for on-the-go AI dermatologist access
3. **Backend API** - RESTful API with AI services, RAG implementation, and database management

---

## 2. SYSTEM ARCHITECTURE

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
├──────────────────┬──────────────────┬──────────────────────┤
│   Web Frontend   │  Mobile App      │   Future Clients     │
│   (Vue.js)       │  (React Native)  │                      │
└────────┬─────────┴────────┬─────────┴──────────────────────┘
         │                  │
         │    HTTP/REST     │
         ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   API GATEWAY LAYER                         │
│              Express.js Backend Server                      │
│                  (Port: 5000)                               │
└────────┬────────────────────────────────────────────────────┘
         │
         ├──────────────┬──────────────┬──────────────┬───────┤
         ▼              ▼              ▼              ▼       ▼
┌─────────────┐ ┌─────────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐
│   MongoDB   │ │   Qdrant    │ │ Gemini   │ │  File    │ │ Google │
│  Database   │ │   Vector    │ │   API    │ │ Storage  │ │  TTS   │
│             │ │     DB      │ │          │ │          │ │  API   │
└─────────────┘ └─────────────┘ └──────────┘ └──────────┘ └────────┘
```

### 2.2 Component Architecture

#### Backend Components
```
backend/
├── server.js                    # Main server entry point
├── controllers/                 # Request handlers
│   ├── authController.js
│   ├── skinAnalysisController.js
│   ├── aiDermatologistController.js
│   ├── educationController.js
│   ├── ingredientController.js
│   └── routineController.js
├── services/                    # Business logic layer
│   ├── geminiService.js        # AI integration
│   ├── vectorService.js        # RAG & vector DB
│   └── ttsService.js           # Text-to-speech
├── models/                      # Data models
├── routes/                      # API routing
├── middleware/                  # Authentication, validation
└── knowledge-sources/           # RAG knowledge base
```

#### Frontend Components
```
frontend/
├── src/
│   ├── views/                  # Page components
│   │   ├── Home.vue
│   │   ├── SkinAnalysis.vue
│   │   ├── AIDermatologist.vue
│   │   └── Education.vue
│   ├── components/             # Reusable components
│   ├── services/               # API clients
│   └── router/                 # Navigation
```

#### Mobile App Components
```
mobile-chat-app/
├── components/
│   ├── AIDermatologist.js      # Text chat interface
│   ├── LiveChatAI.js           # Voice chat interface
│   └── ChatHistory.js          # Session management
├── services/
│   └── api.js                  # API integration
```

---

## 3. TECHNOLOGY STACK

### 3.1 Backend Technologies

#### Core Framework
- **Node.js** (v18+) - JavaScript runtime environment
- **Express.js** (v4.19.2) - Web application framework
  - Lightweight and flexible
  - Extensive middleware ecosystem
  - RESTful API development

#### Database & Storage
- **MongoDB** (v8.18.3) - NoSQL document database
  - Flexible schema for user profiles
  - Skin analysis history storage
  - Education content management
  - Connected via Mongoose ODM

- **Qdrant** (v1.15.1) - Vector database for RAG
  - Stores dermatology knowledge embeddings
  - Cosine similarity search
  - 768-dimensional vectors (Gemini embeddings)
  - Local deployment (Port: 6333)

#### AI & Machine Learning
- **Google Generative AI** (@google/generative-ai v0.21.0)
  - **Gemini 2.0 Flash Exp** - Primary AI model
    - Temperature: 0.7
    - Max Output Tokens: 4096
    - Supports text, vision, and audio
  - **Text-Embedding-004** - Embedding model
    - 768-dimensional vectors
    - Used for RAG semantic search

- **LangChain** (v0.3.36)
  - Document processing
  - Text splitting (RecursiveCharacterTextSplitter)
  - Chunk size: 1500 tokens
  - Chunk overlap: 300 tokens

#### Additional Services
- **Google Cloud Text-to-Speech** (@google-cloud/speech v7.2.1)
  - Voice output for AI responses
  - MP3 audio generation

#### Security & Authentication
- **bcryptjs** (v3.0.2) - Password hashing (12 salt rounds)
- **jsonwebtoken** (v9.0.2) - JWT authentication
- **helmet** (v8.1.0) - Security headers
- **cors** (v2.8.5) - Cross-origin resource sharing

#### File Handling
- **multer** (v2.0.2) - Multipart form data
  - Image upload for skin analysis
  - Audio file processing
  - 10MB file size limit

#### Utilities
- **dotenv** (v17.2.3) - Environment configuration
- **morgan** (v1.10.1) - HTTP request logging
- **uuid** (v13.0.0) - Unique identifier generation

### 3.2 Frontend Technologies (Web)

#### Core Framework
- **Vue.js** (v3.5.22) - Progressive JavaScript framework
  - Composition API
  - Reactive data binding
  - Component-based architecture

#### Build Tools
- **Vite** (v7.1.7) - Next-generation frontend tooling
  - Fast hot module replacement (HMR)
  - Optimized production builds
  - ES modules support

#### HTTP Client
- **Axios** (v1.12.2) - Promise-based HTTP client
  - RESTful API communication
  - Request/response interceptors
  - Error handling

#### Additional Libraries
- **Vue Router** (v4.5.1) - Official routing
- **marked** (v16.4.1) - Markdown parsing
- **Tesseract.js** (v6.0.1) - OCR for ingredient analysis

### 3.3 Mobile Technologies

#### Framework
- **React Native** (v0.74.5) - Cross-platform mobile framework
- **Expo** (~51.0.0) - React Native development framework
  - Simplified development workflow
  - Built-in APIs for native features

#### Navigation
- **React Navigation** (v6.1.9)
  - Native Stack Navigator (v6.9.17)
  - Screen transitions

#### State & Storage
- **AsyncStorage** (v1.23.1) - Persistent local storage
  - Chat history persistence
  - User preferences

#### Audio & Media
- **Expo AV** (~14.0.7) - Audio/video playback
- **Expo Speech** (~12.0.2) - Text-to-speech
- **Expo Speech Recognition** (v2.1.5) - Speech-to-text

#### UI & Rendering
- **React Native Render HTML** (v6.3.4) - HTML rendering
- **React Native Markdown Display** (v7.0.2) - Markdown rendering

#### HTTP Client
- **Axios** (v1.6.2) - API communication

### 3.4 Development Tools

#### Backend Development
- **nodemon** (v3.1.10) - Auto-restart on file changes

#### Version Control
- **Git** - Source code management
- **GitHub** - Remote repository hosting

#### Package Managers
- **npm** - Node Package Manager (backend, frontend)
- **npm** - React Native dependencies

---

## 4. DATABASE DESIGN

### 4.1 MongoDB Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  skinProfile: {
    skinType: Enum['oily', 'dry', 'combination', 'sensitive', 'normal'],
    skinConcerns: Array[String],
    skinTone: Enum['fair', 'light', 'medium', 'tan', 'deep'],
    age: Number,
    lifestyle: {
      climate: String,
      activityLevel: Enum['low', 'moderate', 'high'],
      sleepHours: Number
    }
  },
  skinAnalysisHistory: [{
    date: Date,
    results: {
      skinType: String,
      concerns: Array[String],
      recommendations: Array[String],
      score: Number
    }
  }],
  preferences: {
    newsletter: Boolean,
    skinReminders: Boolean
  },
  role: Enum['user', 'admin'],
  timestamps: { createdAt, updatedAt }
}
```

#### Skin Analysis Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, nullable),
  sessionId: String (UUID),
  responses: {
    skinFeeling: String,
    skinAppearance: String,
    poreSize: String,
    breakoutFrequency: String,
    skinReaction: String,
    ageGroup: String,
    primaryConcerns: Array[String],
    lifestyle: {
      stressLevel: String,
      sleepQuality: String,
      exercise: String,
      diet: String
    }
  },
  results: {
    skinType: String,
    skinTypeConfidence: Number,
    primaryConcerns: [{
      concern: String,
      severity: String,
      priority: Number
    }],
    overallScore: Number (0-100),
    recommendations: {
      routine: {
        morning: Array[{ step, product, purpose, frequency }],
        evening: Array[{ step, product, purpose, frequency }]
      },
      ingredients: {
        beneficial: Array[{ name, purpose, concentration }],
        avoid: Array[{ name, reason }]
      },
      lifestyle: Array[{ category, recommendation, impact }]
    }
  },
  analysisDate: Date,
  ipAddress: String,
  userAgent: String
}
```

#### Education Content Collection
```javascript
{
  _id: ObjectId,
  title: String,
  slug: String (unique),
  category: Enum['skincare-basics', 'ingredients', 'concerns', 'procedures'],
  difficulty: Enum['beginner', 'intermediate', 'advanced'],
  content: {
    introduction: String,
    sections: [{
      heading: String,
      content: String
    }],
    keyTakeaways: Array[String]
  },
  relatedTopics: Array[String],
  sources: Array[String],
  author: String,
  readTime: Number (minutes),
  published: Boolean,
  timestamps: { createdAt, updatedAt }
}
```

#### Ingredients Collection
```javascript
{
  _id: ObjectId,
  name: String (indexed),
  commonNames: Array[String],
  category: Enum['moisturizer', 'exfoliant', 'antioxidant', 'etc'],
  description: String,
  benefits: Array[String],
  bestFor: Array[String] (skin types),
  concerns: Array[String] (addresses),
  concentration: {
    min: Number,
    max: Number,
    optimal: Number,
    unit: String
  },
  usage: {
    frequency: String,
    timeOfDay: Enum['morning', 'evening', 'both'],
    instructions: String
  },
  compatibility: {
    mixWellWith: Array[String],
    avoid: Array[String]
  },
  sideEffects: Array[String],
  contraindications: Array[String],
  scientificName: String,
  evidenceLevel: Enum['high', 'moderate', 'limited'],
  sources: Array[String]
}
```

### 4.2 Qdrant Vector Database

#### Collection: dermatology_knowledge

**Configuration:**
- **Vector Dimension:** 768 (Gemini text-embedding-004)
- **Distance Metric:** Cosine similarity
- **Index Type:** HNSW (Hierarchical Navigable Small World)

**Point Structure:**
```javascript
{
  id: Number (sequential),
  vector: Array[Float] (768 dimensions),
  payload: {
    text: String (chunk content),
    metadata: {
      source: String (book/document name),
      fileName: String,
      chunkIndex: Number (global),
      fileChunkIndex: Number (within file),
      totalChunksInFile: Number
    }
  }
}
```

**Knowledge Sources:**
The vector database is populated from authoritative dermatology textbooks:
1. Chemical Peels - Procedures in Cosmetic Dermatology Series, 3rd Edition (2020)
2. Cosmeceuticals and Cosmetic Ingredients
3. Cosmetic Dermatology - Principles and Practice
4. Cosmetics and Dermatological Problems and Solutions
5. Fitzpatrick's Dermatology in General Medicine (8th Edition)
6. Lasers in Dermatology and Medicine
7. Skin Care - Beyond the Basics, 4th Edition
8. Textbook of Cosmetic Dermatology

**Chunking Strategy:**
- Chunk Size: 1,500 characters
- Overlap: 300 characters
- Separators: Double newlines, single newlines, periods, spaces
- Total Indexed Chunks: ~3,000-5,000 (varies based on source material)

---

## 5. API ARCHITECTURE

### 5.1 RESTful API Design

**Base URL:** `http://localhost:5000/api`

**Response Format:**
```javascript
{
  success: Boolean,
  data: Object | Array,
  message: String (optional),
  error: String (optional)
}
```

### 5.2 API Endpoints Overview

#### Authentication Routes (`/api/auth`)
- POST `/register` - User registration
- POST `/login` - User authentication
- GET `/profile` - Get user profile (protected)
- PUT `/profile` - Update user profile (protected)

#### Skin Analysis Routes (`/api/skin-analysis`)
- POST `/analyze` - Perform skin analysis
- GET `/history` - Get analysis history (protected)
- GET `/:sessionId` - Get specific analysis
- GET `/stats/overview` - Get statistics (admin)

#### AI Dermatologist Routes (`/api/ai-dermatologist`)
- POST `/chat` - Text-based AI consultation
- POST `/analyze-skin` - Image analysis with AI
- POST `/transcribe` - Audio to text transcription
- POST `/text-to-speech` - Text to audio conversion

#### Education Routes (`/api/education`)
- GET `/articles` - Get all articles
- GET `/articles/:slug` - Get article by slug
- GET `/categories` - Get categories
- POST `/articles` - Create article (admin)
- PUT `/articles/:id` - Update article (admin)

#### Ingredients Routes (`/api/ingredients`)
- GET `/` - Get all ingredients
- GET `/search` - Search ingredients
- GET `/:id` - Get ingredient details
- POST `/` - Add ingredient (admin)

#### Skincare Routines Routes (`/api/routines`)
- GET `/` - Get routines
- POST `/generate` - Generate personalized routine
- GET `/:id` - Get routine by ID

### 5.3 Request/Response Examples

#### Example: AI Chat Request
```http
POST /api/ai-dermatologist/chat
Content-Type: application/json

{
  "message": "What's a good routine for oily skin?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous message",
      "timestamp": "2024-01-01T10:00:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "response": "For oily skin, I recommend...",
  "sources": [
    {
      "text": "Excerpt from knowledge base...",
      "score": 0.87,
      "metadata": {
        "source": "Cosmetic Dermatology - Principles and Practice",
        "chunkIndex": 156
      }
    }
  ],
  "timestamp": "2024-01-01T10:00:01Z"
}
```

---

*Continued in Part 2...*
