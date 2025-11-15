# Skin Study - Final Year Project Technical Documentation
## Part 3: Frontend Implementation, Mobile App, and Advanced Features

---

## 7. WEB FRONTEND IMPLEMENTATION

### 7.1 Application Structure

**Framework:** Vue.js 3 with Composition API
**Build Tool:** Vite
**Routing:** Vue Router

**Directory Structure:**
```
frontend/src/
├── main.js                 # Application entry point
├── App.vue                 # Root component
├── assets/                 # Static assets (images, styles)
├── components/
│   ├── NavBar.vue         # Navigation header
│   ├── Footer.vue         # Site footer
│   ├── SkinQuiz.vue       # Skin analysis questionnaire
│   └── ...
├── views/
│   ├── Home.vue           # Landing page
│   ├── SkinAnalysis.vue   # Skin analysis tool
│   ├── AIDermatologyExpert.vue # AI chat interface
│   ├── Education.vue      # Education hub
│   ├── EducationArticle.vue # Article reader
│   ├── Ingredients.vue    # Ingredient database
│   ├── IngredientStudy.vue # Ingredient details
│   ├── SkincareRoutines.vue # Routine generator
│   └── Auth.vue           # Login/Register
├── router/
│   └── index.js           # Route definitions
└── services/
    └── api.js             # Axios API client
```

### 7.2 Key Frontend Components

#### 7.2.1 Home Page (Home.vue)
**Purpose:** Landing page with feature overview

**Features:**
- Hero section with CTA
- Feature highlights
- Service cards
- Responsive design

**Key Sections:**
```vue
<template>
  <div class="home">
    <HeroSection />
    <FeaturesGrid>
      <FeatureCard title="Skin Analysis" />
      <FeatureCard title="AI Dermatology Expert" />
      <FeatureCard title="Education" />
      <FeatureCard title="Ingredients" />
    </FeaturesGrid>
    <CTASection />
  </div>
</template>
```

#### 7.2.2 Skin Analysis Interface (SkinAnalysis.vue)
**Purpose:** Multi-step questionnaire for skin analysis

**Implementation:**
```vue
<template>
  <div class="skin-analysis">
    <ProgressBar :currentStep="step" :totalSteps="totalSteps" />
    
    <QuestionCard v-if="step === 1">
      <h3>How does your skin feel after cleansing?</h3>
      <OptionButton
        v-for="option in skinFeelingOptions"
        :key="option.value"
        :selected="responses.skinFeeling === option.value"
        @click="selectOption('skinFeeling', option.value)"
      >
        {{ option.label }}
      </OptionButton>
    </QuestionCard>
    
    <!-- Additional question steps... -->
    
    <NavigationButtons>
      <button @click="previousStep" :disabled="step === 1">Back</button>
      <button @click="nextStep" v-if="step < totalSteps">Next</button>
      <button @click="submitAnalysis" v-else>Get Results</button>
    </NavigationButtons>
    
    <ResultsSection v-if="showResults">
      <SkinTypeCard :skinType="results.skinType" />
      <ScoreIndicator :score="results.overallScore" />
      <RecommendationsDisplay :recommendations="results.recommendations" />
    </ResultsSection>
  </div>
</template>

<script>
export default {
  data() {
    return {
      step: 1,
      totalSteps: 8,
      responses: {
        skinFeeling: null,
        skinAppearance: null,
        poreSize: null,
        breakoutFrequency: null,
        skinReaction: null,
        ageGroup: null,
        primaryConcerns: [],
        lifestyle: {}
      },
      results: null,
      showResults: false
    };
  },
  methods: {
    async submitAnalysis() {
      const response = await apiService.analyzeSkin(this.responses);
      this.results = response.data.results;
      this.showResults = true;
    }
  }
};
</script>
```

**Questionnaire Flow:**
1. Skin feeling after cleansing
2. Skin appearance during the day
3. Pore size assessment
4. Breakout frequency
5. Skin reaction sensitivity
6. Age group
7. Primary concerns (multi-select)
8. Lifestyle factors (stress, sleep, exercise, diet)

#### 7.2.3 AI Dermatology Expert Chat (AIDermatologyExpert.vue)
**Purpose:** Real-time AI consultation interface

**Features:**
- Text-based chat
- Markdown message rendering
- Conversation history
- Loading states
- Error handling

