# Skin Study - Final Year Project Technical Documentation
## Part 2: Core Features and Implementation Details

---

## 6. CORE FEATURES & FUNCTIONALITY

### 6.1 Intelligent Skin Analysis System

#### 6.1.1 Algorithm Overview
**Location:** `backend/controllers/skinAnalysisController.js`

**Purpose:** Analyzes user responses from a questionnaire to determine skin type, identify concerns, and generate personalized recommendations.

**Input Parameters:**
```javascript
{
  skinFeeling: Enum['comfortable', 'tight', 'oily', 'shiny', 'flaky', 'rough'],
  skinAppearance: Enum['healthy', 'dull', 'shiny', 'flaky', 'patchy'],
  poreSize: Enum['small', 'medium', 'large', 'varied'],
  breakoutFrequency: Enum['rarely', 'sometimes', 'often', 'always', 'never'],
  skinReaction: Enum['none', 'mild', 'moderate', 'severe'],
  ageGroup: Enum['teens', 'twenties', 'thirties', 'forties', 'fifties_plus'],
  primaryConcerns: Array[String],
  lifestyle: {
    stressLevel: Enum['low', 'moderate', 'high'],
    sleepQuality: Enum['excellent', 'good', 'average', 'poor'],
    exercise: Enum['sedentary', 'light', 'regular', 'intense'],
    diet: Enum['excellent', 'good', 'average', 'poor']
  }
}
```

#### 6.1.2 Skin Type Determination Logic

**Algorithm Steps:**
1. **Score Calculation:**
   - Oily Score: Based on 'oily', 'shiny', 'large' indicators
   - Dry Score: Based on 'tight', 'flaky', 'rough', 'dull', 'small' indicators
   - Sensitive Score: Based on reaction severity

2. **Type Assignment:**
   ```javascript
   if (sensitiveScore >= 3) → 'sensitive' (confidence: 85%)
   else if (oilyScore >= 3 && oilyScore > dryScore) → 'oily' (confidence: 80%)
   else if (dryScore >= 3 && dryScore > oilyScore) → 'dry' (confidence: 80%)
   else if (oilyScore > 0 && dryScore > 0) → 'combination' (confidence: 75%)
   else → 'normal' (confidence: 70%)
   ```

#### 6.1.3 Overall Score Calculation

**Formula:** Start at 100, apply deductions and adjustments

**Deductions:**
- Breakout frequency:
  - Always/Often: -20
  - Sometimes: -10
  - Rarely: -3
- Skin reactions:
  - Severe: -15
  - Moderate: -8
  - Mild: -3
- Lifestyle factors:
  - High stress: -12
  - Moderate stress: -5
  - Poor sleep: -12
  - Average sleep: -5
- Appearance:
  - Large/varied pores: -8
  - Medium pores: -3
  - Dull/patchy appearance: -8
- Concern severity:
  - Severe: -5 per concern
  - Moderate: -3 per concern

**Bonuses:**
- Regular exercise: +3
- Excellent diet: +3
- Comfortable skin feeling: +5
- Small pores: +3

**Output Range:** 0-100 (clamped)

#### 6.1.4 Recommendation Generation

**Routine Structure:**
```javascript
{
  morning: [
    { step: 1, product: 'Gentle Cleanser', purpose: '...', frequency: 'Daily' },
    { step: 2, product: 'Moisturizer', purpose: '...', frequency: 'Daily' },
    { step: 3, product: 'Sunscreen SPF 30+', purpose: '...', frequency: 'Daily' }
  ],
  evening: [
    { step: 1, product: 'Cleanser', purpose: '...', frequency: 'Daily' },
    { step: 2, product: 'Treatment Serum', purpose: '...', frequency: '3-4x per week' },
    { step: 3, product: 'Night Moisturizer', purpose: '...', frequency: 'Daily' }
  ]
}
```

**Skin-Type Specific Customizations:**

