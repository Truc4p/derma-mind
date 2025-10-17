<template>
    <div class="ai-dermatologist">
        <!-- Chat Container -->
        <div class="chat-container" ref="chatContainer">
            <!-- Welcome Message -->
            <div v-if="messages.length === 0" class="welcome-section">
                <div class="welcome-card">
                    <div class="welcome-header">
                        <h1>AI Dermatologist</h1>
                        <p class="subtitle">Board-Certified Virtual Dermatologist</p>
                        <p class="description">Ask me anything about skincare, cosmetics, and facial improvements</p>
                    </div>
                    <h2>👋 Welcome to Your AI Dermatologist</h2>
                    <p>I'm here to help you with all your skincare concerns. I can assist with:</p>
                    <div class="capabilities-grid">
                        <div class="capability-item">
                            <span class="capability-icon">💆</span>
                            <span>Skincare routines</span>
                        </div>
                        <div class="capability-item">
                            <span class="capability-icon">💄</span>
                            <span>Cosmetic advice</span>
                        </div>
                        <div class="capability-item">
                            <span class="capability-icon">🧴</span>
                            <span>Product recommendations</span>
                        </div>
                        <div class="capability-item">
                            <span class="capability-icon">✨</span>
                            <span>Face improvement tips</span>
                        </div>
                        <div class="capability-item">
                            <span class="capability-icon">🔬</span>
                            <span>Ingredient analysis</span>
                        </div>
                        <div class="capability-item">
                            <span class="capability-icon">🌟</span>
                            <span>Skin concerns</span>
                        </div>
                    </div>
                    <div class="sample-questions">
                        <p class="sample-title">Try asking:</p>
                        <button v-for="question in sampleQuestions" :key="question" 
                                @click="askSampleQuestion(question)"
                                class="sample-question-btn">
                            {{ question }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Chat Messages -->
            <div class="messages-list">
                <div v-for="(message, index) in messages" :key="index" 
                     class="message" :class="message.role">
                    <div class="message-content">
                        <div class="message-text" v-html="formatMessage(message.content)"></div>
                        <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                    </div>
                </div>

                <!-- Loading indicator -->
                <div v-if="isLoading" class="message assistant">
                    <div class="message-content">
                        <div class="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Input Area -->
        <div class="chat-input-container">
            <!-- Chat Action Buttons -->
            <div v-if="messages.length > 0" class="chat-actions">
                <button @click="startNewChat" class="action-button new-chat-btn">
                    New Chat
                </button>
                <button @click="clearChat" class="action-button clear-chat-btn">
                    Clear Chat
                </button>
            </div>
            
            <div class="input-wrapper">
                <textarea v-model="userInput" 
                          @keydown.enter.prevent="handleEnter"
                          placeholder="Ask me about skincare, cosmetics, or facial improvements..."
                          class="chat-input"
                          rows="1"
                          ref="textInput"></textarea>
                <button @click="sendMessage" 
                        :disabled="!userInput.trim() || isLoading"
                        class="send-button">
                    <span v-if="!isLoading">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 21l21-9L2 3v7l15 2l-15 2z" fill="white"/>
                        </svg>
                    </span>
                    <span v-else class="loading-spinner"></span>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import api from '@/services/api'

export default {
    name: 'AIDermatologist',
    data() {
        return {
            userInput: '',
            messages: [],
            isLoading: false,
            sampleQuestions: [
                "What's a good routine for oily skin?",
                "How do I reduce wrinkles naturally?",
                "What ingredients should I avoid for sensitive skin?",
                "Can you recommend products for acne-prone skin?",
                "How often should I exfoliate?"
            ]
        }
    },

    mounted() {
        this.loadChatHistory()
        this.adjustTextareaHeight()
    },

    watch: {
        messages: {
            handler() {
                this.saveChatHistory()
                this.$nextTick(() => {
                    this.scrollToBottom()
                })
            },
            deep: true
        },
        userInput() {
            this.adjustTextareaHeight()
        }
    },

    methods: {
        adjustTextareaHeight() {
            this.$nextTick(() => {
                const textarea = this.$refs.textInput
                if (textarea) {
                    textarea.style.height = 'auto'
                    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px'
                }
            })
        },

        handleEnter(event) {
            if (!event.shiftKey) {
                this.sendMessage()
            }
        },

        async sendMessage() {
            if (!this.userInput.trim() || this.isLoading) return

            const userMessage = {
                role: 'user',
                content: this.userInput.trim(),
                timestamp: new Date()
            }

            this.messages.push(userMessage)
            this.userInput = ''

            this.isLoading = true

            try {
                // Simulate AI response (replace with actual API call)
                await this.getAIResponse(userMessage.content)
            } catch (error) {
                console.error('Error getting AI response:', error)
                this.messages.push({
                    role: 'assistant',
                    content: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
                    timestamp: new Date()
                })
            } finally {
                this.isLoading = false
            }
        },

        async getAIResponse(userMessage) {
            try {
                // Call the real Gemini AI API
                const response = await api.post('/ai-dermatologist/chat', {
                    message: userMessage,
                    conversationHistory: this.messages.slice(-10) // Send last 10 messages for context
                })

                this.messages.push({
                    role: 'assistant',
                    content: response.data.response,
                    sources: response.data.sources,
                    timestamp: new Date()
                })
            } catch (error) {
                console.error('Error calling AI API:', error)
                
                // Fallback to local response if API fails
                let response = this.generateContextualResponse(userMessage)
                this.messages.push({
                    role: 'assistant',
                    content: response + '\n\n*Note: Using offline knowledge base. For best results, ensure backend is running.*',
                    timestamp: new Date()
                })
            }
        },

        generateContextualResponse(message) {
            const lowerMessage = message.toLowerCase()

            // Skincare routine responses
            if (lowerMessage.includes('routine') && lowerMessage.includes('oily')) {
                return `For oily skin, I recommend a balanced routine:

**Morning:**
1. Gentle foaming cleanser
2. Toner with salicylic acid or niacinamide
3. Lightweight, oil-free moisturizer
4. Broad-spectrum SPF 30+

**Evening:**
1. Oil-based cleanser (double cleanse)
2. Gentle foaming cleanser
3. Treatment (like BHA or retinol)
4. Lightweight moisturizer

**Key ingredients to look for:**
- Niacinamide (reduces oil production)
- Salicylic acid (unclogs pores)
- Hyaluronic acid (hydration without oil)

Would you like product recommendations or have questions about specific products?`
            }

            if (lowerMessage.includes('wrinkle') || lowerMessage.includes('anti-aging')) {
                return `To reduce wrinkles naturally and effectively:

**Top Recommendations:**
1. **Retinol/Retinoids** - The gold standard for anti-aging
2. **Vitamin C** - Antioxidant protection and collagen production
3. **Peptides** - Support skin structure and firmness
4. **Sunscreen** - Daily SPF 30+ is crucial!

**Natural approaches:**
- Stay hydrated (drink water)
- Get adequate sleep (7-9 hours)
- Facial massage to improve circulation
- Antioxidant-rich diet
- Avoid smoking and excess alcohol

**Gentle exfoliation** with AHAs (glycolic, lactic acid) can also help improve skin texture.

Start slowly with active ingredients and build tolerance. Would you like specific product recommendations?`
            }

            if (lowerMessage.includes('sensitive skin') || lowerMessage.includes('avoid')) {
                return `For sensitive skin, **avoid these common irritants:**

**❌ Ingredients to avoid:**
- Fragrance (parfum)
- Denatured alcohol
- Essential oils
- Harsh sulfates (SLS)
- High-concentration acids
- Physical exfoliants

**✅ Look for instead:**
- Ceramides
- Centella Asiatica
- Colloidal oatmeal
- Hyaluronic acid
- Niacinamide (low %)
- Squalane

**Tips:**
- Patch test new products
- Introduce one product at a time
- Choose fragrance-free formulas
- Use lukewarm water (not hot)

What specific concerns do you have with your sensitive skin?`
            }

            if (lowerMessage.includes('acne') || lowerMessage.includes('breakout')) {
                return `For acne-prone skin, here's my recommendation:

**Key Ingredients:**
1. **Salicylic Acid (BHA)** - Unclogs pores, 2% is ideal
2. **Benzoyl Peroxide** - Kills acne bacteria
3. **Niacinamide** - Reduces inflammation and oil
4. **Retinoids** - Prevents clogged pores

**Product Types:**
- Gentle, non-comedogenic cleanser
- BHA toner or treatment
- Lightweight, oil-free moisturizer
- Spot treatment for active breakouts
- Always use SPF!

**Important tips:**
- Don't over-dry your skin
- Be patient (6-8 weeks for results)
- Avoid touching your face
- Change pillowcases regularly
- Consider seeing a dermatologist for severe acne

Would you like specific product recommendations or have questions about acne scarring?`
            }

            if (lowerMessage.includes('exfoliate') || lowerMessage.includes('exfoliation')) {
                return `**Exfoliation Guidelines:**

**How often:**
- **Normal skin:** 2-3 times per week
- **Oily/resilient skin:** 3-4 times per week
- **Dry/sensitive skin:** 1-2 times per week
- **Mature skin:** 2-3 times per week (gentle)

**Types of exfoliation:**

**Chemical (preferred):**
- AHAs (glycolic, lactic) - for surface/dry skin
- BHAs (salicylic) - for oily/acne-prone skin
- PHAs - gentlest option for sensitive skin

**Physical:**
- Use very gentle options
- Avoid harsh scrubs with large particles

**Important rules:**
- Don't combine with retinoids on same night
- Always follow with moisturizer
- Use SPF during the day
- Less is more - don't over-exfoliate!

**Signs of over-exfoliation:**
- Redness, irritation
- Increased sensitivity
- Tight, dry feeling

What's your skin type? I can give you more specific recommendations!`
            }

            // Generic response for other questions
            return `Thank you for your question! As a virtual dermatologist, I'm here to help with skincare, cosmetic, and facial improvement advice.

To provide you with the most accurate and personalized recommendation, could you tell me more about:

- Your skin type (oily, dry, combination, sensitive)?
- Your main skin concerns?
- Any products you're currently using?
- Any allergies or sensitivities?

This will help me give you better tailored advice. You can also ask me about:
- Specific ingredients
- Product recommendations
- Skincare routines
- Treatment options
- Facial improvement techniques

What would you like to know more about?`
        },

        askSampleQuestion(question) {
            this.userInput = question
            this.sendMessage()
        },

        formatMessage(content) {
            // Convert markdown-like formatting to HTML
            return content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br>')
                .replace(/^/, '<p>')
                .replace(/$/, '</p>')
        },

        formatTime(timestamp) {
            const date = new Date(timestamp)
            return date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            })
        },

        scrollToBottom() {
            const container = this.$refs.chatContainer
            if (container) {
                container.scrollTop = container.scrollHeight
            }
        },

        saveChatHistory() {
            try {
                localStorage.setItem('aiDermatologistChat', JSON.stringify(this.messages))
            } catch (error) {
                console.warn('Failed to save chat history:', error)
            }
        },

        loadChatHistory() {
            try {
                const savedChat = localStorage.getItem('aiDermatologistChat')
                if (savedChat) {
                    this.messages = JSON.parse(savedChat)
                }
            } catch (error) {
                console.warn('Failed to load chat history:', error)
            }
        },

        startNewChat() {
            if (confirm('Start a new chat? Current conversation will be saved.')) {
                this.messages = []
                this.userInput = ''
                localStorage.removeItem('aiDermatologistChat')
            }
        },

        clearChat() {
            if (confirm('Clear all chat history? This cannot be undone.')) {
                this.messages = []
                this.userInput = ''
                localStorage.removeItem('aiDermatologistChat')
            }
        }
    }
}
</script>

