<template>
  <div class="ingredients">
    <div class="container">
      <!-- Header -->
      <div class="ingredients-header">
        <h1>Skincare Ingredients Guide</h1>
        <p>Explore the science behind skincare ingredients and their benefits for your skin</p>
      </div>

      <!-- Search and Filters -->
      <section class="search-section">
        <div class="search-container">
          <div class="search-box">
            <input 
              v-model="searchQuery"
              @input="onSearchInput"
              type="text" 
              placeholder="Search ingredients..."
              class="form-input search-input"
            />
            <div v-if="searchSuggestions.length > 0 && showSuggestions" class="search-suggestions">
              <div 
                v-for="suggestion in searchSuggestions" 
                :key="suggestion.name"
                @click="selectIngredient(suggestion.name)"
                class="suggestion-item"
              >
                <strong>{{ suggestion.name }}</strong>
                <span class="suggestion-category">{{ formatCategory(suggestion.category) }}</span>
              </div>
            </div>
          </div>
          
          <div class="filters">
            <div class="filter-group">
              <label>Category:</label>
              <select v-model="selectedCategory" @change="loadIngredients" class="form-select">
                <option value="">All Categories</option>
                <option v-for="cat in categories" :key="cat._id" :value="cat._id">
                  {{ formatCategory(cat._id) }} ({{ cat.count }})
                </option>
              </select>
            </div>
            
            <div class="filter-group">
              <label>Skin Type:</label>
              <select v-model="selectedSkinType" @change="loadIngredients" class="form-select">
                <option value="">All Skin Types</option>
                <option value="oily">Oily</option>
                <option value="dry">Dry</option>
                <option value="combination">Combination</option>
                <option value="sensitive">Sensitive</option>
                <option value="normal">Normal</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label>Concern:</label>
              <select v-model="selectedConcern" @change="loadIngredients" class="form-select">
                <option value="">All Concerns</option>
                <option value="acne">Acne</option>
                <option value="aging">Aging</option>
                <option value="dark_spots">Dark Spots</option>
                <option value="dryness">Dryness</option>
                <option value="sensitivity">Sensitivity</option>
                <option value="large_pores">Large Pores</option>
                <option value="uneven_tone">Uneven Tone</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <!-- Top Rated Ingredients -->
      <section v-if="topRatedIngredients.length > 0" class="top-rated-section">
        <h2>Top Rated Ingredients</h2>
        <div class="top-rated-grid">
          <div 
            v-for="ingredient in topRatedIngredients" 
            :key="ingredient._id"
            @click="selectIngredient(ingredient.name)"
            class="top-rated-card card"
          >
            <div class="ingredient-header">
              <h4>{{ ingredient.name }}</h4>
              <div class="rating">
                <span class="rating-stars">
                  ⭐ {{ ingredient.rating.average.toFixed(1) }}
                </span>
                <span class="rating-count">({{ ingredient.rating.count }})</span>
              </div>
            </div>
            <span class="category-badge">{{ formatCategory(ingredient.category) }}</span>
            <p>{{ ingredient.description.substring(0, 100) }}...</p>
          </div>
        </div>
      </section>

      <!-- Ingredients Grid -->
      <section class="ingredients-grid-section">
        <div class="section-header">
          <h2>All Ingredients</h2>
          <div class="sort-options">
            <label>Sort by:</label>
            <select v-model="sortBy" @change="loadIngredients" class="form-select">
              <option value="rating">Rating</option>
              <option value="name">Name</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading ingredients...</p>
        </div>
        
        <div v-else-if="ingredients.length === 0" class="empty-state">
          <h3>No ingredients found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
        
        <div v-else class="ingredients-grid grid grid-3">
          <div 
            v-for="ingredient in ingredients" 
            :key="ingredient._id"
            @click="selectIngredient(ingredient.name)"
            class="ingredient-card card"
          >
            <div class="ingredient-header">
              <h4>{{ ingredient.name }}</h4>
              <div v-if="ingredient.rating.count > 0" class="rating">
                <span class="rating-stars">⭐ {{ ingredient.rating.average.toFixed(1) }}</span>
                <span class="rating-count">({{ ingredient.rating.count }})</span>
              </div>
            </div>
            
            <div class="ingredient-meta">
              <span class="category-badge">{{ formatCategory(ingredient.category) }}</span>
              <div class="safety-indicators">
                <span v-if="ingredient.safetyInfo.pregnancySafe" class="safety-badge safe">Pregnancy Safe</span>
                <span v-if="ingredient.safetyInfo.comedogenicRating <= 2" class="safety-badge safe">Non-Comedogenic</span>
                <span v-if="ingredient.safetyInfo.photosensitizing" class="safety-badge warning">Photosensitizing</span>
              </div>
            </div>
            
            <p class="ingredient-description">{{ ingredient.description.substring(0, 150) }}...</p>
            
            <div v-if="ingredient.benefits.length > 0" class="benefits-preview">
              <strong>Benefits:</strong>
              <div class="benefits-tags">
                <span 
                  v-for="benefit in ingredient.benefits.slice(0, 3)" 
                  :key="benefit.benefit"
                  class="benefit-tag"
                >
                  {{ benefit.benefit }}
                </span>
              </div>
            </div>
            
            <div v-if="ingredient.concerns.length > 0" class="concerns-preview">
              <strong>Good for:</strong>
              <div class="concerns-tags">
                <span 
                  v-for="concern in ingredient.concerns.slice(0, 3)" 
                  :key="concern.concern"
                  class="concern-tag"
                >
                  {{ formatConcern(concern.concern) }}
                </span>
              </div>
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

      <!-- Ingredient Detail Modal -->
      <div v-if="selectedIngredientData" class="ingredient-modal" @click="closeModal">
        <div class="modal-content" @click.stop>
          <button @click="closeModal" class="close-btn">&times;</button>
          
          <div class="ingredient-detail">
            <div class="detail-header">
              <h2>{{ selectedIngredientData.ingredient.name }}</h2>
              <div class="ingredient-ratings">
                <div v-if="selectedIngredientData.ingredient.rating.count > 0" class="rating">
                  <span class="rating-stars">⭐ {{ selectedIngredientData.ingredient.rating.average.toFixed(1) }}</span>
                  <span class="rating-count">({{ selectedIngredientData.ingredient.rating.count }} reviews)</span>
                </div>
                <div class="rate-ingredient">
                  <label>Rate this ingredient:</label>
                  <div class="star-rating">
                    <button 
                      v-for="star in 5" 
                      :key="star"
                      @click="rateIngredient(star)"
                      :class="['star-btn', { active: star <= userRating }]"
                    >
                      ⭐
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="detail-meta">
              <span class="category-badge large">{{ formatCategory(selectedIngredientData.ingredient.category) }}</span>
              <div class="safety-score">
                Safety Score: {{ selectedIngredientData.ingredient.safetyScore }}/100
              </div>
            </div>
            
            <div class="detail-content">
              <div class="description-section">
                <h3>Description</h3>
                <p>{{ selectedIngredientData.ingredient.description }}</p>
              </div>
              
              <div v-if="selectedIngredientData.ingredient.alternativeNames.length > 0" class="alternatives-section">
                <h3>Also Known As</h3>
                <div class="alternative-names">
                  <span 
                    v-for="name in selectedIngredientData.ingredient.alternativeNames" 
                    :key="name"
                    class="alt-name"
                  >
                    {{ name }}
                  </span>
                </div>
              </div>
              
              <div class="benefits-section">
                <h3>Benefits</h3>
                <div class="benefits-list">
                  <div 
                    v-for="benefit in selectedIngredientData.ingredient.benefits" 
                    :key="benefit.benefit"
                    class="benefit-item"
                  >
                    <div class="benefit-header">
                      <strong>{{ benefit.benefit }}</strong>
                      <span class="skin-type">{{ formatSkinType(benefit.skinType) }}</span>
                    </div>
                    <div class="effectiveness-rating">
                      <span v-for="star in 5" :key="star" class="star" :class="{ filled: star <= benefit.effectivenessRating }">
                        ⭐
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="concerns-section">
                <h3>Helps With</h3>
                <div class="concerns-list">
                  <div 
                    v-for="concern in selectedIngredientData.ingredient.concerns" 
                    :key="concern.concern"
                    class="concern-item"
                  >
                    <span class="concern-name">{{ formatConcern(concern.concern) }}</span>
                    <span class="effectiveness-level" :class="concern.effectiveness">
                      {{ concern.effectiveness }} effectiveness
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="safety-section">
                <h3>Safety Information</h3>
                <div class="safety-grid">
                  <div class="safety-item">
                    <strong>Pregnancy Safe:</strong>
                    <span :class="selectedIngredientData.ingredient.safetyInfo.pregnancySafe ? 'safe' : 'warning'">
                      {{ selectedIngredientData.ingredient.safetyInfo.pregnancySafe ? 'Yes' : 'Consult Doctor' }}
                    </span>
                  </div>
                  <div class="safety-item">
                    <strong>Comedogenic Rating:</strong>
                    <span>{{ selectedIngredientData.ingredient.safetyInfo.comedogenicRating }}/5</span>
                  </div>
                  <div class="safety-item">
                    <strong>Photosensitizing:</strong>
                    <span :class="selectedIngredientData.ingredient.safetyInfo.photosensitizing ? 'warning' : 'safe'">
                      {{ selectedIngredientData.ingredient.safetyInfo.photosensitizing ? 'Yes' : 'No' }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div v-if="selectedIngredientData.ingredient.usage" class="usage-section">
                <h3>Usage Guidelines</h3>
                <div class="usage-info">
                  <div class="usage-item">
                    <strong>Best Time:</strong> {{ selectedIngredientData.ingredient.usage.timeOfDay }}
                  </div>
                  <div class="usage-item">
                    <strong>Application:</strong> {{ selectedIngredientData.ingredient.usage.application }}
                  </div>
                  <div v-if="selectedIngredientData.ingredient.usage.waitTime" class="usage-item">
                    <strong>Wait Time:</strong> {{ selectedIngredientData.ingredient.usage.waitTime }}
                  </div>
                </div>
              </div>
              
              <div v-if="selectedIngredientData.ingredient.interactions.avoid.length > 0" class="interactions-section">
                <h3>⚠️ Avoid Mixing With</h3>
                <div class="interactions-list">
                  <div 
                    v-for="interaction in selectedIngredientData.ingredient.interactions.avoid" 
                    :key="interaction.ingredient"
                    class="interaction-item"
                  >
                    <strong>{{ interaction.ingredient }}</strong>
                    <p>{{ interaction.reason }}</p>
                    <span class="severity" :class="interaction.severity">{{ interaction.severity }} risk</span>
                  </div>
                </div>
              </div>
              
              <div v-if="selectedIngredientData.ingredient.interactions.synergistic.length > 0" class="synergistic-section">
                <h3>✅ Works Well With</h3>
                <div class="synergistic-list">
                  <div 
                    v-for="synergy in selectedIngredientData.ingredient.interactions.synergistic" 
                    :key="synergy.ingredient"
                    class="synergy-item"
                  >
                    <strong>{{ synergy.ingredient }}</strong>
                    <p>{{ synergy.benefit }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Related Ingredients -->
            <div v-if="selectedIngredientData.relatedIngredients.length > 0" class="related-section">
              <h3>Related Ingredients</h3>
              <div class="related-grid">
                <div 
                  v-for="related in selectedIngredientData.relatedIngredients" 
                  :key="related._id"
                  @click="selectIngredient(related.name)"
                  class="related-item card"
                >
                  <h5>{{ related.name }}</h5>
                  <span class="category-badge small">{{ formatCategory(related.category) }}</span>
                  <p>{{ related.description.substring(0, 80) }}...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ingredientsService, utils } from '../services/api'

export default {
  name: 'Ingredients',
  data() {
    return {
      ingredients: [],
      topRatedIngredients: [],
      categories: [],
      searchQuery: '',
      searchSuggestions: [],
      showSuggestions: false,
      selectedCategory: '',
      selectedSkinType: '',
      selectedConcern: '',
      sortBy: 'rating',
      loading: false,
      selectedIngredientData: null,
      userRating: 0,
      pagination: {
        current: 1,
        pages: 1,
        total: 0,
        hasNext: false,
        hasPrev: false
      }
    }
  },
  created() {
    // Create debounced search function with proper context
    this.debouncedSearchInput = utils.debounce(async () => {
      if (this.searchQuery && this.searchQuery.length >= 2) {
        try {
          const response = await ingredientsService.getSearchSuggestions(this.searchQuery)
          this.searchSuggestions = response.suggestions
          this.showSuggestions = true
        } catch (error) {
          console.error('Error getting search suggestions:', error)
        }
      } else {
        this.searchSuggestions = []
        this.showSuggestions = false
      }
      
      this.loadIngredients(1)
    }, 300)
  },
  mounted() {
    this.loadInitialData()
  },
  methods: {
    async loadInitialData() {
      try {
        await Promise.all([
          this.loadTopRatedIngredients(),
          this.loadCategories(),
          this.loadIngredients()
        ])
      } catch (error) {
        console.error('Error loading initial data:', error)
      }
    },
    
    async loadTopRatedIngredients() {
      try {
        const response = await ingredientsService.getTopRatedIngredients(6)
        this.topRatedIngredients = response.ingredients
      } catch (error) {
        console.error('Error loading top rated ingredients:', error)
      }
    },
    
    async loadCategories() {
      try {
        const response = await ingredientsService.getCategories()
        this.categories = response.categories
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    },
    
    async loadIngredients(page = 1) {
      this.loading = true
      
      try {
        const params = {
          page,
          limit: 18,
          category: this.selectedCategory,
          skinType: this.selectedSkinType,
          concern: this.selectedConcern,
          search: this.searchQuery,
          sort: this.sortBy
        }
        
        // Remove empty params
        Object.keys(params).forEach(key => {
          if (!params[key]) delete params[key]
        })
        
        const response = await ingredientsService.getIngredients(params)
        this.ingredients = response.ingredients
        this.pagination = response.pagination
        
      } catch (error) {
        console.error('Error loading ingredients:', error)
        this.ingredients = []
      } finally {
        this.loading = false
      }
    },
    
    onSearchInput() {
      // Call the debounced function created in the created lifecycle
      this.debouncedSearchInput()
    },
    
    async selectIngredient(name) {
      this.showSuggestions = false
      
      try {
        const response = await ingredientsService.getIngredientByName(name)
        this.selectedIngredientData = response
        this.userRating = 0
        document.body.style.overflow = 'hidden'
      } catch (error) {
        console.error('Error loading ingredient details:', error)
      }
    },
    
    closeModal() {
      this.selectedIngredientData = null
      document.body.style.overflow = 'auto'
    },
    
    async rateIngredient(rating) {
      this.userRating = rating
      
      try {
        await ingredientsService.rateIngredient(this.selectedIngredientData.ingredient.name, rating)
        // Update the displayed rating
        const response = await ingredientsService.getIngredientByName(this.selectedIngredientData.ingredient.name)
        this.selectedIngredientData = response
      } catch (error) {
        console.error('Error rating ingredient:', error)
      }
    },
    
    changePage(page) {
      if (page >= 1 && page <= this.pagination.pages) {
        this.loadIngredients(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    
    formatCategory(category) {
      const categories = {
        'active': 'Active Ingredients',
        'moisturizer': 'Moisturizers',
        'cleanser': 'Cleansers',
        'exfoliant': 'Exfoliants',
        'antioxidant': 'Antioxidants',
        'anti-aging': 'Anti-Aging',
        'acne-treatment': 'Acne Treatment',
        'brightening': 'Brightening',
        'soothing': 'Soothing',
        'sunscreen': 'Sun Protection',
        'preservative': 'Preservatives',
        'emulsifier': 'Emulsifiers',
        'fragrance': 'Fragrances'
      }
      return categories[category] || category
    },
    
    formatConcern: utils.formatConcern,
    formatSkinType: utils.formatSkinType
  }
}
</script>

<style scoped>
.ingredients-header {
  text-align: center;
  margin-bottom: 3rem;
}

.search-section {
  margin-bottom: 3rem;
}

.search-container {
  padding: 2rem;
}

.search-box {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  max-width: 500px;
  font-size: 1.1rem;
  padding: 1rem 1.5rem;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
  width: 100%;
  max-width: 500px;
}

.suggestion-item {
  padding: 1rem;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.suggestion-item:hover {
  background: var(--background-light);
}

.suggestion-category {
  color: var(--text-light);
  font-size: 0.875rem;
}

.filters {
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

.top-rated-section {
  margin-bottom: 4rem;
}

.top-rated-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.top-rated-card {
  padding: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.top-rated-card:hover {
  border-color: var(--primary-color);
}

.ingredient-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.rating {
  text-align: right;
}

.rating-stars {
  color: #fbbf24;
  font-weight: 600;
}

.rating-count {
  color: var(--text-light);
  font-size: 0.875rem;
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--secondary-color);
  color: white;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
}

.category-badge.large {
  padding: 0.5rem 1rem;
  font-size: 1rem;
}

.category-badge.small {
  padding: 0.2rem 0.5rem;
  font-size: 0.7rem;
}

.ingredients-grid-section {
  margin-bottom: 4rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ingredient-card {
  padding: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s ease;
  height: fit-content;
}

.ingredient-card:hover {
  transform: translateY(-4px);
}

.ingredient-meta {
  margin-bottom: 1rem;
}

.safety-indicators {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.safety-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.safety-badge.safe {
  background: #d1fae5;
  color: #065f46;
}

.safety-badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.ingredient-description {
  color: var(--text-light);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.benefits-preview,
.concerns-preview {
  margin-bottom: 1rem;
}

.benefits-tags,
.concerns-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.benefit-tag,
.concern-tag {
  padding: 0.2rem 0.6rem;
  background: var(--background-light);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 0.75rem;
  color: var(--text-dark);
}

.ingredient-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: var(--border-radius);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: var(--text-light);
  z-index: 10;
}

.ingredient-detail {
  padding: 2rem;
}

.detail-header {
  margin-bottom: 2rem;
}

.ingredient-ratings {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.rate-ingredient {
  text-align: right;
}

.star-rating {
  display: flex;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.star-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 0.2s;
}

.star-btn.active,
.star-btn:hover {
  opacity: 1;
}

.detail-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.safety-score {
  font-weight: 600;
  color: var(--secondary-color);
}

.detail-content > div {
  margin-bottom: 2rem;
}

.alternative-names {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.alt-name {
  padding: 0.5rem 1rem;
  background: var(--background-light);
  border-radius: 20px;
  font-size: 0.875rem;
}

.benefits-list,
.concerns-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.benefit-item,
.concern-item {
  padding: 1rem;
  background: var(--background-light);
  border-radius: var(--border-radius);
}

.benefit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.skin-type {
  color: var(--text-light);
  font-size: 0.875rem;
}

.effectiveness-rating {
  display: flex;
  gap: 0.2rem;
}

.star {
  opacity: 0.3;
}

.star.filled {
  opacity: 1;
}

.effectiveness-level {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.effectiveness-level.low {
  background: #fecaca;
  color: #dc2626;
}

.effectiveness-level.moderate {
  background: #fed7aa;
  color: #c2410c;
}

.effectiveness-level.high {
  background: #d1fae5;
  color: #065f46;
}

.effectiveness-level.very_high {
  background: #a7f3d0;
  color: #047857;
}

.safety-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.safety-item {
  padding: 1rem;
  background: var(--background-light);
  border-radius: var(--border-radius);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.usage-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.usage-item {
  padding: 0.75rem;
  background: var(--background-light);
  border-radius: var(--border-radius);
}

.interactions-list,
.synergistic-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.interaction-item,
.synergy-item {
  padding: 1rem;
  border-radius: var(--border-radius);
  border-left: 4px solid;
}

.interaction-item {
  background: #fef2f2;
  border-left-color: #ef4444;
}

.synergy-item {
  background: #f0fdf4;
  border-left-color: #22c55e;
}

.severity {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.severity.mild {
  background: #fef3c7;
  color: #92400e;
}

.severity.moderate {
  background: #fed7aa;
  color: #c2410c;
}

.severity.severe {
  background: #fecaca;
  color: #dc2626;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.related-item {
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.related-item:hover {
  transform: translateY(-2px);
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

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .ingredients-grid {
    grid-template-columns: 1fr;
  }
  
  .ingredient-ratings {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .rate-ingredient {
    text-align: left;
  }
  
  .safety-grid {
    grid-template-columns: 1fr;
  }
  
  .related-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    margin: 0.5rem;
    max-height: 95vh;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>