**Implementation:**
```vue
<template>
  <div class="ai-chat">
    <ChatHeader>
      <h2>AI Dermatology Expert</h2>
      <button @click="startNewChat">New Chat</button>
    </ChatHeader>
    
    <ChatMessages ref="messagesContainer">
      <WelcomeMessage v-if="messages.length === 0" />
      
      <MessageBubble
        v-for="(message, index) in messages"
        :key="index"
        :role="message.role"
        :content="message.content"
        :timestamp="message.timestamp"
      />
      
      <TypingIndicator v-if="isLoading" />
    </ChatMessages>
    
    <ChatInput>
      <textarea
        v-model="userInput"
        placeholder="Ask about skincare, ingredients, or treatments..."
        @keydown.enter.prevent="sendMessage"
      />
      <button @click="sendMessage" :disabled="!userInput.trim() || isLoading">
        Send
      </button>
    </ChatInput>
  </div>
</template>

<script>
import { marked } from 'marked';

export default {
  data() {
    return {
      messages: [],
      userInput: '',
      isLoading: false
    };
  },
  methods: {
    async sendMessage() {
      if (!this.userInput.trim()) return;
      
      const userMessage = {
        role: 'user',
        content: this.userInput,
        timestamp: new Date()
      };
      
      this.messages.push(userMessage);
      this.userInput = '';
      this.isLoading = true;
      
      try {
        const response = await apiService.chatWithAI({
          message: userMessage.content,
          conversationHistory: this.messages.slice(-10)
        });
        
        this.messages.push({
          role: 'assistant',
          content: marked.parse(response.data.response),
          timestamp: new Date(),
          sources: response.data.sources
        });
      } catch (error) {
        this.handleError(error);
      } finally {
        this.isLoading = false;
        this.scrollToBottom();
      }
    },
    
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        container.scrollTop = container.scrollHeight;
      });
    }
  }
};
</script>
```

#### 7.2.4 Education Hub (Education.vue)
**Purpose:** Browse and search educational content

**Features:**
- Category filtering
- Difficulty filtering
- Search functionality
- Article cards with metadata

**Implementation:**
```vue
<template>
  <div class="education-hub">
    <SearchBar v-model="searchQuery" @search="filterArticles" />
    
    <FilterSection>
      <CategoryFilter v-model="selectedCategory" :categories="categories" />
      <DifficultyFilter v-model="selectedDifficulty" />
    </FilterSection>
    
    <ArticlesGrid>
      <ArticleCard
        v-for="article in filteredArticles"
        :key="article._id"
        :article="article"
        @click="navigateToArticle(article.slug)"
      >
        <template #title>{{ article.title }}</template>
        <template #metadata>
          <Badge :category="article.category" />
          <Badge :difficulty="article.difficulty" />
          <ReadTime :minutes="article.readTime" />
        </template>
        <template #description>
          {{ article.content.introduction.substring(0, 150) }}...
        </template>
      </ArticleCard>
    </ArticlesGrid>
  </div>
</template>

<script>
export default {
  data() {
    return {
      articles: [],
      searchQuery: '',
      selectedCategory: 'all',
      selectedDifficulty: 'all'
    };
  },
  computed: {
    filteredArticles() {
      return this.articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(
          this.searchQuery.toLowerCase()
        );
        const matchesCategory = this.selectedCategory === 'all' || 
          article.category === this.selectedCategory;
        const matchesDifficulty = this.selectedDifficulty === 'all' || 
          article.difficulty === this.selectedDifficulty;
        
        return matchesSearch && matchesCategory && matchesDifficulty;
      });
    }
  },
  async created() {
    const response = await apiService.getEducationArticles();
    this.articles = response.data.articles;
  }
};
</script>
```

#### 7.2.5 Ingredient Browser (Ingredients.vue)
**Purpose:** Search and browse ingredient database

**Features:**
- Alphabetical listing
- Search by name
- Category filtering
- Ingredient details modal

### 7.3 API Service Layer