<style scoped>
.ai-dermatologist {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--primary-50);
}

/* Chat Container */
.chat-container {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
}

/* Welcome Section */
.welcome-section {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100%;
}

.welcome-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    max-width: 700px;
}

.welcome-header {
    text-align: center;
    padding: 1.5rem;
    background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
    border-radius: 12px;
    margin-bottom: 1.5rem;
    border: 2px solid var(--primary-200);
}

.welcome-header h1 {
    color: var(--primary-800);
    font-size: 2rem;
    margin: 0 0 0.5rem 0;
    font-weight: 700;
}

.welcome-header .subtitle {
    color: var(--primary-600);
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
}

.welcome-header .description {
    color: var(--primary-color);
    margin: 0;
    font-size: 0.875rem;
}

.welcome-card h2 {
    color: var(--primary-800);
    margin-bottom: 1rem;
}

.welcome-card > p {
    color: var(--primary-color);
    margin-bottom: 1.5rem;
}

.capabilities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.capability-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--primary-50);
    border-radius: 8px;
    color: var(--primary-700);
    font-weight: 500;
}

.capability-icon {
    font-size: 1.5rem;
}

.sample-questions {
    border-top: 1px solid var(--primary-200);
    padding-top: 1.5rem;
}

.sample-title {
    color: var(--primary-700);
    font-weight: 600;
    margin-bottom: 0.75rem;
}

