<template>
    <div class="ai-dermatologist">
        <!-- History Sidebar -->
        <div class="history-sidebar" :class="{ 'open': sidebarOpen }">
            <div class="sidebar-header">
                <h3>Chat History</h3>
                <button @click="toggleSidebar" class="close-sidebar-btn">✕</button>
            </div>
            
            <!-- Search Input -->
            <div class="sidebar-search">
                <input 
                    v-model="searchQuery" 
                    type="text" 
                    placeholder="Search conversations..."
                    class="search-input"
                />
                <span v-if="searchQuery" @click="searchQuery = ''" class="clear-search">✕</span>
            </div>
            
            <div class="sidebar-content">
                <div v-if="filteredChatSessions.length === 0 && !searchQuery" class="no-history">
                    <p>No chat history yet</p>
                </div>
                <div v-else-if="filteredChatSessions.length === 0 && searchQuery" class="no-history">
                    <p>No results found for "{{ searchQuery }}"</p>
                </div>
                <div v-else class="chat-sessions-list">
                    <div v-for="session in filteredChatSessions" 
                         :key="session.id"
                         @click="loadChatSession(session.id)"
                         class="chat-session-item"
                         :class="{ 'active': session.id === currentSessionId }">
                        <div class="session-info">
                            <div class="session-title">{{ session.title }}</div>
                            <div class="session-date">{{ formatSessionDate(session.timestamp) }}</div>
                            <div class="session-preview">{{ session.preview }}</div>
                        </div>
                        <button @click.stop="deleteChatSession(session.id)" 
                                class="delete-session-btn"
                                title="Delete this conversation">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Overlay for mobile -->
        <div v-if="sidebarOpen" @click="toggleSidebar" class="sidebar-overlay"></div>

        <!-- Chat Container -->
        <div class="chat-container" ref="chatContainer">
            <!-- Welcome Message -->
            <div v-if="messages.length === 0" class="welcome-section">
                <div class="welcome-card">
                    <div class="welcome-header">
                        <h1>AI Dermatologist</h1>
                    </div>
                    <p>I'm here to help you with all your skincare concerns. I can assist with:</p>
                    <div class="capabilities-grid">
                        <div class="capability-item">
                            <span>Skincare routines</span>
                        </div>
                        <div class="capability-item">
                            <span>Cosmetic advice</span>
                        </div>
                        <div class="capability-item">
                            <span>Product recommendations</span>
                        </div>
                        <div class="capability-item">
                            <span>Face improvement tips</span>
                        </div>
                        <div class="capability-item">
                            <span>Ingredient analysis</span>
                        </div>
                        <div class="capability-item">
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
                        <div v-if="message.image" class="message-image">
                            <img :src="message.image" alt="Uploaded skin image" />
                        </div>
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
            <!-- Hidden file input -->
            <input 
                type="file" 
                ref="imageInput" 
                @change="handleImageSelect" 
                accept="image/*" 
                style="display: none"
            />
            
            <!-- Chat Action Buttons -->
            <div v-if="messages.length > 0" class="chat-actions">
                <button @click="toggleSidebar" class="action-button history-btn">
                    History
                </button>
                <button @click="startNewChat" class="action-button new-chat-btn">
                    New Chat
                </button>
                <button @click="clearChat" class="action-button clear-chat-btn">
                    Clear Chat
                </button>
            </div>
            
            <!-- Image Preview -->
            <div v-if="imagePreviewUrl" class="image-preview-container">
                <div class="image-preview">
                    <img :src="imagePreviewUrl" alt="Selected image" />
                    <button @click="removeImage" class="remove-image-btn">✕</button>
                </div>
            </div>
            
            <div class="input-wrapper">
                <button @click="triggerImageUpload" class="image-upload-btn" title="Upload skin image">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <textarea v-model="userInput" 
                          @keydown.enter.prevent="handleEnter"
                          placeholder="Ask me about skincare, cosmetics, or upload a skin image for analysis..."
                          class="chat-input"
                          rows="1"
                          ref="textInput"></textarea>
                <button @click="sendMessage" 
                        :disabled="(!userInput.trim() && !selectedImage) || isLoading"
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
import { marked } from 'marked'

