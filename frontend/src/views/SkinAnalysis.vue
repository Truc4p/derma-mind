<template>
  <div class="skin-analysis">
    <div class="container">
      <!-- Header -->
      <div class="analysis-header">
        <h1>Skin Analysis Quiz</h1>
        <p>Answer a few questions to discover your skin type and get personalized recommendations</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <span class="progress-text">{{ currentStep }} of {{ totalSteps }}</span>
      </div>

      <!-- Quiz Questions -->
      <div v-if="!showResults" class="quiz-container">
        <div class="question-card card">
          <h3>{{ currentQuestion.title }}</h3>
          <p>{{ currentQuestion.description }}</p>
          
          <div class="options">
            <button 
              v-for="option in currentQuestion.options" 
              :key="option.value"
              @click="selectOption(option.value)"
              :class="['option-btn', { 'selected': responses[currentQuestion.key] === option.value }]"
            >
              <span class="option-icon">{{ option.icon }}</span>
              <div class="option-content">
                <strong>{{ option.label }}</strong>
                <small>{{ option.description }}</small>
              </div>
            </button>
          </div>
          
          <div class="navigation-buttons">
            <button 
              @click="previousQuestion" 
              :disabled="currentStep === 1"
              class="btn btn-outline"
            >
              Previous
            </button>
            <button 
              @click="nextQuestion" 
              :disabled="!responses[currentQuestion.key]"
              class="btn btn-primary"
            >
              {{ currentStep === totalSteps ? 'Get Results' : 'Next' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isAnalyzing" class="analysis-loading">
        <div class="loading-spinner"></div>
        <h3>Analyzing Your Skin...</h3>
        <p>Please wait while we process your responses</p>
      </div>

      <!-- Results -->
      <div v-if="showResults && analysisResults" class="results-container">
        <div class="results-header">
          <h2>Your Skin Analysis Results</h2>
          <div class="skin-type-result">
            <div class="skin-type-badge">{{ analysisResults.skinType }}</div>
            <div class="confidence-score">
              <span>Confidence: {{ analysisResults.skinTypeConfidence }}%</span>
              <div class="score-bar">
                <div class="score-fill" :style="{ width: `${analysisResults.skinTypeConfidence}%` }"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="results-grid grid grid-2">
          <!-- Primary Concerns -->
          <div class="result-card card">
            <h3>Primary Concerns</h3>
            <div class="concerns-list">
              <div 
                v-for="concern in analysisResults.primaryConcerns" 
                :key="concern.concern"
                class="concern-item"
              >
                <span class="concern-name">{{ formatConcern(concern.concern) }}</span>
                <span class="concern-severity" :class="concern.severity">{{ concern.severity }}</span>
              </div>
            </div>
          </div>

          <!-- Overall Score -->
          <div class="result-card card">
            <h3>Skin Health Score</h3>
            <div class="score-display">
              <div class="score-circle">
                <svg viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#e2e8f0" 
                    stroke-width="8"
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#ff6b9d" 
                    stroke-width="8"
                    :stroke-dasharray="`${analysisResults.overallScore * 2.83} 283`"
                    stroke-linecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div class="score-text">
                  <span class="score-number">{{ analysisResults.overallScore }}</span>
                  <span class="score-label">/ 100</span>
                </div>
              </div>
              <p class="score-description">{{ getScoreDescription(analysisResults.overallScore) }}</p>
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        <div class="recommendations">
          <h3>Your Personalized Skincare Routine</h3>
          
          <!-- Morning Routine -->
          <div class="routine-section">
            <h4>☀️ Morning Routine</h4>
            <div class="routine-steps">
              <div 
                v-for="step in analysisResults.recommendations.routine.morning" 
                :key="step.step"
                class="routine-step"
              >
                <div class="step-number">{{ step.step }}</div>
                <div class="step-content">
                  <strong>{{ step.product }}</strong>
                  <p>{{ step.purpose }}</p>
                  <small>{{ step.frequency }}</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Evening Routine -->
          <div class="routine-section">
            <h4>🌙 Evening Routine</h4>
            <div class="routine-steps">
              <div 
                v-for="step in analysisResults.recommendations.routine.evening" 
                :key="step.step"
                class="routine-step"
              >
                <div class="step-number">{{ step.step }}</div>
                <div class="step-content">
                  <strong>{{ step.product }}</strong>
                  <p>{{ step.purpose }}</p>
                  <small>{{ step.frequency }}</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Key Ingredients -->
          <div class="ingredients-section">
            <h4>🧪 Key Ingredients for You</h4>
            <div class="grid grid-2">
              <div class="ingredients-group">
                <h5>✅ Beneficial Ingredients</h5>
                <div class="ingredient-list">
                  <div 
                    v-for="ingredient in analysisResults.recommendations.ingredients.beneficial" 
                    :key="ingredient.name"
                    class="ingredient-item"
                  >
                    <strong>{{ ingredient.name }}</strong>
                    <p>{{ ingredient.purpose }}</p>
                    <small>Recommended: {{ ingredient.concentration }}</small>
                  </div>
                </div>
              </div>
              
              <div class="ingredients-group">
                <h5>❌ Ingredients to Avoid</h5>
                <div class="ingredient-list">
                  <div 
                    v-for="ingredient in analysisResults.recommendations.ingredients.avoid" 
                    :key="ingredient.name"
                    class="ingredient-item avoid"
                  >
                    <strong>{{ ingredient.name }}</strong>
                    <p>{{ ingredient.reason }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Lifestyle Tips -->
          <div class="lifestyle-section">
            <h4>🌟 Lifestyle Recommendations</h4>
            <div class="lifestyle-tips">
              <div 
                v-for="tip in analysisResults.recommendations.lifestyle" 
                :key="tip.category"
                class="lifestyle-tip"
              >
                <h5>{{ tip.category }}</h5>
                <p>{{ tip.recommendation }}</p>
                <small>Impact: {{ tip.impact }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="result-actions">
          <button @click="restartAnalysis" class="btn btn-outline">Take Quiz Again</button>
          <button @click="saveResults" class="btn btn-primary">Save Results</button>
          <router-link to="/routines" class="btn btn-secondary">Explore Routines</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'SkinAnalysis',
  data() {
    return {
      currentStep: 1,
      responses: {},
      isAnalyzing: false,
      showResults: false,
      analysisResults: null,
      questions: [
        {
          key: 'skinFeeling',
          title: 'How does your skin typically feel?',
          description: 'Think about how your skin feels a few hours after cleansing',
          options: [
            { value: 'tight', label: 'Tight & Uncomfortable', description: 'Feels like it needs moisture immediately', icon: '😬' },
            { value: 'comfortable', label: 'Comfortable & Balanced', description: 'Feels just right, not oily or dry', icon: '😌' },
            { value: 'oily', label: 'Oily & Greasy', description: 'Feels slick, especially in T-zone', icon: '😅' },
            { value: 'flaky', label: 'Flaky & Rough', description: 'Has visible flakes or rough patches', icon: '😔' }
          ]
        },
        {
          key: 'skinAppearance',
          title: 'How does your skin look?',
          description: 'Observe your skin in natural light',
          options: [
            { value: 'shiny', label: 'Shiny & Glossy', description: 'Reflects light, especially T-zone', icon: '✨' },
            { value: 'matte', label: 'Matte & Even', description: 'No shine, even texture', icon: '🌸' },
            { value: 'patchy', label: 'Patchy & Uneven', description: 'Some areas oily, others dry', icon: '🗺️' },
            { value: 'dull', label: 'Dull & Lackluster', description: 'Lacks radiance and glow', icon: '😴' }
          ]
        },
        {
          key: 'poreSize',
          title: 'What do your pores look like?',
          description: 'Look closely at your T-zone and cheeks',
          options: [
            { value: 'small', label: 'Small & Barely Visible', description: 'Hard to see without close inspection', icon: '🔍' },
            { value: 'medium', label: 'Medium & Noticeable', description: 'Visible but not prominent', icon: '👀' },
            { value: 'large', label: 'Large & Prominent', description: 'Clearly visible, especially on nose', icon: '🕳️' },
            { value: 'varied', label: 'Varied Sizes', description: 'Different sizes in different areas', icon: '🎭' }
          ]
        },
        {
          key: 'breakoutFrequency',
          title: 'How often do you experience breakouts?',
          description: 'Include blackheads, whiteheads, and pimples',
          options: [
            { value: 'never', label: 'Never', description: 'Rarely or never have breakouts', icon: '🌟' },
            { value: 'rarely', label: 'Rarely', description: 'Maybe once every few months', icon: '😊' },
            { value: 'sometimes', label: 'Sometimes', description: 'Monthly or with hormonal changes', icon: '😐' },
            { value: 'often', label: 'Often', description: 'Weekly or multiple times per month', icon: '😞' },
            { value: 'always', label: 'Constantly', description: 'Always have active breakouts', icon: '😭' }
          ]
        },
        {
          key: 'skinReaction',
          title: 'How does your skin react to new products?',
          description: 'Think about sensitivity and irritation',
          options: [
            { value: 'none', label: 'No Reaction', description: 'Can try most products without issues', icon: '💪' },
            { value: 'mild', label: 'Mild Sensitivity', description: 'Occasional slight irritation', icon: '😇' },
            { value: 'moderate', label: 'Moderate Sensitivity', description: 'Often reacts to fragrances or acids', icon: '😳' },
            { value: 'severe', label: 'Very Sensitive', description: 'Reacts to many ingredients', icon: '🔥' }
          ]
        },
        {
          key: 'ageGroup',
          title: 'What is your age group?',
          description: 'Age affects skin needs and concerns',
          options: [
            { value: 'teens', label: 'Teens (13-19)', description: 'Hormonal changes, acne-prone', icon: '🧒' },
            { value: 'twenties', label: 'Twenties (20-29)', description: 'Prevention focus, occasional breakouts', icon: '✨' },
            { value: 'thirties', label: 'Thirties (30-39)', description: 'Early anti-aging, maintenance', icon: '💫' },
            { value: 'forties', label: 'Forties (40-49)', description: 'Anti-aging focus, hormonal changes', icon: '🌟' },
            { value: 'fifties_plus', label: '50+', description: 'Mature skin, advanced care', icon: '👑' }
          ]
        }
      ]
    }
  },
  computed: {
    totalSteps() {
      return this.questions.length
    },
    progress() {
      return (this.currentStep / this.totalSteps) * 100
    },
    currentQuestion() {
      return this.questions[this.currentStep - 1]
    }
  },
  methods: {
    selectOption(value) {
      this.responses[this.currentQuestion.key] = value
    },
    nextQuestion() {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++
      } else {
        this.analyzeResults()
      }
    },
    previousQuestion() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },
    async analyzeResults() {
      this.isAnalyzing = true
      
      try {
        // Add additional responses for comprehensive analysis
        const analysisData = {
          responses: {
            ...this.responses,
            primaryConcerns: this.inferConcerns(),
            currentProducts: [],
            lifestyle: {
              stressLevel: 'moderate',
              sleepQuality: 'good',
              diet: 'average',
              exercise: 'moderate'
            }
          }
        }
        
        const response = await axios.post('/api/skin-analysis/analyze', analysisData)
        
        this.analysisResults = response.data.results
        this.showResults = true
        
      } catch (error) {
        console.error('Analysis error:', error)
        // Show error message to user
      } finally {
        this.isAnalyzing = false
      }
    },
    inferConcerns() {
      const concerns = []
      
      if (['often', 'always'].includes(this.responses.breakoutFrequency)) {
        concerns.push('acne')
      }
      
      if (['large', 'varied'].includes(this.responses.poreSize)) {
        concerns.push('large_pores')
      }
      
      if (['tight', 'flaky'].includes(this.responses.skinFeeling)) {
        concerns.push('dryness')
      }
      
      if (['moderate', 'severe'].includes(this.responses.skinReaction)) {
        concerns.push('sensitivity')
      }
      
      if (['thirties', 'forties', 'fifties_plus'].includes(this.responses.ageGroup)) {
        concerns.push('aging')
      }
      
      return concerns.length > 0 ? concerns : ['general']
    },
    formatConcern(concern) {
      const formatted = {
        acne: 'Acne & Breakouts',
        aging: 'Signs of Aging',
        dark_spots: 'Dark Spots',
        dryness: 'Dryness',
        sensitivity: 'Sensitivity',
        large_pores: 'Large Pores',
        uneven_tone: 'Uneven Skin Tone'
      }
      return formatted[concern] || concern
    },
    getScoreDescription(score) {
      if (score >= 80) return 'Excellent skin health! Keep up the great work.'
      if (score >= 60) return 'Good skin health with room for improvement.'
      if (score >= 40) return 'Moderate skin health. Focus on consistent care.'
      return 'Your skin needs attention. Follow the recommendations carefully.'
    },
    restartAnalysis() {
      this.currentStep = 1
      this.responses = {}
      this.showResults = false
      this.analysisResults = null
    },
    async saveResults() {
      // Implementation for saving results to user account
      console.log('Saving results...')
    }
  }
}
</script>

<style scoped>
.analysis-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-top: 2rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  margin: 1rem 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transition: width 0.3s ease;
}

