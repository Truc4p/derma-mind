<template>
  <div class="education">
    <div class="container">
      <!-- Header -->
      <div class="education-header">
        <h1>Skin Education Hub</h1>
        <p>Learn about skin science, ingredients, and proper skincare techniques from experts</p>
      </div>

      <!-- Featured Content -->
      <section v-if="featuredContent?.length > 0" class="featured-section">
        <h2>Featured Articles</h2>
        <div class="grid grid-3">
          <div 
            v-for="article in featuredContent" 
            :key="article._id"
            class="featured-card card"
          >
            <div class="featured-image">
              <img 
                :src="article.media?.featuredImage?.url || '/placeholder-image.jpg'" 
                :alt="article.media?.featuredImage?.alt || article.title"
              />
            </div>
            <div class="featured-content">
              <span class="category-badge">{{ formatCategory(article.category) }}</span>
              <h3>{{ article.title }}</h3>
              <p>{{ article.content.summary }}</p>
              <div class="article-meta">
                <span class="reading-time">{{ article.metadata?.readingTime || 5 }} min read</span>
                <span class="difficulty">{{ article.metadata?.difficulty || 'beginner' }}</span>
              </div>
              <router-link :to="`/education/${article.slug}`" class="btn btn-primary">Read More</router-link>
            </div>
          </div>
        </div>
      </section>

      <!-- Filters and Search -->
      <section class="filters-section">
        <div class="filters-container">
          <div class="search-box">
            <input 
              v-model="searchQuery"
              @input="onSearchInput"
              type="text" 
              placeholder="Search articles..."
              class="form-input"
            />
          </div>
          
          <div class="filter-groups">
            <div class="filter-group">
              <label>Category:</label>
              <select v-model="selectedCategory" @change="loadContent" class="form-select">
                <option value="">All Categories</option>
                <option v-for="cat in categories" :key="cat._id" :value="cat._id">
                  {{ formatCategory(cat._id) }} ({{ cat.count }})
                </option>
              </select>
            </div>
            
            <div class="filter-group">
              <label>Skin Type:</label>
              <select v-model="selectedSkinType" @change="loadContent" class="form-select">
                <option value="">All Skin Types</option>
                <option value="oily">Oily</option>
                <option value="dry">Dry</option>
                <option value="combination">Combination</option>
                <option value="sensitive">Sensitive</option>
                <option value="normal">Normal</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label>Difficulty:</label>
              <select v-model="selectedDifficulty" @change="loadContent" class="form-select">
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <!-- Content Grid -->
      <section class="content-section">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading articles...</p>
        </div>
        
        <div v-else-if="articles?.length === 0" class="empty-state">
          <h3>No articles found</h3>
          <p>Try adjusting your filters or search terms</p>
        </div>
        
        <div v-else class="articles-grid grid grid-3">
          <div 
            v-for="article in articles" 
            :key="article._id"
            class="article-card card"
          >
            <div class="article-image">
              <img 
                :src="article.media?.featuredImage?.url || '/placeholder-image.jpg'" 
                :alt="article.media?.featuredImage?.alt || article.title"
              />
              <span class="category-tag">{{ formatCategory(article.category) }}</span>
            </div>
            <div class="article-content">
              <h4>{{ article.title }}</h4>
              <p>{{ article.content.summary }}</p>
              <div class="article-meta">
                <div class="meta-item">
                  <span class="icon">⏱️</span>
                  <span>{{ article.metadata?.readingTime || 5 }} min</span>
                </div>
                <div class="meta-item">
                  <span class="icon">📊</span>
                  <span>{{ article.metadata?.difficulty || 'beginner' }}</span>
                </div>
                <div class="meta-item" v-if="article.engagement?.rating?.count > 0">
                  <span class="icon">⭐</span>
                  <span>{{ article.engagement?.rating?.average?.toFixed(1) || '4.5' }}</span>
                </div>
              </div>
              <router-link :to="`/education/${article.slug}`" class="btn btn-outline btn-sm">
                Read Article
              </router-link>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.pages > 1" class="pagination">
          <button 
            @click="changePage(pagination.current - 1)"
            :disabled="!pagination.hasPrev"
            class="btn btn-outline"
          >
            Previous
          </button>
          
          <span class="page-info">
            Page {{ pagination.current }} of {{ pagination.pages }}
          </span>
          
          <button 
            @click="changePage(pagination.current + 1)"
            :disabled="!pagination.hasNext"
            class="btn btn-outline"
          >
            Next
          </button>
        </div>
      </section>

      <!-- Popular Articles Sidebar -->
      <section v-if="popularArticles?.length > 0" class="popular-section">
        <h3>Popular Articles</h3>
        <div class="popular-list">
          <div 
            v-for="article in popularArticles" 
            :key="article._id"
            class="popular-item"
          >
            <div class="popular-image">
              <img 
                :src="article.media?.featuredImage?.url || '/placeholder-image.jpg'" 
                :alt="article.title"
              />
            </div>
            <div class="popular-content">
              <h5>{{ article.title }}</h5>
              <div class="popular-meta">
                <span>{{ article.engagement?.views || 0 }} views</span>
                <span>{{ article.metadata?.readingTime || 5 }} min read</span>
              </div>
              <router-link :to="`/education/${article.slug}`" class="read-link">
                Read →
              </router-link>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { educationService, utils } from '../services/api'

