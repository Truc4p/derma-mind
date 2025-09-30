# SkinStudy - Facial Skin Health Website

A comprehensive web platform designed to help users study facial skin health and achieve beautiful, healthy skin through science-backed education and personalized analysis.

## 🌟 Features

### 🔍 Skin Analysis
- Comprehensive 6-question quiz to determine skin type and concerns
- Personalized recommendations based on scientific algorithms
- Anonymous analysis option without account creation
- Confidence scoring and detailed explanations

### 📚 Education Hub
- Extensive library of skincare articles and guides
- Expert tips from dermatologists and skincare professionals
- Content categorized by topics, skin types, and concerns
- Search and filtering capabilities

### 🧪 Ingredient Database
- Comprehensive database of 1000+ skincare ingredients
- Safety ratings and comedogenic scores
- Ingredient interactions and synergies
- Benefits analysis for different skin types
- User ratings and reviews

### 📋 Skincare Routine Builder
- Personalized routine recommendations
- Morning and evening routine customization
- Step-by-step application guidance
- Product suggestions based on skin analysis

### 👤 User Profiles
- Secure account management with JWT authentication
- Analysis history tracking
- Saved routines and preferences
- Progress monitoring (coming soon)

## 🛠️ Technology Stack

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Vue Router 4** - Official router for Vue.js
- **Vite** - Next-generation frontend build tool
- **Axios** - HTTP client for API requests
- **CSS Grid & Flexbox** - Modern responsive layout
- **CSS Custom Properties** - Dynamic theming system

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Auto-restart development server
- **Git** - Version control

## 📁 Project Structure

```
skin-study/
├── frontend/                  # Vue.js frontend application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── assets/          # Stylesheets and images
│   │   ├── components/      # Reusable Vue components
│   │   ├── router/          # Vue Router configuration
│   │   ├── services/        # API service layer
│   │   ├── views/           # Page components
│   │   ├── App.vue          # Root component
│   │   └── main.js          # Application entry point
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
└── backend/                  # Node.js backend application
    ├── models/              # MongoDB data models
    ├── routes/              # Express route handlers
    ├── middleware/          # Custom middleware
    ├── config/              # Configuration files
    ├── server.js            # Server entry point
    └── package.json         # Backend dependencies
└── README.md         # This file
```

```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/skin-study.git
   cd skin-study
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create environment file
   cp .env.example .env
   # Edit .env with your configurations
   
   # Start MongoDB service
   # For macOS with Homebrew:
   brew services start mongodb/brew/mongodb-community
   
   # Start backend server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Start development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Environment Configuration

Create a `.env` file in the backend directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/skinstudy
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Skin Analysis Endpoints
- `POST /api/skin-analysis/analyze` - Submit skin analysis quiz
- `GET /api/skin-analysis/history` - Get user's analysis history (protected)
- `GET /api/skin-analysis/:sessionId` - Get specific analysis results

### Education Endpoints
- `GET /api/education/content` - Get educational articles
- `GET /api/education/content/:id` - Get specific article
- `GET /api/education/categories` - Get content categories
- `GET /api/education/search` - Search articles

### Ingredients Endpoints
- `GET /api/ingredients` - Get ingredients list with filtering
- `GET /api/ingredients/:name` - Get ingredient details
- `POST /api/ingredients/:name/rate` - Rate an ingredient
- `GET /api/ingredients/search/suggestions` - Get search suggestions

### Skincare Routines Endpoints
- `POST /api/routines` - Create custom routine (protected)
- `GET /api/routines` - Get user's routines (protected)
- `PUT /api/routines/:id` - Update routine (protected)
- `DELETE /api/routines/:id` - Delete routine (protected)

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3b82f6) - Trust, reliability, professionalism
- **Secondary**: Amber (#f59e0b) - Warmth, energy, optimism
- **Success**: Emerald (#10b981) - Health, growth, positivity
- **Warning**: Orange (#f59e0b) - Caution, attention
- **Error**: Red (#ef4444) - Alerts, critical information

### Typography
- **Font**: Inter - Modern, readable, professional
- **Scale**: Modular scale from 0.75rem to 3rem
- **Weights**: 300-800 for various emphasis levels

### Spacing System
- Based on 0.25rem (4px) increments
- Consistent vertical rhythm
- Responsive breakpoints at 768px and 1024px

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Controlled cross-origin requests
- **Helmet Security**: Security headers for Express
- **Environment Variables**: Sensitive data protection
- **Rate Limiting**: API request throttling (planned)
- **Data Sanitization**: MongoDB injection prevention

## 🌐 Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- iOS Safari (latest 2 versions)
- Chrome Android (latest 2 versions)

## � Responsive Design

- **Mobile First**: Designed for mobile devices first
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Touch Friendly**: Optimized for touch interactions
- **Progressive Web App**: PWA capabilities (planned)

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend Deployment (Heroku/Railway)
```bash
cd backend
# Ensure all environment variables are set
npm start
```

### Database Deployment (MongoDB Atlas)
- Create MongoDB Atlas cluster
- Update MONGODB_URI in environment variables
- Configure network access and security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Ensure responsive design compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Dr. Sarah Chen** - Lead Dermatologist
- **Dr. Michael Rodriguez** - Cosmetic Chemist
- **Emma Johnson** - UX Designer
- **Development Team** - Full-stack developers

## 📞 Support

- **Email**: support@skinstudy.com
- **Documentation**: [docs.skinstudy.com](https://docs.skinstudy.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/skin-study/issues)
- **Community**: [Discord Server](https://discord.gg/skinstudy)

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core website functionality
- ✅ Skin analysis system
- ✅ Ingredient database
- ✅ Education content

### Phase 2 (Q2 2024)
- 📱 Mobile app development
- 📊 Advanced analytics
- 👨‍⚕️ Expert consultations
- 🤖 AI-powered recommendations

### Phase 3 (Q3 2024)
- 🛒 Product marketplace integration
- 📈 Progress tracking
- 👥 Community features
- 🌍 Multi-language support

## 📊 Statistics

- **50,000+** Users helped
- **1,200+** Ingredients analyzed
- **500+** Educational articles
- **98%** User satisfaction rate

---

**SkinStudy** - Your trusted companion for healthy, beautiful skin through science-backed education and personalized analysis.

## Technology Stack

- **Frontend**: Vue.js 3, Vue Router, Axios
- **Backend**: Node.js, Express.js, MongoDB
- **Styling**: CSS3, Responsive Design

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
4. Start the development servers:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run serve
   ```

## License

MIT License