| Skin Type | Additional Products | Beneficial Ingredients | Ingredients to Avoid |
|-----------|-------------------|----------------------|---------------------|
| Oily | Niacinamide Serum | Salicylic Acid (0.5-2%)<br>Niacinamide (5-10%) | Heavy oils |
| Dry | Hydrating Serum | Hyaluronic Acid (1-2%)<br>Ceramides | Alcohol-based toners |
| Sensitive | Calming Serum | Centella Asiatica (1-5%)<br>Panthenol (2-5%) | Fragrances<br>Strong acids |
| Combination | Targeted treatments | Based on zone concerns | - |

**Concern-Specific Additions:**
- **Acne:** Benzoyl Peroxide (2.5-5%)
- **Aging:** Retinol (0.25-1%), Vitamin C (10-20%)
- **Hyperpigmentation:** Niacinamide, Alpha Arbutin
- **Dryness:** Hyaluronic Acid, Ceramides

---

### 6.2 AI Dermatologist with RAG (Retrieval-Augmented Generation)

#### 6.2.1 RAG System Architecture

**Purpose:** Provides evidence-based dermatological advice by combining AI language models with a vector database of authoritative dermatology textbooks.

**Flow Diagram:**
```
User Query
    ↓
Query Embedding (Gemini text-embedding-004)
    ↓
Vector Similarity Search (Qdrant)
    ↓
Retrieve Top-K Relevant Chunks (K=3)
    ↓
Construct Context from Retrieved Chunks
    ↓
Generate Response (Gemini 2.0 Flash) with Context
    ↓
Format Response with Citations
    ↓
Return to User
```

#### 6.2.2 Vector Service Implementation
**File:** `backend/services/vectorService.js`

**Key Components:**

1. **Collection Initialization:**
```javascript
async initializeCollection() {
  // Create collection with 768-dimensional vectors
  await qdrantClient.createCollection('dermatology_knowledge', {
    vectors: {
      size: 768,
      distance: 'Cosine'
    }
  });
}
```

2. **Knowledge Base Loading:**
```javascript
async loadKnowledgeBase() {
  // Read .txt files from knowledge-sources/extracted-content/
  // Split text using RecursiveCharacterTextSplitter
  //   - Chunk size: 1500 characters
  //   - Chunk overlap: 300 characters
  //   - Separators: '\n\n', '\n', '. ', ' '
  // Return array of documents with metadata
}
```

3. **Document Indexing:**
```javascript
async indexDocuments(documents) {
  // Batch processing (50 documents per batch)
  // Generate embeddings using Gemini
  // Validate embeddings (768 dimensions, non-zero values)
  // Upload to Qdrant with retry logic (3 retries)
  // Includes error handling and progress logging
}
```

4. **Semantic Search:**
```javascript
async searchRelevantDocs(query, limit = 3) {
  // Convert query to embedding vector
  // Search Qdrant with:
  //   - Cosine similarity
  //   - Score threshold: 0.4 (40% similarity minimum)
  //   - Return top K results
  // Include detailed scoring analysis in debug mode
}
```

**Search Scoring:**
- **Score Range:** 0.0 (no similarity) to 1.0 (perfect match)
- **Score Categories:**
  - 0.90-1.00: Perfect match (90-100%)
  - 0.75-0.89: Excellent match (75-89%)
  - 0.60-0.74: Good match (60-74%)
  - 0.45-0.59: Fair match (45-59%)
  - 0.30-0.44: Weak match (30-44%)
  - <0.30: Poor match

5. **Complete RAG Pipeline:**
```javascript
async ragQuery(userQuery, conversationHistory = []) {
  // 1. Perform vector search
  const relevantDocs = await searchRelevantDocs(query, 3);
  
  // 2. Build context string with source attribution
  const context = relevantDocs.map((doc, idx) => 
    `[Source ${idx + 1} - "${doc.metadata.source}"]\n${doc.content}`
  ).join('\n\n---\n\n');
  
  // 3. Return context and sources
  return { context, sources: relevantDocs };
}
```

#### 6.2.3 Gemini Service Implementation
**File:** `backend/services/geminiService.js`

**Model Configuration:**
```javascript
{
  model: 'gemini-2.0-flash-exp',
  generationConfig: {
    temperature: 0.7,      // Balanced creativity/accuracy
    topP: 0.9,            // Nucleus sampling
    topK: 40,             // Token selection
    maxOutputTokens: 4096  // Response length
  }
}
```