.progress-text {
  color: var(--text-light);
  font-size: 0.9rem;
}

.question-card {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.options {
  margin: 2rem 0;
}

.option-btn {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 1rem;
  margin: 0.5rem 0;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.option-btn:hover {
  border-color: var(--primary-color);
  background: var(--background-light);
}

.option-btn.selected {
  border-color: var(--primary-color);
  background: rgba(255, 107, 157, 0.1);
}

.option-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.option-content strong {
  display: block;
  color: var(--text-dark);
  margin-bottom: 0.25rem;
}

.option-content small {
  color: var(--text-light);
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.analysis-loading {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 2rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.results-header {
  text-align: center;
  margin-bottom: 3rem;
}

.skin-type-badge {
  display: inline-block;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border-radius: 50px;
  font-size: 1.5rem;
  font-weight: 600;
  text-transform: capitalize;
  margin-bottom: 1rem;
}

.confidence-score {
  max-width: 300px;
  margin: 0 auto;
}

.score-bar {
  width: 100%;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.score-fill {
  height: 100%;
  background: var(--secondary-color);
  transition: width 0.8s ease;
}

.concerns-list {
  space-y: 1rem;
}

.concern-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--background-light);
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.concern-severity {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
}

.concern-severity.mild {
  background: #fef3c7;
  color: #92400e;
}

.concern-severity.moderate {
  background: #fed7aa;
  color: #c2410c;
}

.concern-severity.severe {
  background: #fecaca;
  color: #dc2626;
}

.score-display {
  text-align: center;
}

.score-circle {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto 1rem;
}

.score-circle svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-dark);
}

.score-label {
  font-size: 1rem;
  color: var(--text-light);
}

.routine-section {
  margin: 2rem 0;
}

.routine-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.routine-step {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  background: var(--background-light);
  border-radius: var(--border-radius);
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
  margin-right: 1rem;
  flex-shrink: 0;
}

.step-content strong {
  display: block;
  color: var(--text-dark);
  margin-bottom: 0.25rem;
}

.step-content p {
  color: var(--text-light);
  margin-bottom: 0.25rem;
}

.step-content small {
  color: var(--secondary-color);
  font-weight: 500;
}

.ingredients-section,
.lifestyle-section {
  margin: 3rem 0;
}

.ingredient-list,
.lifestyle-tips {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ingredient-item,
.lifestyle-tip {
  padding: 1rem;
  background: var(--background-light);
  border-radius: var(--border-radius);
  border-left: 4px solid var(--secondary-color);
}

.ingredient-item.avoid {
  border-left-color: #ef4444;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 3rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .option-btn {
    padding: 0.75rem;
  }
  
  .option-icon {
    font-size: 1.5rem;
    margin-right: 0.75rem;
  }
  
  .navigation-buttons {
    flex-direction: column;
    gap: 1rem;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .result-actions {
    flex-direction: column;
  }
}
</style>