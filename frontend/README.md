# SkinStudy Frontend

Vue.js 3 frontend application for the SkinStudy platform.

## 🚀 Technology Stack

- **Vue.js 3** - Progressive JavaScript framework with Composition API
- **Vue Router 4** - Official router for single page applications
- **Vite** - Next-generation frontend build tool
- **Axios** - Promise-based HTTP client
- **CSS Grid & Flexbox** - Modern responsive layout system
- **CSS Custom Properties** - Dynamic theming and design tokens

## 📁 Project Structure

```
frontend/
├── public/                    # Static assets
│   ├── favicon.ico           # App favicon
│   └── index.html           # HTML template
├── src/
│   ├── assets/              # Assets (CSS, images, fonts)
│   │   └── css/
│   │       └── main.css     # Global styles and design system
│   ├── components/          # Reusable Vue components
│   │   ├── NavBar.vue       # Navigation header
│   │   └── Footer.vue       # Site footer
│   ├── router/              # Vue Router configuration
│   │   └── index.js         # Route definitions
│   ├── services/            # API service layer
│   │   └── api.js           # HTTP client and API methods
│   ├── views/               # Page components
│   │   ├── Home.vue         # Homepage
│   │   ├── SkinAnalysis.vue # Skin analysis quiz
│   │   ├── Education.vue    # Educational content
│   │   ├── Ingredients.vue  # Ingredient database
│   │   ├── SkincareRoutines.vue # Routine builder
│   │   └── About.vue        # About page
│   ├── App.vue              # Root component
│   └── main.js              # Application entry point
├── package.json             # Dependencies and scripts
└── vite.config.js           # Vite configuration
```

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--primary-color: #3b82f6;      /* Blue */
--secondary-color: #f59e0b;    /* Amber */

/* Semantic Colors */
--success-color: #10b981;      /* Emerald */
--warning-color: #f59e0b;      /* Orange */
--error-color: #ef4444;        /* Red */

/* Neutral Colors */
--text-primary: #1e293b;       /* Slate 800 */
--text-secondary: #475569;     /* Slate 600 */
--background: #ffffff;         /* White */
--background-light: #f8fafc;   /* Slate 50 */
```

### Typography
- **Font Family**: Inter (Google Fonts)
- **Font Scale**: 0.75rem to 3rem
- **Font Weights**: 300, 400, 500, 600, 700, 800

### Spacing System
- Based on 0.25rem (4px) increments
- Consistent spacing variables: `--spacing-1` to `--spacing-24`

### Component Library
- **Cards**: Elevated content containers with hover effects
- **Buttons**: Primary, secondary, outline, and ghost variants
- **Forms**: Styled inputs, selects, and textareas
- **Grid**: Responsive grid system with CSS Grid
- **Badges**: Small status and category indicators

## 🛠️ Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Available Scripts
- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 📱 Views and Features

### Home (`/`)
- Hero section with call-to-action
- Feature highlights
- Quick access to main tools
- Educational content preview

### Skin Analysis (`/skin-analysis`)
- 6-question interactive quiz
- Progress tracking
- Real-time result calculation
- Personalized recommendations
- Anonymous or authenticated analysis

### Education (`/education`)
- Article browsing with categories
- Search and filtering capabilities
- Detailed article view
- Related content suggestions
- Expert tips and guides

### Ingredients (`/ingredients`)
- Comprehensive ingredient database
- Advanced search with autocomplete
- Detailed ingredient profiles
- Safety ratings and interactions
- User reviews and ratings

### Skincare Routines (`/skincare-routines`)
- Morning and evening routine builder
- Step-by-step guidance
- Product recommendations
- Custom routine creation
- Routine sharing capabilities

### About (`/about`)
- Company information
- Team profiles
- Technology stack
- Privacy and security
- Contact information

## 🔧 API Integration

### Service Layer (`services/api.js`)
The frontend uses a centralized API service layer for all HTTP communications:

```javascript
// Example usage
import { authService, skinAnalysisService } from '@/services/api'

// Authentication
await authService.login(credentials)

// Skin analysis
const result = await skinAnalysisService.submitAnalysis(responses)
```

### HTTP Client Configuration
- Base URL configuration
- Request/response interceptors
- Error handling
- Authentication token management

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile-First Approach
- Components designed for mobile first
- Progressive enhancement for larger screens
- Touch-friendly interactions
- Optimized performance on mobile devices

### CSS Grid Layout
```css
.grid {
  display: grid;
  gap: var(--spacing-6);
}

.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 768px) {
  .grid-3 {
    grid-template-columns: 1fr;
  }
}
```

## ⚡ Performance Optimizations

### Code Splitting
- Route-based code splitting with Vue Router
- Lazy loading of components
- Dynamic imports for large dependencies

### Asset Optimization
- Vite's built-in optimizations
- CSS purging in production
- Image optimization
- Font loading strategies

### Bundle Analysis
```bash
# Analyze bundle size
npm run build -- --analyze
```

## 🧪 Testing

### Unit Testing (Planned)
- Vue Test Utils
- Jest test runner
- Component testing
- Service layer testing

### E2E Testing (Planned)
- Cypress for end-to-end testing
- User journey testing
- Cross-browser testing

## 🔒 Security Features

### Client-Side Security
- Input sanitization
- XSS prevention
- CSRF protection via tokens
- Secure cookie handling
- Content Security Policy headers

### Authentication
- JWT token storage in localStorage
- Automatic token refresh
- Protected route guards
- Role-based access control

## 🌐 Browser Support

### Supported Browsers
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### Polyfills
- ES6+ features via Vite
- CSS Grid and Flexbox support
- Fetch API polyfill for older browsers

## 🚀 Deployment

### Production Build
```bash
# Create production build
npm run build

# Output directory: dist/
```

### Environment Variables
Create `.env` files for different environments:

```env
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api

# .env.production
VITE_API_BASE_URL=https://api.skinstudy.com/api
```

### Deployment Platforms
- **Netlify**: Automatic deployment from Git
- **Vercel**: Zero-config deployment
- **AWS S3 + CloudFront**: Scalable hosting
- **GitHub Pages**: Free hosting for open source

### Build Optimization
- Tree shaking for unused code
- CSS minification
- Asset compression
- Cache busting with file hashes

## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Implement changes
3. Test locally
4. Commit with descriptive messages
5. Create pull request

### Code Style
- ESLint configuration for consistent code style
- Prettier for automatic formatting
- Vue 3 Composition API preferred
- TypeScript support (planned)

### Component Guidelines
- Single File Components (SFC)
- Props validation
- Emitted events documentation
- Scoped CSS styles
- Accessible markup

## 📚 Resources

### Vue.js Resources
- [Vue 3 Documentation](https://vuejs.org/)
- [Vue Router Documentation](https://router.vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)

### Design Resources
- [Inter Font](https://fonts.google.com/specimen/Inter)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Vue Style Guide](https://vuejs.org/style-guide/)

---

For backend API documentation, see [../backend/README.md](../backend/README.md)