**System Context:**
```
You are a Virtual Dermatologist with extensive knowledge in:
- Dermatology and skin conditions
- Skincare ingredients and formulations
- Cosmetic procedures and treatments
- Evidence-based skincare routines
- Product recommendations

IMPORTANT RESPONSE RULES:
1. Use ALL information from knowledge base
2. Synthesize from multiple sources
3. Provide detailed, thorough responses
4. Format in clear markdown
5. ALWAYS cite sources using [1], [2], etc.
6. Include References section at the end
```

**Response Generation with Context:**
```javascript
async generateResponseWithContext(userMessage, ragContext, conversationHistory) {
  // Build full prompt
  let prompt = systemContext;
  prompt += '\n\n=== RELEVANT KNOWLEDGE FROM DERMATOLOGY TEXTBOOK ===\n';
  prompt += ragContext;
  prompt += '\n=== END OF KNOWLEDGE BASE ===\n\n';
  
  // Add citation requirements
  prompt += 'CITATION REQUIREMENT:\n';
  prompt += '- Cite sources inline: [1], [2], [3]\n';
  prompt += '- Add References section at end\n\n';
  
  // Add conversation history (last 5 messages)
  if (conversationHistory.length > 0) {
    prompt += 'Previous conversation:\n';
    conversationHistory.slice(-5).forEach(msg => {
      prompt += `${msg.role}: ${msg.content}\n`;
    });
  }
  
  prompt += `\nPatient: ${userMessage}\nDermatologist:`;
  
  // Generate with retry logic (3 attempts)
  const result = await generateWithRetry(prompt);
  return result.response.text();
}
```

**Retry Logic for Rate Limiting:**
```javascript
async generateWithRetry(prompt, maxRetries = 3, initialDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await model.generateContent(prompt);
    } catch (error) {
      if (error.status === 503 || error.status === 429) {
        // Exponential backoff
        const delay = initialDelay * Math.pow(2, attempt);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
}
```

#### 6.2.4 Citation System

**Citation Format in Response:**
```markdown
The successful treatment of acne scars often requires a combination of treatments.[1,3]
CO2 laser resurfacing is a great technique but may not adequately treat deeper scars.[1]
A serial, multimodal approach is essential.[1]

### References
[1,3,5] Skin Care: Beyond the Basics, 4th Edition
[2,4] Lasers in Dermatology and Medicine: Dermatologic Applications
[6] Textbook of Cosmetic Dermatology
```

**Citation Rules:**
1. Place citations after punctuation: `statement.[1]`
2. Combine consecutive sources: `[1,3]` not `[1-3]`
3. Group only identical book titles
4. List references in order of first appearance
5. No duplicate books in reference list

---

### 6.3 Multi-Modal AI Features

#### 6.3.1 Image Analysis
**Endpoint:** POST `/api/ai-dermatologist/analyze-skin`

**Capabilities:**
- Skin condition identification
- Texture analysis
- Color assessment
- Lesion detection
- Personalized recommendations

**Implementation:**
```javascript
async analyzeSkinImage(imageFilePath, userMessage, ragContext, conversationHistory) {
  // 1. Read image file
  const imageData = await fs.readFile(imageFilePath);
  const base64Image = imageData.toString('base64');
  
  // 2. Build analysis prompt with RAG context
  let prompt = `Expert Virtual Dermatologist analyzing skin image...
  
  === RELEVANT KNOWLEDGE ===
  ${ragContext}
  
  ANALYSIS INSTRUCTIONS:
  1. Examine visible skin conditions
  2. Describe texture, color, lesions
  3. Provide possible conditions
  4. Use knowledge base for recommendations
  5. Cite sources
  6. Include disclaimers
  `;
  
  // 3. Use Gemini Vision model
  const visionModel = getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp'
  });
  
  // 4. Generate content with image and prompt
  const result = await visionModel.generateContent([
    { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
    prompt
  ]);
  
  return result.response.text();
}
```