// Configure marked for better rendering
marked.setOptions({
    breaks: true,
    gfm: true, // GitHub Flavored Markdown
    headerIds: false,
    mangle: false
})

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
            ],
            // Chat history management
            currentSessionId: null,
            chatSessions: [],
            sidebarOpen: false,
            searchQuery: '',
            // Image upload
            selectedImage: null,
            imagePreviewUrl: null
        }
    },

    computed: {
        sortedChatSessions() {
            return [...this.chatSessions].sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            )
        },
        
        filteredChatSessions() {
            if (!this.searchQuery.trim()) {
                return this.sortedChatSessions
            }
            
            const query = this.searchQuery.toLowerCase().trim()
            return this.sortedChatSessions.filter(session => {
                // Search in title
                if (session.title.toLowerCase().includes(query)) {
                    return true
                }
                
                // Search in preview
                if (session.preview.toLowerCase().includes(query)) {
                    return true
                }
                
                // Search in messages
                if (session.messages && session.messages.some(msg => 
                    msg.content.toLowerCase().includes(query)
                )) {
                    return true
                }
                
                return false
            })
        }
    },

    mounted() {
        this.loadAllSessions()
        this.loadCurrentSession()
        this.adjustTextareaHeight()
    },

    beforeUnmount() {
        // Clean up any blob URLs when component is destroyed
        this.cleanupBlobUrls()
        if (this.imagePreviewUrl) {
            URL.revokeObjectURL(this.imagePreviewUrl)
        }
    },

    watch: {
        messages: {
            handler() {
                this.saveCurrentSession()
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

        handleImageSelect(event) {
            const file = event.target.files[0]
            if (file && file.type.startsWith('image/')) {
                this.selectedImage = file
                this.imagePreviewUrl = URL.createObjectURL(file)
            }
        },

        removeImage() {
            this.selectedImage = null
            if (this.imagePreviewUrl) {
                URL.revokeObjectURL(this.imagePreviewUrl)
                this.imagePreviewUrl = null
            }
            // Reset file input
            const fileInput = this.$refs.imageInput
            if (fileInput) {
                fileInput.value = ''
            }
        },

        triggerImageUpload() {
            this.$refs.imageInput.click()
        },

        handleEnter(event) {
            if (!event.shiftKey) {
                this.sendMessage()
            }
        },

        async sendMessage() {
            if ((!this.userInput.trim() && !this.selectedImage) || this.isLoading) return

            // Keep a copy of the image preview URL for the message
            const imagePreview = this.imagePreviewUrl
            
            const userMessage = {
                role: 'user',
                content: this.userInput.trim() || 'Please analyze this skin image',
                timestamp: new Date(),
                image: imagePreview // Store preview URL for display
            }

            console.log('📤 Sending user message:', userMessage.content)
            this.messages.push(userMessage)
            
            const messageToSend = this.userInput.trim() || 'Please analyze this skin image'
            const imageToSend = this.selectedImage
            
            this.userInput = ''
            
            // Clear the input preview, but don't revoke the blob yet
            this.selectedImage = null
            this.imagePreviewUrl = null
            const fileInput = this.$refs.imageInput
            if (fileInput) {
                fileInput.value = ''
            }

            this.isLoading = true

            try {
                await this.getAIResponse(messageToSend, imageToSend)
            } catch (error) {
                console.error('❌ Error getting AI response:', error)
                this.messages.push({
                    role: 'assistant',
                    content: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
                    timestamp: new Date()
                })
            } finally {
                this.isLoading = false
            }
        },

        async getAIResponse(userMessage, imageFile = null) {
            try {
                console.log('🔍 Preparing API request...')
                console.log('📚 User query:', userMessage)
                console.log('�️ Image attached:', !!imageFile)
                console.log('�📝 Conversation history (last 10 messages):', this.messages.slice(-10))
                
                if (imageFile) {
                    // Use FormData for image upload
                    const formData = new FormData()
                    formData.append('message', userMessage)
                    formData.append('image', imageFile)
                    formData.append('conversationHistory', JSON.stringify(this.messages.slice(-10)))
                    
                    console.log('📤 Sending image analysis request to /ai-dermatologist/analyze-skin')
                    
                    const response = await api.post('/ai-dermatologist/analyze-skin', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    })
                    
                    console.log('✅ Received image analysis response:', response.data)
                    
                    this.messages.push({
                        role: 'assistant',
                        content: response.data.response,
                        sources: response.data.sources,
                        timestamp: new Date()
                    })
                } else {
                    // Regular text-only request
                    const requestData = {
                        message: userMessage,
                        conversationHistory: this.messages.slice(-10)
                    }
                    
                    console.log('📤 Sending request to /ai-dermatologist/chat:', requestData)
                    
                    const response = await api.post('/ai-dermatologist/chat', requestData)
                    
                    console.log('✅ Received API response:', response.data)
                    console.log('📚 Using RAG context for query:', userMessage)
                    console.log('💡 AI Response:', response.data.response)
                    
                    if (response.data.sources) {
                        console.log('📖 Sources used:', response.data.sources)
                    }

                    this.messages.push({
                        role: 'assistant',
                        content: response.data.response,
                        sources: response.data.sources,
                        timestamp: new Date()
                    })
                }
            } catch (error) {
                console.error('❌ Error calling AI API:', error)
                console.error('❌ Error details:', error.response?.data || error.message)
                
                // Check for specific error types
                const errorDetails = error.response?.data
                let errorMessage = ''
                
                if (errorDetails?.details?.includes('429') || errorDetails?.details?.includes('rate limit')) {
                    errorMessage = '\n\n*⚠️ The AI service is currently rate-limited. Please wait a moment and try again. Using offline knowledge base for now.*'
                } else if (errorDetails?.details?.includes('overloaded')) {
                    errorMessage = '\n\n*⚠️ The AI service is currently experiencing high traffic. Please try again shortly. Using offline knowledge base for now.*'
                } else {
                    errorMessage = '\n\n*⚠️ Unable to connect to AI service. Using offline knowledge base. For best results, ensure backend is running.*'
                }
                
                // Fallback to local response if API fails
                console.log('⚠️ Falling back to local response')
                let response = this.generateContextualResponse(userMessage)
                this.messages.push({
                    role: 'assistant',
                    content: response + errorMessage,
                    timestamp: new Date()
                })
            }
        },

        generateContextualResponse(message) {
            console.log('🔄 Generating contextual fallback response for:', message)
            const lowerMessage = message.toLowerCase()

            // Image analysis fallback
            if (lowerMessage.includes('analyze') || lowerMessage.includes('wrong') || lowerMessage.includes('image')) {
                console.log('✅ Matched pattern: image analysis')
                return `I'm unable to analyze the image right now, but here's some general guidance:

**Common Skin Concerns:**

**Acne:**
- Characterized by pimples, blackheads, whiteheads
- Treatment: Gentle cleansing, salicylic acid, benzoyl peroxide
- Consider: Retinoids for persistent acne

**Scarring:**
- Can be from previous acne or injuries
- Treatment: Vitamin C serum, retinol, niacinamide
- Professional: Chemical peels, microneedling, laser therapy

**Hyperpigmentation:**
- Dark spots or uneven skin tone
- Treatment: Vitamin C, niacinamide, alpha arbutin
- Essential: Daily SPF 30+

**Texture Issues:**
- Rough or uneven skin surface
- Treatment: Regular gentle exfoliation (AHA/BHA)
- Consider: Retinol for long-term improvement

**General Recommendations:**
1. Establish a gentle cleansing routine
2. Use sunscreen daily (SPF 30+)
3. Keep skin hydrated
4. Be patient - skin improvements take 4-12 weeks
5. For persistent concerns, consult a dermatologist

Would you like specific product recommendations for any of these concerns?`
            }

            // Skincare routine responses
            if (lowerMessage.includes('routine') && lowerMessage.includes('oily')) {
                console.log('✅ Matched pattern: oily skin routine')
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
                console.log('✅ Matched pattern: wrinkles/anti-aging')
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
                console.log('✅ Matched pattern: sensitive skin')
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
                console.log('✅ Matched pattern: acne/breakouts')
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
                console.log('✅ Matched pattern: exfoliation')
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
            console.log('ℹ️ No specific pattern matched, using generic response')
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
            // Use marked to parse markdown
            try {
                // Configure marked to support HTML
                marked.setOptions({
                    breaks: true,
                    gfm: true,
                    headerIds: false,
                    mangle: false,
                    sanitize: false
                })
                
                // Parse the markdown to HTML (no image processing needed)
                return marked.parse(content)
            } catch (error) {
                console.error('Error parsing markdown:', error)
                // Fallback to simple formatting
                return content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n\n/g, '</p><p>')
                    .replace(/\n/g, '<br>')
            }
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

        // Chat History Management Methods
        generateSessionId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2)
        },

        generateSessionTitle(messages) {
            if (messages.length === 0) return 'New Chat'
            const firstUserMessage = messages.find(m => m.role === 'user')
            if (firstUserMessage) {
                const title = firstUserMessage.content.substring(0, 50)
                return title.length < firstUserMessage.content.length ? title + '...' : title
            }
            return 'New Chat'
        },

        generateSessionPreview(messages) {
            if (messages.length === 0) return 'No messages yet'
            const firstUserMessage = messages.find(m => m.role === 'user')
            if (firstUserMessage) {
                return firstUserMessage.content.substring(0, 80) + (firstUserMessage.content.length > 80 ? '...' : '')
            }
            return 'No messages yet'
        },

        saveCurrentSession() {
            if (this.messages.length === 0) return

            if (!this.currentSessionId) {
                this.currentSessionId = this.generateSessionId()
            }

            // Create a copy of messages without blob URLs (they can't be restored)
            const messagesToSave = this.messages.map(msg => {
                if (msg.image && msg.image.startsWith('blob:')) {
                    // Don't save blob URLs - they won't work after reload
                    return {
                        ...msg,
                        image: null,
                        content: msg.content + ' [Image was uploaded]'
                    }
                }
                return msg
            })

            const session = {
                id: this.currentSessionId,
                title: this.generateSessionTitle(this.messages),
                preview: this.generateSessionPreview(this.messages),
                timestamp: new Date().toISOString(),
                messages: messagesToSave
            }

            // Update or add session
            const existingIndex = this.chatSessions.findIndex(s => s.id === this.currentSessionId)
            if (existingIndex >= 0) {
                this.chatSessions[existingIndex] = session
            } else {
                this.chatSessions.push(session)
            }

            // Save to localStorage
            try {
                localStorage.setItem('aiDermatologistSessions', JSON.stringify(this.chatSessions))
                localStorage.setItem('aiDermatologistCurrentSession', this.currentSessionId)
            } catch (error) {
                console.warn('Failed to save chat session:', error)
            }
        },

        loadAllSessions() {
            try {
                const savedSessions = localStorage.getItem('aiDermatologistSessions')
                if (savedSessions) {
                    this.chatSessions = JSON.parse(savedSessions)
                }
            } catch (error) {
                console.warn('Failed to load chat sessions:', error)
                this.chatSessions = []
            }
        },

        loadCurrentSession() {
            try {
                const currentSessionId = localStorage.getItem('aiDermatologistCurrentSession')
                if (currentSessionId) {
                    this.currentSessionId = currentSessionId
                    const session = this.chatSessions.find(s => s.id === currentSessionId)
                    if (session) {
                        this.messages = session.messages
                    }
                }
            } catch (error) {
                console.warn('Failed to load current session:', error)
            }
        },

        loadChatSession(sessionId) {
            const session = this.chatSessions.find(s => s.id === sessionId)
            if (session) {
                this.currentSessionId = sessionId
                this.messages = session.messages
                localStorage.setItem('aiDermatologistCurrentSession', sessionId)
                this.sidebarOpen = false
                this.$nextTick(() => {
                    this.scrollToBottom()
                })
            }
        },

        deleteChatSession(sessionId) {
            if (confirm('Delete this conversation? This cannot be undone.')) {
                this.chatSessions = this.chatSessions.filter(s => s.id !== sessionId)
                localStorage.setItem('aiDermatologistSessions', JSON.stringify(this.chatSessions))
                
                // If deleting current session, start a new one
                if (sessionId === this.currentSessionId) {
                    this.messages = []
                    this.currentSessionId = null
                    localStorage.removeItem('aiDermatologistCurrentSession')
                }
            }
        },

        toggleSidebar() {
            this.sidebarOpen = !this.sidebarOpen
        },

        formatSessionDate(timestamp) {
            const date = new Date(timestamp)
            const now = new Date()
            const diff = now - date
            const days = Math.floor(diff / (1000 * 60 * 60 * 24))

            if (days === 0) {
                return 'Today ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
            } else if (days === 1) {
                return 'Yesterday'
            } else if (days < 7) {
                return days + ' days ago'
            } else {
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            }
        },

        saveChatHistory() {
            // Legacy method - now handled by saveCurrentSession
            this.saveCurrentSession()
        },

        loadChatHistory() {
            // Legacy method - now handled by loadCurrentSession
            this.loadCurrentSession()
        },

        startNewChat() {
            if (this.messages.length > 0) {
                if (confirm('Start a new chat? Current conversation will be saved.')) {
                    this.saveCurrentSession()
                    this.cleanupBlobUrls()
                    this.messages = []
                    this.userInput = ''
                    this.currentSessionId = null
                    localStorage.removeItem('aiDermatologistCurrentSession')
                }
            }
        },

        clearChat() {
            if (confirm('Clear this chat? This cannot be undone.')) {
                if (this.currentSessionId) {
                    this.deleteChatSession(this.currentSessionId)
                }
                this.cleanupBlobUrls()
                this.messages = []
                this.userInput = ''
                this.currentSessionId = null
                localStorage.removeItem('aiDermatologistCurrentSession')
            }
        },

        cleanupBlobUrls() {
            // Revoke any blob URLs in messages to prevent memory leaks
            this.messages.forEach(message => {
                if (message.image && message.image.startsWith('blob:')) {
                    URL.revokeObjectURL(message.image)
                }
            })
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
    position: relative;
}

/* History Sidebar */
.history-sidebar {
    position: fixed;
    left: -320px;
    top: 0;
    bottom: 0;
    width: 320px;
    background: white;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    transition: left 0.3s ease;
    z-index: 1000;
    display: flex;
    flex-direction: column;
}

.history-sidebar.open {
    left: 0;
}

.sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--primary-200);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--primary-50);
}