export default {
  name: 'Education',
  data() {
    return {
      articles: [],
      featuredContent: [],
      popularArticles: [],
      categories: [],
      loading: false,
      searchQuery: '',
      selectedCategory: '',
      selectedSkinType: '',
      selectedDifficulty: '',
      pagination: {
        current: 1,
        pages: 1,
        total: 0,
        hasNext: false,
        hasPrev: false
      }
    }
  },
  mounted() {
    this.loadInitialData()
  },
  methods: {
    async loadInitialData() {
      try {
        await Promise.all([
          this.loadFeaturedContent(),
          this.loadCategories(),
          this.loadPopularArticles(),
          this.loadContent()
        ])
      } catch (error) {
        console.error('Error loading initial data:', error)
      }
    },
    
    async loadFeaturedContent() {
      try {
        const featuredContent = await educationService.getFeaturedContent()
        this.featuredContent = featuredContent || []
      } catch (error) {
        console.error('Error loading featured content:', error)
        this.featuredContent = []
      }
    },
    
    async loadCategories() {
      try {
        const response = await educationService.getCategories()
        this.categories = response.categories
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    },
    
    async loadPopularArticles() {
      try {
        const popularArticles = await educationService.getPopularContent(5)
        this.popularArticles = popularArticles || []
      } catch (error) {
        console.error('Error loading popular articles:', error)
        this.popularArticles = []
      }
    },
    
    async loadContent(page = 1) {
      this.loading = true
      
      try {
        const params = {
          page,
          limit: 12,
          category: this.selectedCategory,
          skinType: this.selectedSkinType,
          difficulty: this.selectedDifficulty,
          search: this.searchQuery
        }
        
        // Remove empty params
        Object.keys(params).forEach(key => {
          if (!params[key]) delete params[key]
        })
        
        const response = await educationService.getContent(params)
        this.articles = response.content
        this.pagination = response.pagination
        
      } catch (error) {
        console.error('Error loading content:', error)
        this.articles = []
      } finally {
        this.loading = false
      }
    },
    
    onSearchInput: utils.debounce(function() {
      this.loadContent(1)
    }, 500),
    
    changePage(page) {
      if (page >= 1 && page <= this.pagination.pages) {
        this.loadContent(page)
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    
    formatCategory(category) {
      const categories = {
        'skin-basics': 'Skin Basics',
        'skin-types': 'Skin Types',
        'ingredients': 'Ingredients',
        'routines': 'Routines',
        'concerns': 'Skin Concerns',
        'myths': 'Myths & Facts',
        'science': 'Skin Science',
        'lifestyle': 'Lifestyle',
        'products': 'Products'
      }
      return categories[category] || category
    }
  }
}
</script>

<style scoped>
.education-header {
  text-align: center;
  margin-bottom: 3rem;
}

.featured-section {
  margin-bottom: 4rem;
}

.featured-card {
  overflow: hidden;
}

.featured-image {
  height: 200px;
  overflow: hidden;
}

.featured-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.featured-card:hover .featured-image img {
  transform: scale(1.05);
}

.featured-content {
  padding: 1.5rem;
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--primary-color);
  color: white;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.filters-section {
  margin-bottom: 2rem;
  padding: 2rem;
  background: var(--background-light);
  border-radius: var(--border-radius);
}

.filters-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-box {
  max-width: 400px;
}

.filter-groups {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 150px;
}

.filter-group label {
  font-weight: 500;
  color: var(--text-dark);
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.article-card {
  overflow: hidden;
  transition: transform 0.3s ease;
}

.article-card:hover {
  transform: translateY(-4px);
}

.article-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-tag {
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.25rem 0.75rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  font-size: 0.8rem;
}

.article-content {
  padding: 1.5rem;
}

.article-content h4 {
  margin-bottom: 0.75rem;
  color: var(--text-dark);
}

.article-content p {
  margin-bottom: 1rem;
  color: var(--text-light);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-light);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
}

.page-info {
  color: var(--text-light);
  font-weight: 500;
}

.popular-section {
  margin-top: 4rem;
  padding: 2rem;
  background: var(--background-light);
  border-radius: var(--border-radius);
}

.popular-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.popular-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: var(--border-radius);
  transition: transform 0.2s ease;
}

.popular-item:hover {
  transform: translateX(4px);
}

.popular-image {
  width: 80px;
  height: 60px;
  overflow: hidden;
  border-radius: 4px;
  flex-shrink: 0;
}

.popular-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.popular-content h5 {
  margin-bottom: 0.5rem;
  color: var(--text-dark);
  font-size: 0.9rem;
  line-height: 1.3;
}

.popular-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.read-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
}

.read-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .filter-groups {
    flex-direction: column;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .articles-grid {
    grid-template-columns: 1fr;
  }
  
  .popular-item {
    flex-direction: column;
    text-align: center;
  }
  
  .popular-image {
    width: 100%;
    height: 120px;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>