**Supported Formats:**
- JPEG, PNG, GIF, WebP, BMP
- Max file size: 10MB
- Processed via Multer middleware

#### 6.3.2 Audio Transcription
**Endpoint:** POST `/api/ai-dermatologist/transcribe`

**Purpose:** Convert voice recordings to text for AI consultation

**Implementation:**
```javascript
async transcribeAudio(audioFilePath) {
  // 1. Read audio file
  const audioData = await fs.readFile(audioFilePath);
  const base64Audio = audioData.toString('base64');
  const mimeType = getMimeType(audioFilePath);
  
  // 2. Use Gemini multimodal for transcription
  const model = getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  
  // 3. Generate transcription
  const result = await model.generateContent([
    { inlineData: { data: base64Audio, mimeType } },
    'Transcribe this audio to text. Provide only the transcription.'
  ]);
  
  return result.response.text().trim();
}
```

**Supported Formats:**
- MP3, MP4 (M4A), WAV, AAC, OGG, FLAC
- Auto-detected MIME type

#### 6.3.3 Text-to-Speech
**Endpoint:** POST `/api/ai-dermatologist/text-to-speech`

**Purpose:** Convert AI responses to voice audio

**Implementation:**
```javascript
// Using node-gtts library
async textToSpeech(text, outputPath) {
  return new Promise((resolve, reject) => {
    gtts.save(outputPath, text, () => {
      resolve(outputPath);
    });
  });
}
```

**Features:**
- MP3 audio output
- Base64 encoding for mobile clients
- Sentence-by-sentence streaming for faster playback

---

### 6.4 Education Content System

#### 6.4.1 Content Structure
**Collection:** `EducationContent`

**Categories:**
- `skincare-basics` - Fundamental skincare concepts
- `ingredients` - Active ingredient education
- `concerns` - Specific skin concerns
- `procedures` - Cosmetic procedures

**Difficulty Levels:**
- `beginner` - Basic concepts
- `intermediate` - Detailed information
- `advanced` - Scientific/technical content

#### 6.4.2 Article Schema
```javascript
{
  title: String,
  slug: String (unique, URL-friendly),
  category: Enum,
  difficulty: Enum,
  content: {
    introduction: String,
    sections: [{
      heading: String,
      content: String (rich text/markdown)
    }],
    keyTakeaways: Array[String]
  },
  relatedTopics: Array[String],
  sources: Array[String] (scientific references),
  author: String,
  readTime: Number (minutes),
  published: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 6.4.3 Features
- **Search & Filter:** By category, difficulty, keywords
- **Related Content:** Suggested articles
- **Reading Time:** Estimated minutes
- **Rich Content:** Support for markdown, lists, images
- **Scientific Sources:** Cited references

---

### 6.5 Ingredient Study System

#### 6.5.1 Comprehensive Ingredient Database

**Data Structure:**
```javascript
{
  name: String (primary name),
  commonNames: Array[String] (alternatives),
  category: Enum (moisturizer, exfoliant, antioxidant, etc.),
  description: String,
  benefits: Array[String],
  bestFor: Array[String] (skin types),
  concerns: Array[String] (addresses),
  concentration: {
    min: Number,
    max: Number,
    optimal: Number,
    unit: String ('%', 'mg', etc.)
  },
  usage: {
    frequency: String,
    timeOfDay: Enum['morning', 'evening', 'both'],
    instructions: String
  },
  compatibility: {
    mixWellWith: Array[String],
    avoid: Array[String] (ingredient conflicts)
  },
  sideEffects: Array[String],
  contraindications: Array[String],
  scientificName: String,
  evidenceLevel: Enum['high', 'moderate', 'limited']
}
```

#### 6.5.2 Key Features

**Search Capabilities:**
- Name search (primary and common names)
- Category filtering
- Skin type filtering
- Concern-based search

**Ingredient Compatibility Checker:**
- Identifies synergistic combinations
- Warns about incompatible ingredients
- Provides usage guidelines

**Evidence-Based Information:**
- Scientific backing level
- Cited sources
- Concentration guidelines

---

*Continued in Part 3...*