.sidebar-header h3 {
    margin: 0;
    color: var(--primary-800);
    font-size: 1.25rem;
}

.close-sidebar-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--primary-600);
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    transition: background 0.2s;
}

.close-sidebar-btn:hover {
    background: var(--primary-100);
}

/* Search Input */
.sidebar-search {
    padding: 1rem 1.5rem;
    padding-bottom: 0;
    background: white;
    position: relative;
}

.search-input {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    border: 1px solid var(--primary-200);
    border-radius: 8px;
    font-size: 0.875rem;
    transition: all 0.2s;
    background: var(--primary-50);
}

.search-input:focus {
    outline: none;
    border-color: var(--primary-color);
    background: white;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-input::placeholder {
    color: var(--primary-600);
}

.clear-search {
    position: absolute;
    right: 2rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--primary-400);
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    font-size: 1rem;
    transition: all 0.2s;
    border-radius: 4px;
}

.clear-search:hover {
    background: var(--primary-100);
    color: var(--primary-600);
}

.sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
}

.no-history {
    text-align: center;
    padding: 2rem 1rem;
    color: var(--primary-400);
}

.no-history p {
    margin: 0;
}

.chat-sessions-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.chat-session-item {
    padding: 1rem;
    background: var(--primary-50);
    border: 1px solid var(--primary-200);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
}

