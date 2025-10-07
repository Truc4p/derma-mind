import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3004/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Authentication services
export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData)
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  logout() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  },

  async getProfile() {
    const response = await api.get('/auth/me')
    return response.data
  },

  async updateProfile(profileData) {
    const response = await api.put('/auth/profile', profileData)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    return response.data
  },

  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  isAuthenticated() {
    return !!localStorage.getItem('authToken')
  }
}

// Skin analysis services
export const skinAnalysisService = {
  async analyzeSkin(responses) {
    const response = await api.post('/skin-analysis/analyze', { responses })
    return response.data
  },

  async getAnalysisHistory() {
    const response = await api.get('/skin-analysis/history')
    return response.data
  },

  async getAnalysisById(sessionId) {
    const response = await api.get(`/skin-analysis/${sessionId}`)
    return response.data
  }
}

// Education content services
export const educationService = {
  async getContent(params = {}) {
    const response = await api.get('/education', { params })
    return response.data
  },

  async getContentBySlug(slug) {
    const response = await api.get(`/education/${slug}`)
    return response.data.content
  },

  async getPopularContent(limit = 6) {
    const response = await api.get('/education/popular', { params: { limit } })
    return response.data.content
  },

  async getFeaturedContent() {
    const response = await api.get('/education/featured')
    return response.data.content
  },

  async getRecommendations(skinType, concerns = []) {
    const params = { skinType }
    if (concerns.length > 0) {
      params.concerns = concerns.join(',')
    }
    const response = await api.get('/education/recommendations', { params })
    return response.data
  },

  async getCategories() {
    const response = await api.get('/education/categories')
    return response.data
  },

  async rateContent(slug, rating) {
    const response = await api.post(`/education/${slug}/rate`, { rating })
    return response.data
  },

  async likeContent(slug) {
    const response = await api.post(`/education/${slug}/like`)
    return response.data
  }
}

// Ingredients services
export const ingredientsService = {
  async getIngredients(params = {}) {
    const response = await api.get('/ingredients', { params })
    return response.data
  },

  async getIngredientByName(name) {
    const response = await api.get(`/ingredients/${encodeURIComponent(name)}`)
    return response.data
  },

  async getTopRatedIngredients(limit = 10) {
    const response = await api.get('/ingredients/top-rated', { params: { limit } })
    return response.data
  },

  async getIngredientsByConcern(concern, skinType = null, limit = 10) {
    const params = { limit }
    if (skinType) params.skinType = skinType
    const response = await api.get(`/ingredients/by-concern/${concern}`, { params })
    return response.data
  },

  async getCategories() {
    const response = await api.get('/ingredients/categories')
    return response.data
  },

  async getSearchSuggestions(query) {
    const response = await api.get('/ingredients/search-suggestions', { params: { q: query } })
    return response.data
  },

  async rateIngredient(name, rating) {
    const response = await api.post(`/ingredients/${encodeURIComponent(name)}/rate`, { rating })
    return response.data
  },

  async getInteractions(name) {
    const response = await api.get(`/ingredients/${encodeURIComponent(name)}/interactions`)
    return response.data
  }
}

// Routines services
export const routinesService = {
  async getRoutines(params = {}) {
    const response = await api.get('/routines', { params })
    return response.data
  },

  async customizeRoutine(preferences) {
    const response = await api.post('/routines/customize', preferences)
    return response.data
  },

  async getProductSuggestions(category, skinType, concern, budget = 'moderate') {
    const params = { category, skinType, concern, budget }
    const response = await api.get('/routines/product-suggestions', { params })
    return response.data
  }
}

// Utility functions
export const utils = {
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  },

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  },

  formatSkinType(skinType) {
    const types = {
      oily: 'Oily',
      dry: 'Dry',
      combination: 'Combination',
      sensitive: 'Sensitive',
      normal: 'Normal'
    }
    return types[skinType] || skinType
  },

  formatConcern(concern) {
    const concerns = {
      acne: 'Acne & Breakouts',
      aging: 'Signs of Aging',
      dark_spots: 'Dark Spots & Hyperpigmentation',
      dryness: 'Dryness & Dehydration',
      sensitivity: 'Sensitivity & Irritation',
      large_pores: 'Large Pores',
      uneven_tone: 'Uneven Skin Tone'
    }
    return concerns[concern] || concern
  },

  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }
}

export default api