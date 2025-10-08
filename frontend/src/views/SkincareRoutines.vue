<template>
  <div class="skincare-routines">
    <div class="container">
      <!-- Header -->
      <div class="routines-header">
        <h1>Skincare Routines</h1>
        <p>Discover personalized skincare routines tailored to your skin type and concerns</p>
      </div>

      <!-- Routine Quiz/Customizer -->
      <section class="customizer-section">
        <div class="customizer-card card">
          <h2>Get Your Custom Routine</h2>
          <p>Answer a few questions to get a personalized skincare routine</p>
          
          <div class="customizer-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Your Skin Type</label>
                <select v-model="preferences.skinType" class="form-select">
                  <option value="">Select your skin type</option>
                  <option value="oily">Oily</option>
                  <option value="dry">Dry</option>
                  <option value="combination">Combination</option>
                  <option value="sensitive">Sensitive</option>
                  <option value="normal">Normal</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Age Group</label>
                <select v-model="preferences.age" class="form-select">
                  <option value="">Select age group</option>
                  <option value="teens">Teens (13-19)</option>
                  <option value="twenties">Twenties (20-29)</option>
                  <option value="thirties">Thirties (30-39)</option>
                  <option value="forties">Forties (40-49)</option>
                  <option value="fifties_plus">50+</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Primary Concerns (select all that apply)</label>
              <div class="checkbox-group">
                <label v-for="concern in availableConcerns" :key="concern.value" class="checkbox-label">
                  <input 
                    type="checkbox" 
                    :value="concern.value" 
                    v-model="preferences.concerns"
                  />
                  <span>{{ concern.label }}</span>
                </label>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Experience Level</label>
                <select v-model="preferences.experience" class="form-select">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Budget Range</label>
                <select v-model="preferences.budget" class="form-select">
                  <option value="budget">Budget ($50-150)</option>
                  <option value="moderate">Moderate ($150-400)</option>
                  <option value="premium">Premium ($400+)</option>
                </select>
              </div>
            </div>
            
            <button 
              @click="getCustomRoutine" 
              :disabled="!preferences.skinType || isLoading"
              class="btn btn-primary"
            >
              {{ isLoading ? 'Creating Routine...' : 'Get My Custom Routine' }}
            </button>
          </div>
        </div>
      </section>

      <!-- Custom Routine Results -->
      <section v-if="customRoutine" class="custom-routine-section">
        <div class="routine-results">
          <h2>Your Personalized Routine</h2>
          <div class="routine-overview">
            <div class="overview-stats">
              <div class="stat-item">
                <span class="stat-number">{{ customRoutine.estimatedTime.morning }}</span>
                <span class="stat-label">Minutes (Morning)</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ customRoutine.estimatedTime.evening }}</span>
                <span class="stat-label">Minutes (Evening)</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">${{ customRoutine.estimatedCost.min }}-${{ customRoutine.estimatedCost.max }}</span>
                <span class="stat-label">Estimated Cost</span>
              </div>
            </div>
          </div>

          <!-- Morning Routine -->
          <div class="routine-time-section">
            <h3>☀️ Morning Routine</h3>
            <div class="routine-steps">
              <div 
                v-for="step in customRoutine.customRoutine.morning" 
                :key="step.step"
                class="routine-step card"
              >
                <div class="step-number">{{ step.step }}</div>
                <div class="step-content">
                  <h4>{{ step.product }}</h4>
                  <p>{{ step.purpose }}</p>
                  <div class="step-details">
                    <span class="frequency">{{ step.frequency }}</span>
                    <span v-if="step.time" class="time">{{ step.time }}</span>
                  </div>
                  <div v-if="step.ingredients" class="ingredients">
                    <strong>Key ingredients: </strong>
                    <span v-for="ingredient in step.ingredients" :key="ingredient" class="ingredient-tag">
                      {{ ingredient }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Evening Routine -->
          <div class="routine-time-section">
            <h3>🌙 Evening Routine</h3>
            <div class="routine-steps">
              <div 
                v-for="step in customRoutine.customRoutine.evening" 
                :key="step.step"
                class="routine-step card"
              >
                <div class="step-number">{{ step.step }}</div>
                <div class="step-content">
                  <h4>{{ step.product }}</h4>
                  <p>{{ step.purpose }}</p>
                  <div class="step-details">
                    <span class="frequency">{{ step.frequency }}</span>
                    <span v-if="step.time" class="time">{{ step.time }}</span>
                  </div>
                  <div v-if="step.ingredients" class="ingredients">
                    <strong>Key ingredients: </strong>
                    <span v-for="ingredient in step.ingredients" :key="ingredient" class="ingredient-tag">
                      {{ ingredient }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Weekly Treatments -->
          <div v-if="customRoutine.customRoutine.weekly" class="routine-time-section">
            <h3>📅 Weekly Treatments</h3>
            <div class="weekly-treatments">
              <div 
                v-for="treatment in customRoutine.customRoutine.weekly" 
                :key="treatment.product"
                class="treatment-item card"
              >
                <h4>{{ treatment.product }}</h4>
                <p>{{ treatment.purpose }}</p>
                <span class="frequency">{{ treatment.frequency }}</span>
              </div>
            </div>
          </div>

          <!-- Insights -->
          <div v-if="customRoutine.insights" class="insights-section">
            <h3>💡 Routine Insights</h3>
            <div class="insights-grid grid grid-2">
              <div class="insight-card card">
                <h4>Key Benefits</h4>
                <ul>
                  <li v-for="benefit in customRoutine.insights.keyBenefits" :key="benefit">
                    {{ benefit }}
                  </li>
                </ul>
              </div>
              <div class="insight-card card">
                <h4>Pro Tips</h4>
                <ul>
                  <li v-for="tip in customRoutine.insights.tips" :key="tip">
                    {{ tip }}
                  </li>
                </ul>
              </div>
            </div>
            <div class="expected-results">
              <h4>Expected Results</h4>
              <p>{{ customRoutine.insights.expectedResults }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Pre-built Routine Templates -->
      <section class="templates-section">
        <h2>Routine Templates by Skin Type</h2>
        <div class="templates-grid grid grid-2">
          <div 
            v-for="template in routineTemplates" 
            :key="template.skinType"
            class="template-card card"
          >
            <div class="template-header">
              <h3>{{ formatSkinType(template.skinType) }} Skin</h3>
              <p>{{ template.description }}</p>
            </div>
            <div class="template-stats">
              <div class="stat">
                <span class="stat-number">{{ template.stepCount.morning }}</span>
                <span class="stat-label">Morning Steps</span>
              </div>
              <div class="stat">
                <span class="stat-number">{{ template.stepCount.evening }}</span>
                <span class="stat-label">Evening Steps</span>
              </div>
              <div class="stat">
                <span class="stat-number">{{ template.time.morning }}</span>
                <span class="stat-label">Minutes (AM)</span>
              </div>
              <div class="stat">
                <span class="stat-number">{{ template.time.evening }}</span>
                <span class="stat-label">Minutes (PM)</span>
              </div>
            </div>
            <button 
              @click="viewTemplate(template.skinType)" 
              class="btn btn-outline"
            >
              View Routine
            </button>
          </div>
        </div>
      </section>

      <!-- Tips Section -->
      <section class="tips-section">
        <h2>Skincare Routine Tips</h2>
        <div class="tips-grid grid grid-3">
          <div class="tip-card card">
            <div class="tip-icon">🌅</div>
            <h4>Morning Routine</h4>
            <p>Focus on protection and hydration. Always end with sunscreen for UV protection.</p>
          </div>
          <div class="tip-card card">
            <div class="tip-icon">🌙</div>
            <h4>Evening Routine</h4>
            <p>Time for treatment and repair. Use active ingredients and richer moisturizers.</p>
          </div>
          <div class="tip-card card">
            <div class="tip-icon">⏰</div>
            <h4>Consistency</h4>
            <p>Stick to your routine for at least 4-6 weeks to see visible improvements.</p>
          </div>
          <div class="tip-card card">
            <div class="tip-icon">🧪</div>
            <h4>Patch Testing</h4>
            <p>Always patch test new products on a small skin area before full application.</p>
          </div>
          <div class="tip-card card">
            <div class="tip-icon">📊</div>
            <h4>Start Slowly</h4>
            <p>Introduce new active ingredients gradually to avoid irritation.</p>
          </div>
          <div class="tip-card card">
            <div class="tip-icon">💧</div>
            <h4>Hydration</h4>
            <p>Even oily skin needs moisturizer. Choose the right formula for your skin type.</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { routinesService, utils } from '../services/api'

export default {
  name: 'SkincareRoutines',
  data() {
    return {
      preferences: {
        skinType: '',
        concerns: [],
        age: '',
        experience: 'beginner',
        budget: 'moderate'
      },
      customRoutine: null,
      routineTemplates: [],
      isLoading: false,
      availableConcerns: [
        { value: 'acne', label: 'Acne & Breakouts' },
        { value: 'aging', label: 'Signs of Aging' },
        { value: 'dark_spots', label: 'Dark Spots' },
        { value: 'dryness', label: 'Dryness' },
        { value: 'sensitivity', label: 'Sensitivity' },
        { value: 'large_pores', label: 'Large Pores' },
        { value: 'uneven_tone', label: 'Uneven Skin Tone' }
      ]
    }
  },
  mounted() {
    this.loadRoutineTemplates()
  },
  methods: {
    async loadRoutineTemplates() {
      try {
        const response = await routinesService.getRoutines()
        this.routineTemplates = response.availableRoutines || []
      } catch (error) {
        console.error('Error loading routine templates:', error)
      }
    },
    
    async getCustomRoutine() {
      if (!this.preferences.skinType) return
      
      this.isLoading = true
      
      try {
        const response = await routinesService.customizeRoutine(this.preferences)
        this.customRoutine = response
        
        // Scroll to results
        this.$nextTick(() => {
          const resultsSection = document.querySelector('.custom-routine-section')
          if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth' })
          }
        })
        
      } catch (error) {
        console.error('Error getting custom routine:', error)
      } finally {
        this.isLoading = false
      }
    },
    
    async viewTemplate(skinType) {
      try {
        const response = await routinesService.getRoutines({ skinType })
        this.customRoutine = {
          customRoutine: response.routine,
          estimatedTime: response.estimatedTime,
          estimatedCost: { min: 100, max: 300 }, // Mock data
          insights: {
            keyBenefits: ['Improved skin texture', 'Enhanced hydration', 'Better protection'],
            tips: ['Be consistent with your routine', 'Always use sunscreen', 'Patch test new products'],
            expectedResults: 'Visible improvements in 4-6 weeks with consistent use'
          }
        }
        
        // Scroll to results
        this.$nextTick(() => {
          const resultsSection = document.querySelector('.custom-routine-section')
          if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth' })
          }
        })
        
      } catch (error) {
        console.error('Error loading template:', error)
      }
    },
    
    formatSkinType: utils.formatSkinType
  }
}
</script>

<style scoped>
.routines-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-top: 2rem;
}