**File:** `frontend/src/services/api.js`

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for auth token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default {
  // Auth
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  getProfile: () => apiClient.get('/auth/profile'),
  
  // Skin Analysis
  analyzeSkin: (responses) => apiClient.post('/skin-analysis/analyze', { responses }),
  getAnalysisHistory: () => apiClient.get('/skin-analysis/history'),
  
  // AI Dermatology Expert
  chatWithAI: (data) => apiClient.post('/ai-dermatology-expert/chat', data),
  analyzeSkinImage: (formData) => apiClient.post('/ai-dermatology-expert/analyze-skin', 
    formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  
  // Education
  getEducationArticles: () => apiClient.get('/education/articles'),
  getArticleBySlug: (slug) => apiClient.get(`/education/articles/${slug}`),
  
  // Ingredients
  getIngredients: () => apiClient.get('/ingredients'),
  searchIngredients: (query) => apiClient.get('/ingredients/search', { params: { q: query } })
};
```

---

## 8. MOBILE APPLICATION

### 8.1 Mobile App Architecture

**Platform:** React Native with Expo
**Target OS:** iOS and Android

**App Structure:**
```
mobile-chat-app/
├── App.js                          # Root component
├── index.js                        # Entry point
├── components/
│   ├── AIDermatologyExpert.js         # Text chat screen
│   ├── AIDermatologyExpert.styles.js  # Styles for chat
│   ├── LiveChatAI.js              # Voice chat screen
│   └── ChatHistory.js             # Session management
├── services/
│   └── api.js                     # API integration
└── config/
    └── API_CONFIG.md              # API configuration
```

### 8.2 Text Chat Component (AIDermatologyExpert.js)

**Key Features:**
- Real-time messaging
- Markdown rendering
- Message history persistence
- Voice playback (TTS)
- Optimized performance with memoization

**State Management:**
```javascript
const [messages, setMessages] = useState([]);
const [userInput, setUserInput] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [speakingMessageIndex, setSpeakingMessageIndex] = useState(null);
const [isSpeaking, setIsSpeaking] = useState(false);
const [sound, setSound] = useState(null);
```

**Message Rendering with Memoization:**
```javascript
const MessageComponent = memo(({ 
  message, 
  index, 
  contentWidth, 
  handleSpeak,
  isThisMessageSpeaking 
}) => {
  const html = useMemo(() => 
    convertMarkdownToHtml(message.content), 
    [message.content]
  );
  
  return (
    <View style={[styles.message, messageStyles]}>
      <RenderHtml
        contentWidth={contentWidth}
        source={{ html }}
        tagsStyles={tagsStyles}
      />
      <Text style={styles.messageTime}>
        {formatTime(message.timestamp)}
      </Text>
      {message.role === 'assistant' && (
        <TouchableOpacity onPress={() => handleSpeak(index)}>
          <Text>{isThisMessageSpeaking ? '⏸' : '🔊'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.message.content === nextProps.message.content &&
    prevProps.isThisMessageSpeaking === nextProps.isThisMessageSpeaking
  );
});
```

**Markdown to HTML Conversion:**
```javascript
const convertMarkdownToHtml = useMemo(() => (markdown) => {
  let html = markdown;
  
  // Headers
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Nested lists (up to 3 levels)
  html = html.replace(/(?:^[\*\-•] .+$\n?(?:^ {2,8}[\*\-•] .+$\n?)*)+/gm, (match) => {
    // List processing logic...
    return `<ul>${processedList}</ul>`;
  });
  
  // Paragraphs
  return html.split(/\n\n+/).map(block => {
    if (!block.match(/^<(h[1-6]|ul|ol|li)/)) {
      return `<p>${block.replace(/\n/g, '<br/>')}</p>`;
    }
    return block;
  }).join('');
}, []);
```

**Send Message Function:**
```javascript
const sendMessage = useCallback(async () => {
  if (!userInput.trim() || isLoading) return;

  const userMessage = {
    role: 'user',
    content: userInput.trim(),
    timestamp: new Date().toISOString()
  };

  setMessages(prev => [...prev, userMessage]);
  setUserInput('');
  setIsLoading(true);

  try {
    const response = await aiDermatologyExpertService.chat(
      userMessage.content,
      messages.slice(-10)
    );

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: response.response,
      sources: response.sources,
      timestamp: new Date().toISOString()
    }]);
  } catch (error) {
    // Fallback to local response if API fails
    const fallbackResponse = generateContextualResponse(userMessage.content);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: fallbackResponse,
      timestamp: new Date().toISOString()
    }]);
  } finally {
    setIsLoading(false);
  }
}, [userInput, isLoading, messages]);
```

**Text-to-Speech with Sentence Streaming:**
```javascript
const handleSpeak = useCallback(async (messageIndex) => {
  const message = messages[messageIndex];
  
  // Clean text for speech
  let textToSpeak = stripFormattingForSpeech(message.content);
  
  // Split into sentences
  const sentences = splitIntoSentences(textToSpeak);
  
  setSpeakingMessageIndex(messageIndex);
  setIsSpeaking(true);

  // Play sentences sequentially
  for (let i = 0; i < sentences.length; i++) {
    if (!playbackControlRef.current.shouldContinue) break;

    // Request TTS from backend
    const response = await liveChatService.textToSpeech(sentences[i]);

    // Create and play sound
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: `data:audio/mp3;base64,${response.audio}` },
      { shouldPlay: true }
    );

    // Wait for sentence to finish
    await new Promise((resolve) => {
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) resolve();
      });
    });

    await newSound.unloadAsync();
  }

  setSpeakingMessageIndex(null);
  setIsSpeaking(false);
}, [messages]);
```

**Contextual Fallback Responses:**
```javascript
const generateContextualResponse = (message) => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('routine') && lowerMessage.includes('oily')) {
    return `For oily skin, I recommend:
    
**Morning:**
1. Gentle foaming cleanser
2. Niacinamide serum
3. Oil-free moisturizer
4. SPF 30+ sunscreen

**Evening:**
1. Oil-based cleanser
2. Foaming cleanser
3. BHA or retinol treatment
4. Lightweight moisturizer

Key ingredients: Niacinamide, Salicylic Acid, Hyaluronic Acid`;
  }

  // Additional pattern matching for common queries...
  
  return "As a virtual dermatology expert, I can help with skincare advice...";
};
```

### 8.3 Live Voice Chat Component (LiveChatAI.js)

**Features:**
- Real-time voice recording
- Speech-to-text transcription
- Automated AI responses
- Text-to-speech playback
- Conversation flow management

**Key Technologies:**
- **Expo Speech Recognition** - Voice input
- **Expo AV** - Audio recording/playback
- **Expo Speech** - Text-to-speech
- **Backend Gemini API** - Transcription & responses

**Voice Recording Flow:**
```javascript
const startRecording = async () => {
  try {
    // Request permissions
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) return;

    // Configure audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Start recording
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    setRecording(recording);
  } catch (error) {
    console.error('Failed to start recording', error);
  }
};

