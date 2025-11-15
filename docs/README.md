# 🌟 Skin Study - AI-Powered Skincare Assistant

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/Truc4p/skin-study)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Native](https://img.shields.io/badge/react--native-0.74.5-blue.svg)](https://reactnative.dev/)

An intelligent skincare platform that combines advanced AI technology with evidence-based dermatological knowledge to provide personalized skincare recommendations, real-time consultations, and educational resources.

---

## 📋 Table of Contents

- [Features](#-features)
- [What's New](#-whats-new)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Documentation](#-documentation)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🤖 AI Dermatology Expert (RAG-Powered)
- **Multilingual Support** - Ask questions in 100+ languages (Vietnamese, Chinese, Japanese, etc.)
- **Evidence-based Responses** - Powered by 10 authoritative dermatology textbooks
- **Smart Citations** - Every answer includes medical references
- **Voice Chat** - Real-time voice conversations with AI
- **Image Analysis** - Upload skin photos for professional assessment
- **Conversation History** - Context-aware follow-up questions

### 📊 Intelligent Skin Analysis
- **8-Step Questionnaire** - Comprehensive skin assessment
- **Smart Algorithm** - Analyzes 15+ skin indicators
- **Personalized Score** - Get your skin health score (0-100)
- **Custom Recommendations** - Tailored skincare routines
- **Ingredient Suggestions** - Science-backed product recommendations

### 📚 Education Hub
- **50+ Articles** - Expert-written skincare guides
- **Multiple Categories** - Acne, aging, pigmentation, routines, ingredients
- **Difficulty Levels** - Beginner to advanced content
- **Search & Filter** - Find exactly what you need

### 🧪 Ingredient Database
- **Comprehensive Database** - 100+ skincare ingredients
- **Detailed Information** - Benefits, side effects, concentrations
- **Smart Search** - Find ingredients by name or function
- **Safety Ratings** - Evidence-based safety information

### 📱 Multi-Platform
- **Web Application** - Desktop and mobile responsive
- **Mobile Apps** - Native iOS and Android (React Native)
- **Offline Capability** - Access saved information offline (mobile)

---

## 🆕 What's New

### Version 1.1.0 (November 2025)

#### 🌍 Multilingual Support with Automatic Translation
**Major Feature Addition**

The AI Dermatology Expert now supports queries in any language while maintaining high-quality responses!

**What Changed:**
- ✅ Automatic language detection for user queries
- ✅ Query translation to English for optimal RAG retrieval
- ✅ AI responses generated in user's original language
- ✅ 25-50% improvement in RAG accuracy for non-English queries

**Example:**
```
Vietnamese Query: "Mụn là gì?"
Translation: "What is acne"
RAG Similarity: 73% (was 48%)
Response: Detailed Vietnamese answer with medical citations
```

**Performance:**
- Before: Vietnamese queries got 48% similarity → irrelevant results
- After: Vietnamese queries get 73% similarity → relevant medical content
- Added latency: Only ~500-800ms (acceptable)

**Supported Languages:** Vietnamese, Chinese, Japanese, Korean, Spanish, French, German, Thai, Indonesian, and 40+ more!

[Read Full Documentation →](docs/MULTILINGUAL_SUPPORT.md)

---

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB (user data, content)
- **Vector DB:** Qdrant (RAG knowledge base)
- **AI:** Google Gemini 2.0 Flash
- **Embeddings:** text-embedding-004 (768 dimensions)

### Frontend
- **Framework:** Vue.js 3 (Composition API)
- **Build Tool:** Vite
- **Routing:** Vue Router
- **HTTP Client:** Axios
- **Markdown:** Marked

### Mobile
- **Framework:** React Native + Expo
- **Navigation:** React Navigation
- **Storage:** AsyncStorage
- **Audio:** Expo AV, Expo Speech
- **Voice:** Expo Speech Recognition

### AI & ML
- **Language Model:** Gemini 2.0 Flash Exp
- **Embedding Model:** text-embedding-004
- **Vector Search:** Qdrant (cosine similarity)
- **TTS:** Google Translate TTS
- **OCR:** Tesseract.js

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENT LAYER                          │
├──────────────┬──────────────┬──────────────────────────┤
│ Web Frontend │  Mobile App  │   Future Clients         │
│  (Vue.js)    │ (React Native)│                          │
└──────┬───────┴──────┬───────┴──────────────────────────┘
       │              │
       │  HTTP/REST   │
       ▼              ▼
┌─────────────────────────────────────────────────────────┐
│              API GATEWAY (Express.js)                   │
│                   Port: 3004                            │
└──────┬──────────────────────────────────────────────────┘
       │
       ├──────┬──────────┬──────────┬──────────┬──────────┤
       ▼      ▼          ▼          ▼          ▼          ▼
   MongoDB  Qdrant   Gemini AI   File      Google      Auth
    (Data)  (Vector)  (LLM)     Storage     TTS      (JWT)
```

### RAG Pipeline (Multilingual)

```
User Query (Any Language)
    ↓
Language Detection & Translation
    ↓
English Query → Vector Search (Qdrant)
    ↓
Retrieve Top 3 Chunks (70-75% similarity)
    ↓
AI Response (Gemini) in User's Language
    ↓
Formatted Response with Citations
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- MongoDB ([Atlas Free Tier](https://www.mongodb.com/cloud/atlas) or local)
- Docker (for Qdrant vector database)
- Google Gemini API Key ([Get Free API Key](https://ai.google.dev/))

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**.env Configuration:**
```env
NODE_ENV=development
PORT=3004
FRONTEND_URL=http://localhost:5175
MONGODB_URI=mongodb://localhost:27017/skin-study
JWT_SECRET=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key
QDRANT_URL=http://localhost:6333
```

**Start Qdrant (Vector Database):**
```bash
# Using Docker Compose
docker-compose -f docker-compose.qdrant.yml up -d
```

**Initialize Vector Database (First Time Only):**
```bash
# Load and index dermatology knowledge base
node scripts/vectorDB/setupVectorDB.js
```

**Start Backend Server:**
```bash
npm start
# Server runs on http://localhost:3004
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3004/api" > .env

# Start development server
npm run dev
# Frontend runs on http://localhost:5175
```

### Mobile App Setup

```bash
# Navigate to mobile app directory
cd mobile-chat-app

# Install dependencies
npm install

# Start Expo development server
npx expo start

# Options:
# - Press 'a' for Android emulator
# - Press 'i' for iOS simulator
# - Scan QR code with Expo Go app for physical device
```

---

## 📖 Documentation

Comprehensive documentation available in the `/docs` folder:

### Core Documentation
- [Part 1 - Project Overview & Backend](docs/PROJECT_DOCUMENTATION_PART1.md)
- [Part 2 - Core Features & AI Implementation](docs/PROJECT_DOCUMENTATION_PART2.md)
- [Part 3 - Frontend & Mobile Apps](docs/PROJECT_DOCUMENTATION_PART3.md)
- [Part 4 - Advanced Features](docs/PROJECT_DOCUMENTATION_PART4.md)
- [Part 5 - Database & Models](docs/PROJECT_DOCUMENTATION_PART5.md)
- [Part 6 - Deployment & Production](docs/PROJECT_DOCUMENTATION_PART6.md)

### Feature Documentation
- [Multilingual Support Guide](docs/MULTILINGUAL_SUPPORT.md) 🆕
- [Technologies Used](docs/TECHNOLOGIES_USED.md)
- [Changelog](docs/CHANGELOG.md)

---

## 📁 Project Structure

```
skin-study/
├── backend/
│   ├── controllers/         # Request handlers
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── services/           # Business logic (AI, Vector, TTS)
│   ├── middleware/         # Auth, validation
│   ├── knowledge-sources/  # Dermatology textbooks
│   ├── uploads/            # User uploads (images, audio)
│   └── server.js           # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable Vue components
│   │   ├── views/          # Page components
│   │   ├── router/         # Route definitions
│   │   ├── services/       # API client
│   │   └── main.js         # Entry point
│   └── vite.config.js
│
├── mobile-chat-app/
│   ├── components/         # React Native screens
│   ├── services/           # API client
│   └── App.js              # Entry point
│
└── docs/                   # Complete documentation
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register        # Create account
POST   /api/auth/login           # Login
GET    /api/auth/profile         # Get user profile
PUT    /api/auth/profile         # Update profile
```

### AI Dermatology Expert
```
POST   /api/ai-dermatology-expert/chat              # Text chat (multilingual)
POST   /api/ai-dermatology-expert/analyze-skin      # Image analysis
POST   /api/ai-dermatology-expert/transcribe        # Audio transcription
POST   /api/ai-dermatology-expert/text-to-speech    # Generate speech
```

### Skin Analysis
```
POST   /api/skin-analysis/analyze              # Analyze questionnaire
GET    /api/skin-analysis/history              # Get user history
GET    /api/skin-analysis/:id                  # Get specific analysis
```

### Education
```
GET    /api/education/articles                 # List articles
GET    /api/education/articles/:slug           # Get article by slug
```

### Ingredients
```
GET    /api/ingredients                        # List all ingredients
GET    /api/ingredients/search?q=niacinamide   # Search ingredients
GET    /api/ingredients/:id                    # Get ingredient details
```

---

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Test RAG system
node scripts/testRAG.js

# Test specific query
node scripts/debugScore.js
```

### Frontend Testing
```bash
cd frontend
npm run dev
# Open http://localhost:5175
```

### Mobile Testing
```bash
cd mobile-chat-app
npx expo start
# Test on iOS Simulator, Android Emulator, or physical device
```

---

## 🌐 Deployment

### Backend Deployment Options
- **Recommended:** Railway, Render, or Heroku
- **Advanced:** AWS EC2, DigitalOcean

### Frontend Deployment
- **Recommended:** Vercel or Netlify (optimized for Vite)
- **Alternative:** GitHub Pages, AWS S3 + CloudFront

### Mobile Deployment
- **Build:** Expo Application Services (EAS)
- **Distribute:** Apple App Store, Google Play Store

[See Full Deployment Guide →](docs/PROJECT_DOCUMENTATION_PART6.md)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit changes:** `git commit -m 'Add amazing feature'`
4. **Push to branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting

---

## 📊 Performance

### Response Times
- AI Chat (English): 3-5 seconds
- AI Chat (Multilingual): 4-6 seconds
- Vector Search: <500ms
- Skin Analysis: <1 second
- Image Analysis: 5-8 seconds

### Scalability
- Handles 100+ concurrent users
- MongoDB Atlas auto-scaling
- Qdrant efficient vector indexing
- Gemini API rate limits handled

---

## 🔐 Security

- ✅ JWT authentication with 7-day expiration
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Input validation and sanitization
- ✅ File upload restrictions
- ✅ Environment variable protection

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Final Year Project (FYP-c1682)**  
University of Greenwich  
**Developer:** Truc4p  
**Year:** 2025

---

## 🙏 Acknowledgments

### Knowledge Sources
Special thanks to the authors and publishers of the dermatology textbooks that power our AI:
- Fitzpatrick's Dermatology in General Medicine
- Cosmetic Dermatology - Principles and Practice
- And 7 other authoritative sources

### Technologies
- Google Gemini AI team
- Qdrant vector database
- Vue.js and React Native communities
- All open-source contributors

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/Truc4p/skin-study/issues)
- **Documentation:** [Full Docs](docs/)
- **Email:** [Project Contact]

---

## 🗺 Roadmap

### Upcoming Features
- [ ] WebSocket for real-time chat
- [ ] Offline mode for mobile
- [ ] Video consultation feature
- [ ] Skin tracking over time
- [ ] Community features
- [ ] Custom ML models
- [ ] Multi-language knowledge base (native)

### Under Consideration
- [ ] GraphQL API
- [ ] Progressive Web App (PWA)
- [ ] Voice-only mode
- [ ] Product recommendations with affiliate links
- [ ] Dermatology Expert network

---

## 📸 Screenshots

### Web Application
![AI Chat](docs/screenshots/web-chat.png)
![Skin Analysis](docs/screenshots/web-analysis.png)

### Mobile Application
![Mobile Chat](docs/screenshots/mobile-chat.png)
![Voice Chat](docs/screenshots/mobile-voice.png)

---

## ⭐ Star History

If you find this project helpful, please consider giving it a star!

[![Star History Chart](https://api.star-history.com/svg?repos=Truc4p/skin-study&type=Date)](https://star-history.com/#Truc4p/skin-study&Date)

---

**Made with ❤️ for healthier skin**

**Last Updated:** November 12, 2025  
**Version:** 1.1.0
