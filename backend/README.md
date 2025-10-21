# SkinStudy Backend API

Node.js Express backend API for the SkinStudy platform.

## 🚀 Technology Stack

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL document database
- **Mongoose** - MongoDB object modeling library
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing library
- **Helmet** - Security middleware
- **CORS** - Cross-Origin Resource Sharing
- **Morgan** - HTTP request logger

## 📁 Project Structure

```
backend/
├── config/                   # Configuration files
│   └── database.js          # Database connection
├── middleware/               # Custom middleware
│   └── auth.js              # Authentication middleware
├── models/                   # Mongoose data models
│   ├── User.js              # User authentication & profile
│   ├── SkinAnalysis.js      # Skin analysis results
│   ├── Ingredient.js        # Skincare ingredients
│   ├── EducationContent.js  # Educational articles
│   └── SkincareRoutine.js   # User routines
├── routes/                   # Express route handlers
│   ├── auth.js              # Authentication endpoints
│   ├── skinAnalysis.js      # Skin analysis API
│   ├── education.js         # Educational content API
│   ├── ingredients.js       # Ingredients database API
│   └── routines.js          # Skincare routines API
├── utils/                    # Utility functions
│   └── helpers.js           # Helper functions
├── .env                      # Environment variables
├── server.js                # Application entry point
└── package.json             # Dependencies and scripts
```

## 🗄️ Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
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
  analysisHistory: [ObjectId], // References to SkinAnalysis
  routines: [ObjectId],        // References to SkincareRoutine
  createdAt: Date,
  updatedAt: Date
}
```

### SkinAnalysis Model
```javascript
{
  _id: ObjectId,
  sessionId: String (unique),
  userId: ObjectId (optional), // For authenticated users
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
  name: String (unique),
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
    comedogenicRating: Number,
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

### EducationContent Model
```javascript
{
  _id: ObjectId,
  title: String,
  slug: String (unique),
  excerpt: String,
  content: String,
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

### SkincareRoutine Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  description: String,
  skinType: String,
  concerns: [String],
  routine: {
    morning: [{
      step: Number,
      category: String,
      product: String,
      instructions: String,
      waitTime: String
    }],
    evening: [{
      step: Number,
      category: String,
      product: String,
      instructions: String,
      waitTime: String
    }]
  },
  isPublic: Boolean,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "userId",
    "email": "user@example.com",
    "profile": { ... }
  },
  "token": "jwt_token_here"
}
```

#### POST `/login`
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### GET `/profile` (Protected)
Get current user profile.

#### PUT `/profile` (Protected)
Update user profile information.

### Skin Analysis Routes (`/api/skin-analysis`)

#### POST `/analyze`
Submit skin analysis quiz responses.

**Request Body:**
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
    "recommendations": { ... }
  }
}
```

#### GET `/history` (Protected)
Get user's analysis history.

#### GET `/:sessionId`
Get specific analysis results by session ID.

### Education Routes (`/api/education`)

#### GET `/content`
Get educational articles with filtering and pagination.

**Query Parameters:**
- `category` - Filter by category
- `tag` - Filter by tag
- `search` - Search in title and content
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

#### GET `/content/:id`
Get specific article by ID.

#### GET `/categories`
Get all content categories.

#### GET `/search`
Search articles by query.

### Ingredients Routes (`/api/ingredients`)

#### GET `/`
Get ingredients with filtering and pagination.

**Query Parameters:**
- `category` - Filter by ingredient category
- `skinType` - Filter by suitable skin type
- `concern` - Filter by skin concern
- `search` - Search ingredient names
- `sort` - Sort by: name, rating, category
- `page` - Page number
- `limit` - Items per page

#### GET `/:name`
Get detailed ingredient information by name.

#### POST `/:name/rate`
Rate an ingredient (1-5 stars).

#### GET `/search/suggestions`
Get search suggestions for autocomplete.

#### GET `/categories`
Get ingredient categories with counts.

#### GET `/top-rated`
Get top-rated ingredients.

### Skincare Routines Routes (`/api/routines`) (Protected)

#### GET `/`
Get user's saved routines.

#### POST `/`
Create a new skincare routine.

#### GET `/:id`
Get specific routine by ID.

#### PUT `/:id`
Update existing routine.

#### DELETE `/:id`
Delete routine.

## 🔧 Development Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev

# Start production server
npm start
```

### Environment Variables
Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3004
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://mongo-api:7TZYsdhwiXhiKRp9@cluster0.18pi3.mongodb.net/skinStudyWeb?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:5175,http://localhost:3004

# Rate Limiting (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Available Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests (when implemented)

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Token Expiration**: Configurable token lifetime
- **Protected Routes**: Middleware-based route protection

### Input Validation & Sanitization
- **Mongoose Validation**: Schema-level validation
- **Input Sanitization**: Prevent NoSQL injection
- **Request Size Limits**: Prevent DoS attacks
- **CORS Configuration**: Controlled cross-origin access

### Security Headers
- **Helmet**: Security headers middleware
- **Content Security Policy**: XSS protection
- **X-Frame-Options**: Clickjacking protection
- **X-Content-Type-Options**: MIME sniffing protection

### API Security
- **Rate Limiting**: Request throttling (planned)
- **Input Validation**: Comprehensive validation
- **Error Handling**: Secure error messages
- **Logging**: Request and error logging