.chat-session-item:hover {
    background: var(--primary-100);
    border-color: var(--primary-300);
    transform: translateX(2px);
}

.chat-session-item.active {
    background: var(--primary-100);
    border-color: var(--primary-400);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.session-info {
    flex: 1;
    min-width: 0;
}

.session-title {
    font-weight: 600;
    color: var(--primary-800);
    margin-bottom: 0.25rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.session-date {
    font-size: 0.75rem;
    color: var(--primary-500);
    margin-bottom: 0.25rem;
}

.session-preview {
    font-size: 0.875rem;
    color: var(--primary-600);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.delete-session-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.25rem;
    opacity: 0;
    transition: opacity 0.2s;
    flex-shrink: 0;
}

.chat-session-item:hover .delete-session-btn {
    opacity: 1;
}

.delete-session-btn:hover {
    transform: scale(1.2);
}

.sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    display: none;
}

@media (max-width: 768px) {
    .sidebar-overlay {
        display: block;
    }
    
    .history-sidebar {
        width: 280px;
        left: -280px;
    }
}

/* Chat Container */
.chat-container {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
    padding-bottom: 150px; /* Space for fixed input area */
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

.welcome-header {
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

/* Markdown elements styling */
.message-text :deep(h1),
.message-text :deep(h2),
.message-text :deep(h3),
.message-text :deep(h4) {
    margin: 1rem 0 0.5rem 0;
    font-weight: 600;
    color: var(--primary-800);
}

.message.user .message-text :deep(h1),
.message.user .message-text :deep(h2),
.message.user .message-text :deep(h3),
.message.user .message-text :deep(h4) {
    color: white;
}

.message-text :deep(h1) { font-size: 1.5rem; }
.message-text :deep(h2) { font-size: 1.3rem; }
.message-text :deep(h3) { font-size: 1.1rem; }
.message-text :deep(h4) { font-size: 1rem; }

.message-text :deep(ul),
.message-text :deep(ol) {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
}

.message-text :deep(li) {
    margin: 0.25rem 0;
}

.message-text :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    font-size: 0.9rem;
}

.message-text :deep(table th),
.message-text :deep(table td) {
    border: 1px solid var(--primary-200);
    padding: 0.5rem;
    text-align: left;
}

.message-text :deep(table th) {
    background-color: var(--primary-100);
    font-weight: 600;
    color: var(--primary-800);
}

.message.user .message-text :deep(table th) {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
}

.message.user .message-text :deep(table td) {
    border-color: rgba(255, 255, 255, 0.3);
}

.message-text :deep(code) {
    background-color: var(--primary-100);
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.9em;
}

.message.user .message-text :deep(code) {
    background-color: rgba(255, 255, 255, 0.2);
}

.message-text :deep(blockquote) {
    border-left: 3px solid var(--primary-400);
    padding-left: 1rem;
    margin: 1rem 0;
    color: var(--primary-700);
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
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1rem 2rem;
    background: var(--primary-50);
    z-index: 100;
}

/* Image Preview Container */
.image-preview-container {
    max-width: 1200px;
    margin: 0 auto 0.75rem;
}

.image-preview {
    position: relative;
    display: inline-block;
    max-width: 200px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-preview img {
    width: 100%;
    height: auto;
    display: block;
}

.remove-image-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: rgba(239, 68, 68, 0.9);
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
}

.remove-image-btn:hover {
    background: rgba(239, 68, 68, 1);
    transform: scale(1.1);
}

/* Message Image */
.message-image {
    margin-bottom: 0.75rem;
    border-radius: 8px;
    overflow: hidden;
    max-width: 300px;
}

.message-image img {
    width: 100%;
    height: auto;
    display: block;
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

.history-btn {
    background: var(--primary-100);
    color: var(--primary-600);
}

.history-btn:hover {
    background: white;
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

.image-upload-btn {
    padding: 0.75rem;
    background: white;
    color: var(--primary-color);
    border: 2px solid var(--primary-200);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 50px;
}

.image-upload-btn:hover {
    background: var(--primary-50);
    border-color: var(--primary-color);
}

.image-upload-btn svg {
    display: block;
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
        padding-bottom: 180px; /* Increased space for fixed input area on mobile */
    }

    .welcome-header h1 {
        font-size: 1.5rem;
    }

    .welcome-header {
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