.sample-question-btn {
    display: block;
    width: 100%;
    text-align: left;
    padding: 0.75rem 1rem;
    margin-bottom: 0.5rem;
    background: var(--primary-50);
    border: 1px solid var(--primary-200);
    border-radius: 8px;
    color: var(--primary-700);
    cursor: pointer;
    transition: all 0.2s;
}

.sample-question-btn:hover {
    background: var(--primary-100);
    border-color: var(--primary-300);
    transform: translateX(4px);
}

/* Messages */
.messages-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.message {
    display: flex;
    gap: 1rem;
    animation: fadeIn 0.3s ease-in;
}

.message.user {
    flex-direction: row-reverse;
}

.message-content {
    max-width: 70%;
    background: white;
    padding: 1rem 1.25rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}


.message.user .message-content {
    background: var(--primary-500);
    color: white;
}
.message.user .message-content,
.message.user .message-content * {
    color: white !important;
}

.message-text {
    line-height: 1.6;
    word-wrap: break-word;
}

.message-text :deep(p) {
    margin: 0 0 0.75rem 0;
}

.message-text :deep(p:last-child) {
    margin-bottom: 0;
}

.message-text :deep(strong) {
    font-weight: 600;
    color: var(--primary-800);
}

.message.user .message-text :deep(strong) {
    color: white;
}