## 📊 Performance Optimizations

### Database Optimization
- **Indexing**: Optimized database indexes
- **Query Optimization**: Efficient MongoDB queries
- **Connection Pooling**: MongoDB connection management
- **Aggregation Pipelines**: Complex data processing

### Caching Strategy (Planned)
- **Redis Caching**: Response caching
- **Memory Caching**: In-memory data caching
- **CDN Integration**: Static asset caching

### API Performance
- **Pagination**: Large dataset handling
- **Field Selection**: Minimal data transfer
- **Compression**: Gzip response compression
- **Keep-Alive**: HTTP connection reuse

## 🧪 Testing

### Unit Testing (Planned)
```bash
# Install testing dependencies
npm install --save-dev jest supertest

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Integration Testing (Planned)
- API endpoint testing
- Database integration testing
- Authentication flow testing

### Test Structure
```
tests/
├── unit/
│   ├── models/
│   ├── routes/
│   └── utils/
├── integration/
│   ├── auth.test.js
│   ├── skinAnalysis.test.js
│   └── ingredients.test.js
└── fixtures/
    └── sampleData.js
```

## 📈 Monitoring & Logging

### Logging
- **Morgan**: HTTP request logging
- **Winston**: Application logging (planned)
- **Error Tracking**: Centralized error logging

### Health Checks
- **Health Endpoint**: `/health` for monitoring
- **Database Status**: Connection health check
- **API Status**: Service availability

### Metrics (Planned)
- **Response Times**: API performance metrics
- **Error Rates**: Error frequency tracking
- **Usage Analytics**: Endpoint usage statistics

## 🚀 Deployment

### Production Configuration
```javascript
// Production optimizations
app.use(compression()); // Response compression
app.use(helmet()); // Security headers
app.set('trust proxy', 1); // Reverse proxy trust
```

### Environment Setup
- **Production Variables**: Secure environment configuration
- **Database**: MongoDB Atlas or managed instance
- **SSL/TLS**: HTTPS encryption
- **Process Management**: PM2 or similar

### Deployment Platforms
- **Railway**: Easy deployment with Git integration
- **Heroku**: Cloud platform as a service
- **AWS**: Scalable cloud infrastructure
- **DigitalOcean**: Simple cloud hosting

### Docker Support (Planned)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3004
CMD ["npm", "start"]
```

## 🔄 Data Migration & Seeding

### Scripts Organization

All database and utility scripts are organized in the `scripts/` directory:

```
scripts/
├── seed/                    # Database seeding scripts
│   ├── seedIngredients.js
│   ├── seedEducation.js
│   ├── seedExtractedKnowledge.js
│   └── seedKnowledgeBase.js
├── utils/                   # Helper utilities
│   ├── addKnowledge.js
│   ├── debugInsert.js
│   └── validateEntries.js
├── README.md               # Comprehensive guide
├── QUICK_REFERENCE.md      # Quick command reference
└── */README.md             # Detailed docs per directory
```

### Quick Start - Seed Database

```bash
# Seed all collections (run from backend directory)
node scripts/seed/seedIngredients.js
node scripts/seed/seedEducation.js
node scripts/seed/seedKnowledgeBase.js

# OR import from extracted JSON
node scripts/seed/seedExtractedKnowledge.js
```

### Script Categories

#### Seed Scripts (`scripts/seed/`)
- **seedIngredients.js** - Seeds 25+ skincare ingredients with benefits, safety info
- **seedEducation.js** - Seeds educational articles and guides
- **seedExtractedKnowledge.js** - Imports knowledge from JSON files (batch processing)
- **seedKnowledgeBase.js** - Seeds curated dermatology knowledge base

#### Utility Scripts (`scripts/utils/`)
- **addKnowledge.js** - Helper for adding new knowledge entries
- **debugInsert.js** - Debug script for troubleshooting insertions
- **validateEntries.js** - Validates data format before import

### Usage Examples

```bash
# Validate data before importing
node scripts/utils/validateEntries.js

# Add new knowledge entries
node scripts/utils/addKnowledge.js

# Debug database insertion issues
node scripts/utils/debugInsert.js

# Seed specific collection
node scripts/seed/seedIngredients.js
```

### Detailed Documentation

For comprehensive documentation on all scripts:
- **Overview**: See `scripts/README.md`
- **Quick Reference**: See `scripts/QUICK_REFERENCE.md`
- **Seed Scripts**: See `scripts/seed/README.md`
- **Utils Scripts**: See `scripts/utils/README.md`

### Data Migration Scripts
- User data migration utilities
- Ingredient database import with validation
- Educational content seeding with media
- Knowledge base batch processing with error handling

## 🤝 Contributing

### Development Workflow
1. Fork repository
2. Create feature branch
3. Implement changes with tests
4. Update documentation
5. Submit pull request

### Code Standards
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **JSDoc**: Function documentation
- **Error Handling**: Comprehensive error management

### API Design Guidelines
- **RESTful**: Follow REST conventions
- **Consistent**: Uniform response formats
- **Versioned**: API versioning strategy
- **Documented**: Comprehensive API docs

## 📚 Resources

### Node.js & Express
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [MongoDB University](https://university.mongodb.com/)

### Security Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

---

For frontend documentation, see [../frontend/README.md](../frontend/README.md)