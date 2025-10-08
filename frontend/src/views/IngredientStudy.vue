<template>
    <div class="ingredient-study">
        <!-- Header -->
        <div class="study-header">
            <h1>Product Ingredient Study</h1>
            <p>Analyze the ingredients in your skincare products and understand their benefits and potential
                concerns</p>
        </div>

        <!-- Product Input Section -->
        <section class="product-input-section">
            <div class="input-card card">
                <h2>Analyze Your Product</h2>
                <div class="product-form">
                    <div class="form-group">
                        <label for="productName">Product Name (Optional)</label>
                        <input id="productName" v-model="productName" type="text"
                            placeholder="e.g., WOWSKIN TRANEXAMIC SERUM 30ml" class="form-input" />
                    </div>

                    <div class="form-group">
                        <label for="ingredientsList">Ingredients List</label>
                        <textarea id="ingredientsList" v-model="ingredientsList"
                            placeholder="Paste the full ingredients list here, separated by commas..."
                            class="form-textarea" rows="8"></textarea>
                        <small class="form-hint">
                            Example: Aqua, Butylene Glycol, Niacinamide, Glycerin, Tranexamic Acid, Panthenol...
                        </small>
                    </div>

                    <div class="form-actions">
                        <button @click="analyzeIngredients" :disabled="!ingredientsList.trim() || loading"
                            class="btn btn-primary">
                            <span v-if="loading" class="loading-spinner small"></span>
                            {{ loading ? 'Analyzing...' : 'Analyze Ingredients' }}
                        </button>

                        <button @click="loadSampleProduct" class="btn btn-outline">
                            Load Sample Product
                        </button>

                        <button v-if="analyzedIngredients.length > 0" @click="clearAnalysis" class="btn btn-secondary">
                            Clear Analysis
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Analysis Results -->
        <section v-if="analyzedIngredients.length > 0" class="analysis-results">
            <!-- Summary Stats -->
            <div class="analysis-summary card">
                <h2>Analysis Summary</h2>
                <div class="summary-stats">
                    <div class="stat-item">
                        <div class="stat-number">{{ analyzedIngredients.length }}</div>
                        <div class="stat-label">Total Ingredients</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">{{ matchedIngredientsCount }}</div>
                        <div class="stat-label">Recognized</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">{{ activeIngredientsCount }}</div>
                        <div class="stat-label">Active Ingredients</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">{{ potentialConcernsCount }}</div>
                        <div class="stat-label">Potential Concerns</div>
                    </div>
                </div>
            </div>

            <!-- Category Breakdown -->
            <div class="category-breakdown card">
                <h3>Ingredient Categories</h3>
                <div class="category-grid">
                    <div v-for="(count, category) in categoryBreakdown" :key="category" class="category-item">
                        <div class="category-color" :style="{ backgroundColor: getCategoryColor(category) }"></div>
                        <span class="category-name">{{ formatCategory(category) }}</span>
                        <span class="category-count">{{ count }}</span>
                    </div>
                </div>
            </div>


            <!-- Ingredients List -->
            <div class="ingredients-analysis">
                <div class="analysis-header">
                    <h3>Detailed Ingredient Analysis</h3>
                    <div class="filter-tabs">
                        <div class="main-filters">
                            <button @click="activeFilter = 'all'" :class="{ active: activeFilter === 'all' }"
                                class="filter-tab">
                                All ({{ analyzedIngredients.length }})
                            </button>
                            <button @click="activeFilter = 'recognized'"
                                :class="{ active: activeFilter === 'recognized' }" class="filter-tab">
                                Recognized ({{ matchedIngredientsCount }})
                            </button>
                            <button @click="activeFilter = 'active'" :class="{ active: activeFilter === 'active' }"
                                class="filter-tab">
                                Active ({{ activeIngredientsCount }})
                            </button>
                            <button @click="activeFilter = 'concerns'" :class="{ active: activeFilter === 'concerns' }"
                                class="filter-tab">
                                Concerns ({{ potentialConcernsCount }})
                            </button>
                        </div>

                        <!-- Category Filter Tabs -->
                        <div v-if="Object.keys(categoryBreakdown).length > 0" class="category-filters">
                            <span class="filter-separator">Categories:</span>
                            <button v-for="(count, category) in categoryBreakdown" :key="category"
                                @click="activeFilter = category" :class="{ active: activeFilter === category }"
                                class="filter-tab category-tab" :style="{
                                    '--category-color': getCategoryColor(category),
                                    borderColor: activeFilter === category ? getCategoryColor(category) : '#e5e7eb',
                                    color: activeFilter === category ? getCategoryColor(category) : '#6b7280'
                                }">
                                {{ formatCategory(category) }} ({{ count }})
                            </button>
                        </div>
                    </div>
                </div>

                <div class="ingredients-list">
                    <!-- Compact Table View -->
                    <div class="ingredients-table">
                        <div class="table-header">
                            <div class="col-position">#</div>
                            <div class="col-name">Ingredient</div>
                            <div class="col-category">Category</div>
                            <div class="col-description">Description</div>
                            <div class="col-benefits">Benefits</div>
                            <div class="col-concerns">Good For</div>
                            <div class="col-safety">Safety</div>
                        </div>

                        <div v-for="(ingredient, index) in filteredIngredients" :key="index" class="table-row" :class="{
                            'recognized': ingredient.recognized,
                            'active-ingredient': ingredient.data?.category === 'active',
                            'has-concerns': ingredient.concerns.length > 0
                        }">
                            <!-- Position -->
                            <div class="col-position">
                                <span class="position-number">{{ index + 1 }}</span>
                                <small class="position-note">{{ getPositionNote(index) }}</small>
                            </div>

                            <!-- Ingredient Name -->
                            <div class="col-name">
                                <div class="ingredient-name-cell">
                                    <h4>{{ ingredient.name }}</h4>
                                    <div class="ingredient-badges-compact">
                                        <span v-if="!ingredient.recognized" class="badge-mini unknown">Unknown</span>
                                        <span v-if="ingredient.data?.category === 'active'"
                                            class="badge-mini active">Active</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Category -->
                            <div class="col-category">
                                <span v-if="ingredient.data?.category" class="category-badge-compact" :style="{
                                    backgroundColor: getCategoryColor(ingredient.data.category) + '20',
                                    color: getCategoryColor(ingredient.data.category)
                                }">
                                    {{ formatCategory(ingredient.data.category) }}
                                </span>
                                <span v-else class="text-muted">-</span>
                            </div>

                            <!-- Description -->
                            <div class="col-description">
                                <div v-if="ingredient.data?.description" class="description-compact">
                                    {{ ingredient.data.description.substring(0, 200) }}{{ ingredient.data.description.length > 200 ? '...' : '' }}
                                </div>
                                <span v-else class="text-muted">-</span>
                            </div>

                            <!-- Benefits -->
                            <div class="col-benefits">
                                <div v-if="ingredient.data?.benefits?.length > 0" class="benefits-compact">
                                    <div v-for="(benefit, idx) in ingredient.data.benefits.slice(0, 3)" :key="idx"
                                        class="benefit-compact">
                                        <span class="benefit-text-compact">{{ benefit.benefit }}</span>
                                        <span v-if="benefit.effectivenessRating" class="rating-compact">
                                            {{ '★'.repeat(benefit.effectivenessRating) }}
                                        </span>
                                    </div>
                                    <span v-if="ingredient.data.benefits.length > 3" class="more-benefits">
                                        +{{ ingredient.data.benefits.length - 3 }} more
                                    </span>
                                </div>
                                <span v-else class="text-muted">-</span>
                            </div>

                            <!-- Concerns -->
                            <div class="col-concerns">
                                <div v-if="ingredient.data?.concerns?.length > 0" class="concerns-compact">
                                    <span v-for="concern in ingredient.data.concerns.slice(0, 2)" :key="concern.concern"
                                        class="concern-tag-compact" :class="concern.effectiveness">
                                        {{ formatConcern(concern.concern) }}
                                    </span>
                                    <span v-if="ingredient.data.concerns.length > 2" class="more-concerns">
                                        +{{ ingredient.data.concerns.length - 2 }}
                                    </span>
                                </div>
                                <span v-else class="text-muted">-</span>
                            </div>

                            <!-- Safety -->
                            <div class="col-safety">
                                <div v-if="ingredient.data?.safetyInfo" class="safety-compact">
                                    <div class="safety-indicators">
                                        <span v-if="ingredient.data.safetyInfo.pregnancySafe !== undefined"
                                            class="safety-icon"
                                            :class="{ safe: ingredient.data.safetyInfo.pregnancySafe, warning: !ingredient.data.safetyInfo.pregnancySafe }"
                                            :title="ingredient.data.safetyInfo.pregnancySafe ? 'Pregnancy Safe' : 'Pregnancy Caution'">
                                            🤰
                                        </span>
                                        <span v-if="ingredient.data.safetyInfo.comedogenicRating !== undefined"
                                            class="safety-icon"
                                            :class="{ safe: ingredient.data.safetyInfo.comedogenicRating <= 2, warning: ingredient.data.safetyInfo.comedogenicRating > 2 }"
                                            :title="`Comedogenic Rating: ${ingredient.data.safetyInfo.comedogenicRating}/5`">
                                            {{ ingredient.data.safetyInfo.comedogenicRating <= 2 ? '✓' : '⚠️' }} </span>
                                                <span v-if="ingredient.data.safetyInfo.photosensitizing"
                                                    class="safety-icon warning"
                                                    title="Photosensitizing - Use Sunscreen">
                                                    ☀️
                                                </span>
                                    </div>
                                </div>
                                <span v-else class="text-muted">-</span>
                            </div>

                            <!-- Expandable Details -->
                            <div v-if="expandedRows.includes(index) && ingredient.recognized && ingredient.data"
                                class="expanded-details">
                                <div class="detail-content">
                                    <p class="ingredient-description">{{ ingredient.data.description }}</p>

                                    <!-- Full Benefits List -->
                                    <div v-if="ingredient.data.benefits?.length > 0" class="full-benefits">
                                        <h6>All Benefits:</h6>
                                        <div class="benefits-grid">
                                            <div v-for="benefit in ingredient.data.benefits" :key="benefit.benefit"
                                                class="benefit-item-detailed">
                                                <span class="benefit-text">{{ benefit.benefit }}</span>
                                                <span v-if="benefit.effectivenessRating" class="effectiveness-rating">
                                                    {{ '★'.repeat(benefit.effectivenessRating) }}{{ '☆'.repeat(5 -
                                                        benefit.effectivenessRating) }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Potential Concerns -->
                                    <div v-if="ingredient.concerns.length > 0" class="potential-concerns-compact">
                                        <h6>⚠️ Potential Concerns:</h6>
                                        <ul>
                                            <li v-for="concern in ingredient.concerns" :key="concern">{{ concern }}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <!-- Unknown Ingredient Info -->
                            <div v-if="expandedRows.includes(index) && !ingredient.recognized" class="expanded-details">
                                <div class="detail-content">
                                    <div class="unknown-ingredient-compact">
                                        <p>This ingredient is not in our database. It may be:</p>
                                        <ul>
                                            <li>A new or rare ingredient</li>
                                            <li>A trade name or proprietary blend</li>
                                            <li>A common ingredient with an alternative name</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Educational Tips -->
        <section class="educational-tips card">
            <h2>💡 How to Read Ingredient Lists</h2>
            <div class="tips-grid">
                <div class="tip-item">
                    <h4>Order Matters</h4>
                    <p>Ingredients are listed in descending order by concentration. The first few ingredients make
                        up most of the product.</p>
                </div>
                <div class="tip-item">
                    <h4>Active Ingredients</h4>
                    <p>Look for proven actives like retinol, niacinamide, salicylic acid, or hyaluronic acid for
                        specific skin benefits.</p>
                </div>
                <div class="tip-item">
                    <h4>Base Ingredients</h4>
                    <p>Water (Aqua) is often first, followed by humectants like glycerin and emollients that form
                        the product base.</p>
                </div>
                <div class="tip-item">
                    <h4>Preservatives</h4>
                    <p>Ingredients at the end of the list are often preservatives (like phenoxyethanol) to prevent
                        bacterial growth.</p>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    name: 'IngredientStudy',
    data() {
        return {
            productName: '',
            ingredientsList: '',
            loading: false,
            analyzedIngredients: [],
            activeFilter: 'all',
            expandedRows: [], // Track which rows are expanded

            // Sample product data
            sampleProduct: {
                name: 'WOWSKIN TRANEXAMIC SERUM 30ml',
                ingredients: 'Aqua, Butylene Glycol, Niacinamide, Glycerin, Tranexamic Acid, Panthenol, Allantoin, Arbutin, Adenosine, Sodium Hyaluronate, Bakuchiol, Camellia Japonica Flower Extract, Carthamus Tinctorius Flower Extract, Chrysanthemum Indicum Flower Extract, Chrysanthemum Morifolium Flower Extract, Lilium Tigrinum Extract, Lonicera Japonica Flower Extract, Magnolia Kobus Branch/Flower/Leaf Extract, Nelumbo Nucifera Flower Extract, Prunus Mume Flower Extract, Prunus Serrulata Flower Extract, Artemisia Absinthium Extract, Chamomilla Recutita Flower Extract, Gentiana Lutea Root Extract, Portulaca Oleracea Extract, Acer Saccharum Extract, Snail Secretion Filtrate, Houttuynia Cordata Extract, Ganoderma Lucidum (Mushroom) Extract, Propolis Extract, Bambusa Vulgaris Extract, Camellia Sinensis Leaf Extract, Centella Asiatica Extract, Chamaecyparis Obtusa Leaf Extract, Cinnamomum Cassia Bark Extract, Lactobacillus/Soybean Ferment Extract, Melissa Officinalis Leaf Extract, Origanum Majorana Leaf Extract, Origanum Vulgare Leaf Extract, Pinus Densiflora Extract, Rosa Centifolia Flower Water, Salix Alba (Willow) Bark Extract, Scutellaria Baicalensis Root Extract, Soleirolia Soleirolii Extract, Thuja Orientalis Extract, Hydroxyethylcellulose, Propanediol, Disodium EDTA, Sodium Citrate, Citric Acid, Ethylhexylglycerin, Phenoxyethanol, 1,2-Hexanediol'
            }
        }
    },

    mounted() {
        // Load saved analysis when component mounts
        this.loadSavedAnalysis()
    },

    watch: {
        // Save analysis whenever it changes
        analyzedIngredients: {
            handler(newVal) {
                if (newVal && newVal.length > 0) {
                    this.saveAnalysis()
                }
            },
            deep: true
        },
        productName: {
            handler(newVal) {
                this.saveAnalysis()
            }
        },
        ingredientsList: {
            handler(newVal) {
                this.saveAnalysis()
            }
        }
    },

    computed: {
        matchedIngredientsCount() {
            return this.analyzedIngredients.filter(ing => ing.recognized).length
        },

        activeIngredientsCount() {
            return this.analyzedIngredients.filter(ing => ing.data?.category === 'active').length
        },

        potentialConcernsCount() {
            return this.analyzedIngredients.filter(ing => ing.concerns.length > 0).length
        },

        categoryBreakdown() {
            const breakdown = {}
            this.analyzedIngredients.forEach(ing => {
                if (ing.data?.category) {
                    breakdown[ing.data.category] = (breakdown[ing.data.category] || 0) + 1
                }
            })
            return breakdown
        },

        filteredIngredients() {
            switch (this.activeFilter) {
                case 'recognized':
                    return this.analyzedIngredients.filter(ing => ing.recognized)
                case 'active':
                    return this.analyzedIngredients.filter(ing => ing.data?.category === 'active')
                case 'concerns':
                    return this.analyzedIngredients.filter(ing => ing.concerns.length > 0)
                case 'all':
                    return this.analyzedIngredients
                default:
                    // Check if it's a category filter
                    if (Object.keys(this.categoryBreakdown).includes(this.activeFilter)) {
                        return this.analyzedIngredients.filter(ing => ing.data?.category === this.activeFilter)
                    }
                    return this.analyzedIngredients
            }
        }
    },

    methods: {
        // Persistent storage methods
        saveAnalysis() {
            try {
                const analysisData = {
                    productName: this.productName,
                    ingredientsList: this.ingredientsList,
                    analyzedIngredients: this.analyzedIngredients,
                    activeFilter: this.activeFilter,
                    expandedRows: this.expandedRows,
                    timestamp: new Date().toISOString()
                }
                localStorage.setItem('ingredientStudyAnalysis', JSON.stringify(analysisData))
            } catch (error) {
                console.warn('Failed to save analysis to localStorage:', error)
            }
        },

        loadSavedAnalysis() {
            try {
                const savedData = localStorage.getItem('ingredientStudyAnalysis')
                if (savedData) {
                    const analysisData = JSON.parse(savedData)

                    // Check if the saved data is not too old (e.g., 7 days)
                    const savedTime = new Date(analysisData.timestamp)
                    const now = new Date()
                    const daysDiff = (now - savedTime) / (1000 * 60 * 60 * 24)

                    if (daysDiff <= 7) {
                        this.productName = analysisData.productName || ''
                        this.ingredientsList = analysisData.ingredientsList || ''
                        this.analyzedIngredients = analysisData.analyzedIngredients || []
                        this.activeFilter = analysisData.activeFilter || 'all'
                        this.expandedRows = analysisData.expandedRows || []
                    } else {
                        // Clear old data
                        this.clearSavedAnalysis()
                    }
                }
            } catch (error) {
                console.warn('Failed to load saved analysis:', error)
                this.clearSavedAnalysis()
            }
        },

        clearSavedAnalysis() {
            try {
                localStorage.removeItem('ingredientStudyAnalysis')
            } catch (error) {
                console.warn('Failed to clear saved analysis:', error)
            }
        },

        loadSampleProduct() {
            this.productName = this.sampleProduct.name
            this.ingredientsList = this.sampleProduct.ingredients
        },

        clearAnalysis() {
            // Clear all analysis data
            this.productName = ''
            this.ingredientsList = ''
            this.analyzedIngredients = []
            this.activeFilter = 'all'
            this.expandedRows = []

            // Clear saved data from localStorage
            this.clearSavedAnalysis()

            // Show confirmation
            this.showClearNotification()
        },

        showClearNotification() {
            // Create a simple notification div
            const notification = document.createElement('div')
            notification.className = 'clear-notification'
            notification.innerHTML = `
                <div class="notification-content">
                    <span>🗑️ Analysis cleared</span>
                    <button onclick="this.parentElement.parentElement.remove()" class="close-btn">×</button>
                </div>
            `

            // Add styles (reuse existing notification styles but with different color)
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #6b7280;
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                animation: slideIn 0.3s ease-out;
            `

            document.body.appendChild(notification)

            // Auto-remove after 3 seconds
            setTimeout(() => {
                if (notification && notification.parentElement) {
                    notification.remove()
                }
            }, 3000)
        },

        async analyzeIngredients() {
            if (!this.ingredientsList.trim()) return

            this.loading = true
            this.expandedRows = [] // Reset expanded rows
            try {
                // Parse ingredients list
                const ingredientNames = this.parseIngredientsList(this.ingredientsList)

                // Use batch search instead of individual requests
                const response = await axios.post('/api/ingredients/batch-search', {
                    ingredients: ingredientNames
                })

                if (response.data.success) {
                    this.analyzedIngredients = response.data.results.map((result, index) => {
                        const ingredient = {
                            name: result.query.trim(),
                            recognized: !!result.ingredient,
                            data: result.ingredient,
                            concerns: [],
                            position: index + 1
                        }

                        // Add position-based concerns
                        ingredient.concerns = this.getPositionConcerns(index, ingredient.data)

                        return ingredient
                    })
                } else {
                    throw new Error(response.data.message || 'Failed to analyze ingredients')
                }

            } catch (error) {
                console.error('Error analyzing ingredients:', error)
                this.$toast?.error('Error analyzing ingredients. Please try again.')
            } finally {
                this.loading = false
            }
        },

        parseIngredientsList(ingredientsText) {
            // Split by commas and clean up
            return ingredientsText
                .split(',')
                .map(ingredient => ingredient.trim())
                .filter(ingredient => ingredient.length > 0)
                .map(ingredient => {
                    // Remove common prefixes/suffixes
                    return ingredient
                        .replace(/^(and\s+)/i, '')
                        .replace(/\s*\([^)]*\)$/, '') // Remove parenthetical info at the end
                        .trim()
                })
        },

        async searchIngredient(name) {
            try {
                const response = await axios.get(`/api/ingredients/search`, {
                    params: { q: name, limit: 1 }
                })
                return response.data.success ? response.data.ingredients : []
            } catch (error) {
                // Fallback to regular ingredients endpoint with search
                try {
                    const response = await axios.get(`/api/ingredients`, {
                        params: { search: name, limit: 1 }
                    })
                    return response.data.success ? response.data.ingredients : []
                } catch (fallbackError) {
                    return []
                }
            }
        },

        getPositionConcerns(position, ingredientData) {
            const concerns = []

            // High concentration concerns (first 5 ingredients)
            if (position < 5) {
                if (ingredientData?.safetyInfo?.photosensitizing) {
                    concerns.push('High concentration of photosensitizing ingredient - use sunscreen')
                }
                if (ingredientData?.safetyInfo?.comedogenicRating > 3) {
                    concerns.push('High concentration of potentially comedogenic ingredient')
                }
            }

            // Specific ingredient concerns
            if (ingredientData?.category === 'active' && position > 10) {
                concerns.push('Active ingredient appears late in list - may have lower concentration')
            }

            return concerns
        },

        getPositionNote(index) {
            if (index < 3) return 'High concentration'
            if (index < 10) return 'Medium concentration'
            return 'Low concentration'
        },

        formatCategory(category) {
            return category
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
        },

        formatConcern(concern) {
            const concernMap = {
                'dark_spots': 'Dark Spots',
                'large_pores': 'Large Pores',
                'uneven_tone': 'Uneven Tone'
            }
            return concernMap[concern] || concern.charAt(0).toUpperCase() + concern.slice(1)
        },

        getCategoryColor(category) {
            const colors = {
                'active': '#4f46e5',
                'moisturizer': '#06b6d4',
                'antioxidant': '#10b981',
                'anti-aging': '#f59e0b',
                'brightening': '#eab308',
                'soothing': '#84cc16',
                'preservative': '#6b7280',
                'emulsifier': '#8b5cf6',
                'fragrance': '#ec4899'
            }
            return colors[category] || 'var(--primary-color)'
        },

        toggleDetails(index) {
            const position = this.expandedRows.indexOf(index)
            if (position > -1) {
                this.expandedRows.splice(position, 1)
            } else {
                this.expandedRows.push(index)
            }
        }
    }
}
</script>

<style scoped>
.ingredient-study {
    min-height: 100vh;
    padding: 2rem 4rem;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0;
}

/* Header */
.study-header {
    text-align: center;
    margin-bottom: 3rem;
}

.study-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--primary-800);
    margin-bottom: 1rem;
}

.study-header p {
    font-size: 1.1rem;
    color: var(--primary-color);
    max-width: 600px;
    margin: 0 auto;
}

/* Card base styles */
.card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
}

/* Product Input Section */
.product-input-section {
    margin-bottom: 3rem;
}

.input-card h2 {
    color: var(--primary-800);
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
}

.form-input,
.form-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
    outline: none;
    border-color: var(--primary-color);
}

.form-textarea {
    resize: vertical;
    font-family: inherit;
}

.form-hint {
    color: #6b7280;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

.form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
}

/* Buttons */
.btn {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-primary {
    background: var(--primary-color);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: var(--primary-color);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-outline {
    background: transparent;
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
}

.btn-outline:hover {
    background: var(--primary-color);
    color: white;
}

.btn-secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
}

.btn-secondary:hover {
    background: #e5e7eb;
    border-color: #9ca3af;
}

/* Loading spinner */
.loading-spinner {
    border: 1px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    width: 1rem;
    height: 1rem;
    animation: spin 1s linear infinite;
}

.loading-spinner.small {
    width: 0.875rem;
    height: 0.875rem;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* Analysis Results */
.analysis-summary h2 {
    color: var(--primary-800);
    margin-bottom: 1.5rem;
}

.summary-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1.5rem;
}

.stat-item {
    text-align: center;
    padding: 1rem;
    background: var(--primary-50);
    border-radius: 8px;
}

.stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-color);
}

.stat-label {
    color: var(--primary-color);
    font-weight: 500;
    margin-top: 0.25rem;
}

/* Category Breakdown */
.category-breakdown h3 {
    color: var(--primary-800);
    margin-bottom: 1rem;
}

.category-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.category-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--primary-50);
    border-radius: 20px;
    font-size: 0.875rem;
}

.category-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.category-count {
    background: #e2e8f0;
    color: #475569;
    padding: 0.125rem 0.5rem;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.75rem;
}

/* Filter tabs */
.analysis-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    gap: 1rem;
}

.analysis-header h3 {
    color: var(--primary-800);
    margin: 0;
    flex-shrink: 0;
}

.filter-tabs {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.main-filters,
.category-filters {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.filter-separator {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
    margin-right: 0.5rem;
}

.filter-tab {
    padding: 0.5rem 1rem;
    border: 2px solid #e5e7eb;
    background: white;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.filter-tab.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
}

.filter-tab.category-tab.active {
    background: transparent;
    color: var(--category-color, var(--primary-color));
    border-color: var(--category-color, var(--primary-color));
    border-width: 2px;
}

.filter-tab:hover:not(.active) {
    border-color: var(--primary-color);
    color: var(--primary-color);
}

.filter-tab.category-tab:hover:not(.active) {
    border-color: var(--category-color, var(--primary-color));
    color: var(--category-color, var(--primary-color));
}

/* Ingredient Analysis Table */
.ingredients-list {
    display: flex;
    flex-direction: column;
}

.ingredients-table {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--primary-400);
}

.table-header {
    display: grid;
    grid-template-columns: 60px 150px 100px 3fr 3fr 140px 100px;
    gap: 1rem;
    padding: 1rem;
    background: var(--primary-50);
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--primary-800);
    border-bottom: 1px solid #e5e7eb;
}

.table-row {
    display: grid;
    grid-template-columns: 60px 150px 100px 3fr 3fr 140px 100px;
    gap: 1rem;
    padding: 1.5rem 1rem;
    border-bottom: 1px solid #f3f4f6;
    transition: all 0.2s;
    position: relative;
}

/* Column styles */
.col-position {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.position-number {
    font-weight: 600;
    font-size: 1.1rem;
    color: var(--primary-600);
}

.position-note {
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.25rem;
}

.col-name {
    min-width: 0;
}

.ingredient-name-cell h4 {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
    color: var(--primary-800);
    font-weight: 600;
    line-height: 1.2;
}

.ingredient-badges-compact {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
}

.badge-mini {
    padding: 0.125rem 0.5rem;
    border-radius: 8px;
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.025em;
}

.badge-mini.unknown {
    background: #fef3c7;
    color: #92400e;
}

.badge-mini.active {
    background: #fecaca;
    color: #991b1b;
}

.category-badge-compact {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    text-align: center;
    display: inline-block;
}

.description-compact {
    font-size: 0.75rem;
    color: #4b5563;
    line-height: 1.4;
    text-overflow: ellipsis;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
}

.benefits-compact,
.concerns-compact {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.benefit-compact {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0.5rem;
    background: #f0fdf4;
    border-radius: 4px;
    font-size: 0.75rem;
}

.benefit-text-compact {
    color: #166534;
    flex: 1;
    line-height: 1.2;
}

.rating-compact {
    color: #fbbf24;
    font-size: 0.625rem;
    margin-left: 0.25rem;
}

.concern-tag-compact {
    padding: 0.125rem 0.5rem;
    border-radius: 8px;
    font-size: 0.625rem;
    font-weight: 500;
    background: #e0f2fe;
    color: #0c4a6e;
    display: inline-block;
    margin-bottom: 0.25rem;
}

.concern-tag-compact.high {
    background: #dcfce7;
    color: #166534;
}

.concern-tag-compact.very_high {
    background: #bbf7d0;
    color: #065f46;
}

.more-benefits,
.more-concerns {
    font-size: 0.625rem;
    color: #6b7280;
    font-style: italic;
    margin-top: 0.25rem;
}

.safety-compact {
    display: flex;
    justify-content: center;
}

.safety-indicators {
    display: flex;
    gap: 0.25rem;
    align-items: center;
}

.safety-icon {
    font-size: 1rem;
    opacity: 0.6;
    transition: opacity 0.2s;
}

.safety-icon.safe {
    opacity: 1;
}

.safety-icon.warning {
    opacity: 1;
}

.text-muted {
    color: #9ca3af;
    font-style: italic;
}

.btn-details {
    padding: 0.25rem 0.75rem;
    border: 1px solid var(--primary-200);
    background: white;
    color: var(--primary-600);
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-details:hover {
    background: var(--primary-50);
    border-color: var(--primary-300);
}

.btn-details.active {
    background: var(--primary-100);
    color: var(--primary-700);
    border-color: var(--primary-400);
}

/* Expandable Details */
.expanded-details {
    grid-column: 1 / -1;
    padding: 1rem;
    background: #f9fafb;
    border-top: 1px solid #e5e7eb;
    margin: 0 -1rem;
}

.detail-content {
    max-width: 800px;
}

.ingredient-description {
    color: #4b5563;
    margin-bottom: 1rem;
    line-height: 1.6;
    font-size: 0.875rem;
}

.full-benefits h6,
.potential-concerns-compact h6 {
    color: #374151;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.025em;
}

.benefits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.benefit-item-detailed {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: #f0fdf4;
    border-radius: 6px;
    font-size: 0.875rem;
}

.benefit-text {
    color: #166534;
    flex: 1;
}

.effectiveness-rating {
    color: #fbbf24;
    font-size: 0.75rem;
    margin-left: 0.5rem;
}

.potential-concerns-compact {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
}

.potential-concerns-compact h6 {
    color: #dc2626;
}

.potential-concerns-compact ul {
    margin: 0;
    padding-left: 1.5rem;
    color: #991b1b;
}

.unknown-ingredient-compact {
    color: #6b7280;
    font-style: italic;
}

.unknown-ingredient-compact ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
}

/* Educational Tips */
.educational-tips h2 {
    color: var(--primary-800);
    margin-bottom: 1.5rem;
    text-align: center;
}

.tips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.tip-item {
    padding: 1rem;
    background: var(--primary-50);
    border-radius: 8px;
    border-left: 4px solid var(--primary-color);
}

.tip-item h4 {
    color: var(--primary-800);
    margin-bottom: 0.5rem;
    font-size: 1rem;
}

.tip-item p {
    color: var(--primary-color);
    margin: 0;
    line-height: 1.5;
    font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 1024px) {

    .table-header,
    .table-row {
        grid-template-columns: 50px 120px 100px 1.5fr 2fr 120px 80px;
        gap: 0.75rem;
        padding: 0.75rem;
    }

    .category-badge-compact {
        font-size: 0.625rem;
        padding: 0.125rem 0.5rem;
    }

    .btn-details {
        font-size: 0.625rem;
        padding: 0.125rem 0.5rem;
    }
}

@media (max-width: 768px) {
    .form-actions {
        flex-direction: column;
    }

    .analysis-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }

    .filter-tabs {
        justify-content: center;
    }

    .main-filters,
    .category-filters {
        justify-content: center;
        flex-wrap: wrap;
    }

    /* Table responsive design */
    .table-header {
        display: none;
    }

    .table-row {
        display: block;
        padding: 1rem;
        margin-bottom: 0.5rem;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        border-left: 3px solid;
        grid-template-columns: none;
    }

    .col-position,
    .col-name,
    .category-badge-compact,
    .description-compact,
    .benefits-compact,
    .concerns-compact,
    .safety-compact {
        margin-bottom: 0.5rem;
        display: block;
    }

    .col-position {
        float: right;
        margin-top: -0.5rem;
        margin-bottom: 0.5rem;
    }

    .col-name {
        margin-right: 80px;
    }

    .expanded-details {
        margin: 0.5rem -1rem -1rem -1rem;
        border-radius: 0 0 8px 8px;
    }

    .ingredient-header {
        flex-direction: column;
        gap: 0.5rem;
    }

    .ingredient-position {
        text-align: left;
    }

    .safety-item {
        flex-direction: column;
        gap: 0.25rem;
    }
}

/* Table transitions */
.expanded-details {
    animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>