.customizer-section {
  margin-bottom: 4rem;
}

.customizer-card {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.customizer-form {
  margin-top: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
}

.routine-overview {
  margin-bottom: 2rem;
}

.overview-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
}

.stat-label {
  color: var(--text-light);
  font-size: 0.875rem;
}

.routine-time-section {
  margin-bottom: 3rem;
}

.routine-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.routine-step {
  display: flex;
  align-items: flex-start;
  padding: 1.5rem;
}

.step-number {
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 1.5rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  margin-bottom: 0.5rem;
  color: var(--text-dark);
}

.step-content p {
  color: var(--text-light);
  margin-bottom: 0.75rem;
}

.step-details {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.frequency,
.time {
  padding: 0.25rem 0.75rem;
  background: var(--background-light);
  border-radius: 20px;
  font-size: 0.8rem;
  color: var(--text-dark);
}

.ingredients {
  margin-top: 0.75rem;
}

.ingredient-tag {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  background: var(--secondary-color);
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  margin: 0.2rem 0.3rem 0.2rem 0;
}

.weekly-treatments {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.treatment-item {
  padding: 1.5rem;
}

.insights-section {
  margin-top: 3rem;
}

.insights-grid {
  margin-bottom: 2rem;
}

.insight-card {
  padding: 1.5rem;
}

.insight-card ul {
  list-style: none;
  padding: 0;
}

.insight-card li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.insight-card li:last-child {
  border-bottom: none;
}

.expected-results {
  padding: 1.5rem;
  background: var(--background-light);
  border-radius: var(--border-radius);
  text-align: center;
}

.templates-section {
  margin: 4rem 0;
}

.template-card {
  padding: 2rem;
  text-align: center;
}

.template-header {
  margin-bottom: 1.5rem;
}

.template-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat {
  text-align: center;
}

.stat .stat-number {
  display: block;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--secondary-color);
}

.stat .stat-label {
  color: var(--text-light);
  font-size: 0.8rem;
}

.tips-section {
  margin: 4rem 0;
}

.tip-card {
  text-align: center;
  padding: 2rem;
}

.tip-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.tip-card h4 {
  margin-bottom: 1rem;
  color: var(--text-dark);
}

.tip-card p {
  color: var(--text-light);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .checkbox-group {
    grid-template-columns: 1fr;
  }
  
  .overview-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .routine-step {
    flex-direction: column;
    text-align: center;
  }
  
  .step-number {
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .step-details {
    justify-content: center;
  }
  
  .templates-grid,
  .tips-grid {
    grid-template-columns: 1fr;
  }
  
  .template-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
}
</style>