.message-time {
    font-size: 0.75rem;
    color: #9ca3af;
    margin-top: 0.5rem;
}

.message.user .message-time {
    color: rgba(255, 255, 255, 0.8);
    text-align: right;
}

/* Typing Indicator */
.typing-indicator {
    display: flex;
    gap: 0.25rem;
    padding: 0.5rem 0;
}

.typing-indicator span {
    width: 8px;
    height: 8px;
    background: var(--primary-400);
    border-radius: 50%;
    animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typing {
    0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.7;
    }
    30% {
        transform: translateY(-10px);
        opacity: 1;
    }
}

/* Input Area */
.chat-input-container {
    padding: 1rem 2rem;
}

/* Chat Action Buttons */
.chat-actions {
    max-width: 1200px;
    margin: 0 auto 0.75rem;
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
}

.action-button {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    border: none;
}

.new-chat-btn {
    background: var(--primary-100);
    color: var(--primary-600);
}

.new-chat-btn:hover {
    background: white;
}

.clear-chat-btn {
    background: white;
    color: #ef4444;
}

.clear-chat-btn:hover {
    background: #fef2f2;
}

.input-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    gap: 1rem;
    align-items: flex-end;
}

.chat-input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 2px solid var(--primary-200);
    border-radius: 12px;
    font-size: 1rem;
    font-family: inherit;
    resize: none;
    min-height: 50px;
    max-height: 150px;
    transition: border-color 0.2s;
}

.chat-input:focus {
    outline: none;
    border-color: var(--primary-color);
}

.send-button {
    padding: 0.75rem 0.2rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 30px;
    font-size: 1.25rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 50px;
}

.send-button:hover:not(:disabled) {
    background: var(--primary-600);
    transform: translateY(-2px);
}

.send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Responsive */
@media (max-width: 768px) {
    .chat-container {
        padding: 1rem;
    }

    .welcome-header h1 {
        font-size: 1.5rem;
    }

    .welcome-header .subtitle {
        font-size: 0.875rem;
    }

    .message-content {
        max-width: 85%;
    }

    .capabilities-grid {
        grid-template-columns: 1fr;
    }

    .chat-input-container {
        padding: 1rem;
    }

    .chat-actions {
        flex-direction: column;
        gap: 0.5rem;
    }

    .action-button {
        width: 100%;
        justify-content: center;
    }

    .input-wrapper {
        gap: 0.5rem;
    }

    .send-button {
        min-width: 40px;
        padding: 0.75rem 1rem;
    }
}
</style>
