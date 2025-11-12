# Technologies Used in Skin Study Project

## Table of Contents
- [Backend Technologies](#backend-technologies)
- [Frontend Technologies](#frontend-technologies)
- [Mobile Technologies](#mobile-technologies)
- [Database & Storage](#database--storage)
- [AI & Machine Learning](#ai--machine-learning)
- [Development Tools](#development-tools)
- [Deployment & DevOps](#deployment--devops)

---

## Backend Technologies

### Core Framework & Runtime
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime environment for server-side development |
| **Express.js** | 4.19.2 | Lightweight web application framework for RESTful API |

### Security & Authentication
| Technology | Version | Purpose |
|------------|---------|---------|
| **bcryptjs** | 3.0.2 | Password hashing with 12 salt rounds for secure storage |
| **jsonwebtoken (JWT)** | 9.0.2 | Token-based authentication with 7-day expiration |
| **helmet** | 8.1.0 | Security middleware for HTTP headers protection |
| **cors** | 2.8.5 | Cross-Origin Resource Sharing configuration |

### File Processing
| Technology | Version | Purpose |
|------------|---------|---------|
| **multer** | 2.0.2 | Multipart form data handling for image/audio uploads |
| **uuid** | 13.0.0 | Unique identifier generation for sessions |

### Utilities & Middleware
| Technology | Version | Purpose |
|------------|---------|---------|
| **dotenv** | 17.2.3 | Environment variable management |
| **morgan** | 1.10.1 | HTTP request logging middleware |

---

## Frontend Technologies

### Core Framework & Build Tools
| Technology | Version | Purpose |
|------------|---------|---------|
| **Vue.js** | 3.5.22 | Progressive JavaScript framework with Composition API |
| **Vite** | 7.1.7 | Next-generation frontend build tool with fast HMR |
| **Vue Router** | 4.5.1 | Official routing library for Vue.js |

### HTTP & Data Handling
| Technology | Version | Purpose |
|------------|---------|---------|
| **Axios** | 1.12.2 | Promise-based HTTP client for API communication |
| **marked** | 16.4.1 | Markdown parser and compiler |
| **Tesseract.js** | 6.0.1 | OCR library for ingredient label analysis |

---

## Mobile Technologies

### Framework & Platform
| Technology | Version | Purpose |
|------------|---------|---------|
| **React Native** | 0.74.5 | Cross-platform mobile framework |
| **Expo** | ~51.0.0 | React Native development framework and toolkit |

### Navigation
| Technology | Version | Purpose |
|------------|---------|---------|
| **React Navigation** | 6.1.9 | Routing and navigation for React Native |
| **Native Stack Navigator** | 6.9.17 | Native screen transitions |

### Storage & State
| Technology | Version | Purpose |
|------------|---------|---------|
| **AsyncStorage** | 1.23.1 | Persistent local storage for chat history |

### Audio & Media
| Technology | Version | Purpose |
|------------|---------|---------|
| **Expo AV** | ~14.0.7 | Audio and video playback capabilities |
| **Expo Speech** | ~12.0.2 | Text-to-speech functionality |
| **Expo Speech Recognition** | 2.1.5 | Voice-to-text transcription |

### UI & Rendering
| Technology | Version | Purpose |
|------------|---------|---------|
| **React Native Render HTML** | 6.3.4 | HTML content rendering in React Native |
| **React Native Markdown Display** | 7.0.2 | Markdown content rendering |

### HTTP Client
| Technology | Version | Purpose |
|------------|---------|---------|
| **Axios** | 1.6.2 | API communication for mobile app |

---

## Database & Storage

### Primary Database
| Technology | Version | Purpose |
|------------|---------|---------|
| **MongoDB** | 8.18.3 | NoSQL document database for user data, analysis, content |
| **Mongoose** | ODM | MongoDB object modeling for Node.js |

### Vector Database
| Technology | Version | Purpose |
|------------|---------|---------|
| **Qdrant** | 1.15.1 | Vector database for semantic search and RAG |
| | | - 768-dimensional vectors |
| | | - Cosine similarity metric |
| | | - HNSW indexing |

### Collections
- **Users** - Account information, profiles, history
- **SkinAnalysis** - Analysis results and responses
- **EducationContent** - Educational articles and resources
- **Ingredients** - Skincare ingredient database
- **DermatologyKnowledge** (Qdrant) - Vector embeddings of textbooks

---

## AI & Machine Learning

### AI Models & APIs
| Technology | Version | Purpose |
|------------|---------|---------|
| **Google Generative AI** | 0.21.0 | Google's Gemini AI integration |
| **Gemini 2.0 Flash Exp** | Latest | Primary language model for chat and analysis |
| **Text-Embedding-004** | Latest | 768-dimensional embedding model |

#### Model Configuration
```javascript
{
  model: 'gemini-2.0-flash',
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 4096
}
```

### Document Processing
| Technology | Version | Purpose |
|------------|---------|---------|
| **LangChain** | 0.3.36 | Document processing and text splitting |
| **RecursiveCharacterTextSplitter** | - | Chunk size: 1500, Overlap: 300 |

### Text-to-Speech
| Technology | Version | Purpose |
|------------|---------|---------|
| **node-gtts** | 2.0.2 | Google Translate TTS for voice output |

### AI Capabilities
- ✅ Text-based consultation with RAG
- ✅ **Multilingual support** - Automatic language detection and translation (Nov 2025)
- ✅ Image analysis (Gemini Vision)
- ✅ Audio transcription (speech-to-text)
- ✅ Text-to-speech conversion
- ✅ Multi-modal input processing
- ✅ Source citation system
- ✅ **Supports 50+ languages** including Vietnamese, Chinese, Japanese, Korean, Spanish, French, German

#### Multilingual RAG Pipeline (New Feature)
**Added:** November 2025

**Purpose:** Enable non-English queries to retrieve relevant English knowledge base content

**Technology:**
```javascript
Translation Model: Gemini 2.0 Flash
Configuration: {
  temperature: 0.1,      // High accuracy
  maxOutputTokens: 500
}
```

**Process Flow:**
1. **Language Detection** - Identify non-English queries (non-ASCII ratio check)
2. **Translation** - Convert query to English using Gemini
3. **Vector Search** - Search with English translation (70-75% similarity vs 48% before)
4. **Response Generation** - AI responds in user's original language
5. **Citation Preservation** - References maintained across all languages

**Performance Impact:**
- Translation overhead: +500-800ms
- RAG accuracy improvement: +25-50% for non-English queries
- User experience: Seamless multilingual interaction

**Example:**
```
Input: "Mụn là gì" (Vietnamese)
Translation: "What is acne"
Vector Scores: 0.73 → 0.74 (Good match)
Response: Vietnamese answer with English citations
```

---

## Development Tools

### Code Editor & Version Control
| Tool | Purpose |
|------|---------|
| **Visual Studio Code** | Primary IDE with extensions |
| **Git** | Version control system |
| **GitHub** | Remote repository hosting and collaboration |

### API Development & Testing
| Tool | Purpose |
|------|---------|
| **Postman** | API endpoint testing and documentation |
| **Thunder Client** | VS Code extension for API testing |

### Database Management
| Tool | Purpose |
|------|---------|
| **MongoDB Compass** | GUI for MongoDB database management |
| **Studio 3T** | Advanced MongoDB IDE |

### Package Managers
| Tool | Purpose |
|------|---------|
| **npm** | Node Package Manager for backend and frontend |
| **npm** | React Native dependency management |

### Development Utilities
| Technology | Version | Purpose |
|------------|---------|---------|
| **nodemon** | 3.1.10 | Auto-restart server on file changes |

---

## Deployment & DevOps

### Containerization
| Technology | Purpose |
|------------|---------|
| **Docker** | Container platform for Qdrant deployment |
| **Docker Compose** | Multi-container orchestration |

### Platform Options

#### Backend Deployment
- **Heroku** - Cloud platform (PaaS)
- **AWS EC2** - Elastic Compute Cloud
- **DigitalOcean** - Cloud infrastructure
- **Railway** - Modern deployment platform
- **Render** - Cloud platform for apps

#### Frontend Deployment
- **Vercel** - Optimized for Vue.js/Vite
- **Netlify** - JAMstack platform
- **GitHub Pages** - Static site hosting
- **AWS S3 + CloudFront** - Object storage + CDN

#### Mobile Deployment
- **Expo Application Services (EAS)** - Build and submit
- **Apple App Store** - iOS distribution
- **Google Play Store** - Android distribution

#### Database Hosting
- **MongoDB Atlas** - Cloud-hosted MongoDB
- **Qdrant Cloud** - Managed vector database

### Process Management
| Technology | Purpose |
|------------|---------|
| **PM2** | Production process manager for Node.js |

---

## Knowledge Base Sources

### Authoritative Dermatology Textbooks
1. **Fitzpatrick's Dermatology in General Medicine** (8th Edition)
2. **Cosmetic Dermatology - Principles and Practice**
3. **Chemical Peels - Procedures in Cosmetic Dermatology Series** (3rd Edition, 2020)
4. **Cosmeceuticals and Cosmetic Ingredients**
5. **Cosmetics and Dermatological Problems and Solutions**
6. **Lasers in Dermatology and Medicine** by Keyvan Nouri
7. **Skin Care - Beyond the Basics** (4th Edition)
8. **Textbook of Cosmetic Dermatology**
9. **Cosmetic Dermatology - Products and Procedures** by Draelos (2nd Edition, 2016)

**Total Indexed Content:**
- ~3,000-5,000 knowledge chunks
- 768-dimensional vector embeddings
- Chunk size: 1,500 characters
- Chunk overlap: 300 characters

---

## System Architecture

### Architecture Pattern
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

---

## Communication Protocols

### HTTP/REST
- RESTful API design
- JSON request/response format
- JWT bearer token authentication
- CORS-enabled endpoints

### WebSocket (Future)
- Real-time chat updates
- Live typing indicators
- Push notifications

---

## File Formats Supported

### Images
- JPEG, JPG
- PNG
- GIF
- WebP
- BMP
- **Max size:** 10MB

### Audio
- MP3
- MP4 (M4A)
- WAV
- AAC
- OGG
- FLAC

### Text
- Markdown (.md)
- Plain text (.txt)
- JSON

---

## Environment Variables

### Backend (.env)
```bash
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-api-key
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=optional
```

### Frontend (.env)
```bash
VITE_API_URL=https://api.your-domain.com/api
```

---

## Performance Metrics

### Response Times
- **AI Chat Response:** 3-5 seconds
- **Vector Search:** <500ms
- **Skin Analysis:** <1 second
- **Image Analysis:** 5-8 seconds

### Optimization Techniques
- Database indexing on critical fields
- Memoization in React/React Native
- Lazy loading for routes
- Code splitting in Vite
- Batch processing for embeddings
- Exponential backoff for API retries
- Sentence streaming for TTS

---

## Security Technologies

### Encryption & Hashing
- **bcrypt** - Password hashing (12 rounds)
- **JWT** - Token-based authentication
- **HTTPS** - Encrypted data transmission

### Security Headers (Helmet.js)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HSTS)
- Content Security Policy (CSP)

### Input Validation
- MongoDB query sanitization
- File type validation
- File size limits
- Email regex validation
- Request body validation

---

## Compliance & Standards

### Web Standards
- **WCAG 2.1** - Web Content Accessibility Guidelines
- **RESTful API** - Standard API design
- **Semantic HTML** - Proper markup structure
- **Responsive Design** - Mobile-first approach

### Data Protection
- **GDPR** - General Data Protection Regulation
- User consent management
- Right to access/erasure
- Data minimization
- Privacy by design

### Mobile Standards
- **Apple App Store Guidelines**
- **Google Play Store Policies**
- Platform-specific UI guidelines
- Accessibility standards (VoiceOver, TalkBack)

---

## Testing Technologies

### Backend Testing
- Manual API testing (Postman/Thunder Client)
- Performance monitoring utilities
- Database integrity checks

### Frontend Testing
- Browser DevTools
- Component testing (manual)
- Cross-browser compatibility

### Mobile Testing
- **Expo Go** - Development testing
- iOS Simulator
- Android Emulator
- Physical device testing

---

## Documentation Technologies

### Documentation Format
- **Markdown** - All documentation
- **JSDoc** - Code comments (future)
- **README.md** - Project overview
- **API documentation** - Endpoint reference

### Documentation Tools
- Visual Studio Code (Markdown preview)
- GitHub (Markdown rendering)
- Google Docs (collaboration)

---

## Third-Party Services

### AI Services
- **Google AI Studio** - Gemini API access
- **Google Translate TTS** - Free text-to-speech

### Cloud Services
- **MongoDB Atlas** - Managed MongoDB
- **Qdrant Cloud** - Managed vector database (optional)

### Future Integrations
- Sentry - Error tracking
- LogRocket - Session replay
- Google Analytics - Usage analytics
- Stripe - Payment processing (e-commerce)

---

## Technology Stack Summary

### Backend Stack
```
Node.js + Express.js
├── MongoDB (Mongoose)
├── Qdrant (Vector DB)
├── Google Gemini AI
├── JWT Authentication
├── Multer (File uploads)
└── Various utilities
```

### Frontend Stack
```
Vue.js 3 + Vite
├── Vue Router
├── Axios
├── Marked (Markdown)
└── Tesseract.js (OCR)
```

### Mobile Stack
```
React Native + Expo
├── React Navigation
├── AsyncStorage
├── Expo AV (Audio)
├── Expo Speech
├── Axios
└── HTML/Markdown renderers
```

---

## Version Information

**Project Version:** 1.0  
**Documentation Date:** November 2025  
**Last Updated:** November 11, 2025

---

## License Information

### Open Source Licenses Used
- **MIT License** - Vue.js, React, Express.js, many utilities
- **Apache 2.0** - Some Google libraries
- **ISC License** - Various npm packages
- **BSD License** - Some dependencies

### Proprietary
- **Google Gemini API** - Google's terms of service
- **Expo** - Expo's license terms

---

## Future Technology Considerations

### Planned Additions
- **Redis** - Caching layer
- **WebSocket (Socket.io)** - Real-time features
- **Jest** - Unit testing
- **Cypress** - End-to-end testing
- **GitHub Actions** - CI/CD pipeline
- **Sentry** - Error monitoring
- **Docker Compose** - Full stack orchestration

### Under Evaluation
- **Next.js** - Alternative to Vue.js
- **GraphQL** - Alternative to REST
- **PostgreSQL** - Relational data needs
- **TensorFlow.js** - Custom ML models
- **WebRTC** - Video consultations

---

**Document Information:**
- **Project:** Skin Study
- **Repository:** github.com/Truc4p/skin-study
- **Documentation Type:** Technology Stack Reference
- **Audience:** Developers, Technical Reviewers, Stakeholders

---

*For detailed implementation information, refer to the complete project documentation (Parts 1-6).*