const stopRecording = async () => {
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  
  // Upload to backend for transcription
  const formData = new FormData();
  formData.append('audio', {
    uri,
    type: 'audio/m4a',
    name: 'recording.m4a'
  });

  const response = await liveChatService.transcribe(formData);
  const transcription = response.transcription;

  // Process transcribed text
  handleTranscribedText(transcription);
};
```

### 8.4 Chat History Component (ChatHistory.js)

**Purpose:** Manage and load previous chat sessions

**Features:**
- List all saved sessions
- Separate text and voice chat sessions
- Load session into active chat
- Delete sessions
- Timestamp display

**Storage Strategy:**
```javascript
// AsyncStorage for persistence
const saveChatHistory = async (messages) => {
  const timestamp = Date.now();
  const session = {
    id: `session_${timestamp}`,
    type: 'text',
    messages,
    timestamp,
    preview: messages[messages.length - 1]?.content.substring(0, 100)
  };

  const existingSessions = await AsyncStorage.getItem('chatSessions');
  const sessions = existingSessions ? JSON.parse(existingSessions) : [];
  sessions.unshift(session);

  await AsyncStorage.setItem('chatSessions', JSON.stringify(sessions));
};
```

### 8.5 Mobile API Service

**File:** `mobile-chat-app/services/api.js`

```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3004/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000
});

export const aiDermatologyExpertService = {
  chat: async (message, conversationHistory = []) => {
    const response = await apiClient.post('/ai-dermatology-expert/chat', {
      message,
      conversationHistory
    });
    return response.data;
  },

  analyzeSkinImage: async (imageUri, message, conversationHistory = []) => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'skin-image.jpg'
    });
    formData.append('message', message);
    formData.append('conversationHistory', JSON.stringify(conversationHistory));

    const response = await apiClient.post('/ai-dermatology-expert/analyze-skin', 
      formData, 
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  }
};

export const liveChatService = {
  transcribe: async (audioFormData) => {
    const response = await apiClient.post('/ai-dermatology-expert/transcribe', 
      audioFormData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  textToSpeech: async (text) => {
    const response = await apiClient.post('/ai-dermatology-expert/text-to-speech', 
      { text }
    );
    return response.data;
  }
};

export const chatStorage = {
  saveChatHistory: async (messages) => {
    await AsyncStorage.setItem('currentChat', JSON.stringify(messages));
  },
  
  loadChatHistory: async () => {
    const data = await AsyncStorage.getItem('currentChat');
    return data ? JSON.parse(data) : [];
  },
  
  clearChatHistory: async () => {
    await AsyncStorage.removeItem('currentChat');
  }
};
```

---

*Continued in Part 4...*
