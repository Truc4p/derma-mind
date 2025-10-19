# AI Dermatologist with Gemini API Integration

## Overview

This implementation creates a **Board-Certified Virtual Dermatologist** powered by Google's Gemini AI and trained on a comprehensive dermatology knowledge base.

## Architecture

### Backend Components

1. **DermatologyKnowledge Model** (`models/DermatologyKnowledge.js`)
   - MongoDB schema for storing dermatology knowledge
   - Categories: skin-conditions, ingredients, treatments, routines, cosmetics, procedures, general-advice
   - Full-text search indexing for efficient retrieval

2. **Gemini Service** (`services/geminiService.js`)
   - Integrates Google Gemini AI
   - Retrieves relevant knowledge from database based on user queries
   - Builds context-aware prompts combining AI with knowledge base
   - Generates evidence-based responses

3. **API Routes** (`routes/aiDermatologist.js`)
   - `POST /api/ai-dermatologist/chat` - Main chat endpoint
   - `POST /api/ai-dermatologist/analyze` - Query analysis
   - `POST /api/ai-dermatologist/routine` - Generate personalized routines

4. **Knowledge Base Seeder** (`seedKnowledgeBase.js`)
   - Pre-populated with dermatology knowledge
   - Run: `npm run seed:knowledge`

### Frontend Components

- **AIDermatologist.vue** - Updated to use real Gemini AI API
- Fallback to local responses if API unavailable
- Conversation history maintained for context

## Knowledge Sources

The AI is trained on knowledge from:

### Current Implementation (Included)
- Acne vulgaris management
- Anti-aging ingredients (retinoids, vitamin C, AHAs, BHAs)
- Skincare routines for different skin types
- Ingredient science (niacinamide, hyaluronic acid, ceramides)
- Skin barrier function
- Sunscreen guidelines
- Product layering techniques

### Recommended Additional Sources

#### Medical Textbooks (Professional Resources)
1. **Fitzpatrick's Dermatology in General Medicine**
   - Gold standard dermatology reference
   - Comprehensive coverage of all skin conditions

2. **Andrews' Diseases of the Skin**
   - Clinical dermatology reference
   - Practical treatment approaches

3. **Cosmetic Dermatology: Principles and Practice**
   - Focus on aesthetic dermatology
   - Evidence-based cosmetic procedures

#### Free Online Resources
1. **DermNet NZ** (https://dermnetnz.org/)
   - Free, comprehensive dermatology resource
   - 1000+ skin condition articles
   - Evidence-based information
   - Excellent images and clinical photos

2. **American Academy of Dermatology (AAD)** (https://www.aad.org/)
   - Professional guidelines
   - Patient education materials
   - Evidence-based recommendations

3. **Paula's Choice Ingredient Dictionary** (https://www.paulaschoice.com/ingredient-dictionary)
   - Comprehensive ingredient information
   - Scientific references
   - Safety ratings

4. **Cosmetic Ingredient Review (CIR)** (https://www.cir-safety.org/)
   - Official ingredient safety assessments
   - Scientific studies

5. **PubMed/PubMed Central**
   - Research articles on dermatology
   - Clinical studies
   - Free access to many papers

#### Books for Knowledge Base
1. **"The Science of Skincare" by Dr. Michelle Wong**
2. **"Skin Care: The Ultimate No-Nonsense Guide" by Dr. Anjali Mahto**
3. **"Clean Skin from Within" by Dr. Trevor Cates**
4. **"Beyond Soap" by Dr. Sandy Skotnicki**

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install:
- `@google/generative-ai` - Google Gemini AI SDK
- Other existing dependencies

### 2. Configure Environment Variables

The `.env` file has been updated with:
```
GEMINI_API_KEY=AIzaSyD45yKmp57ntK9UmtJOSii5Shky32FuO0w
```

### 3. Seed the Knowledge Base

```bash
cd backend
npm run seed:knowledge
```

This will:
- Connect to MongoDB
- Clear existing knowledge
- Insert comprehensive dermatology knowledge
- Create search indexes

### 4. Start the Backend

```bash
cd backend
npm start
# or for development:
npm run dev
```

### 5. Start the Frontend

```bash
cd frontend
npm run dev
```

## How It Works

### 1. User Query Processing
```
User asks: "What's good for oily skin?"
```

### 2. Knowledge Retrieval
The system searches the knowledge base for relevant articles:
- Extracts keywords from query
- Searches database using full-text search and keyword matching
- Returns top 5 most relevant knowledge articles

### 3. Context Building
```
System Context: "You are a Board-Certified Virtual Dermatologist..."
+ Knowledge Base Articles (with sources)
+ Conversation History (last 5 messages)
+ Current User Query
```

### 4. AI Generation
Gemini generates response based on:
- Professional dermatologist persona
- Retrieved knowledge base information
- Conversation context
- Evidence-based approach

### 5. Response with Sources
Returns:
- AI-generated response
- Source references from knowledge base
- Timestamp

## Expanding the Knowledge Base

### Method 1: Manual Addition

Add to `seedKnowledgeBase.js`:

```javascript
{
    category: 'skin-conditions',
    subcategory: 'rosacea',
    title: 'Understanding and Managing Rosacea',
    content: `[Your detailed content here]`,
    keywords: ['rosacea', 'redness', 'flushing', 'sensitive'],
    sourceReference: 'Source citation here',
    verified: true
}
```

Then run: `npm run seed:knowledge`

### Method 2: API-Based Addition

Create an admin route to add knowledge dynamically:

```javascript
// Add to routes/aiDermatologist.js
router.post('/knowledge/add', adminAuth, async (req, res) => {
    const knowledge = new DermatologyKnowledge(req.body);
    await knowledge.save();
    res.json({ success: true, id: knowledge._id });
});
```

### Method 3: Bulk Import from External Sources

Create a script to parse and import from:
- Medical PDFs (using PDF parser)
- Scraped web content (from DermNet NZ)
- CSV/JSON data files

Example:
```javascript
// importFromDermNet.js
const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeAndImport(url) {
    // Parse content
    // Create knowledge entry
    // Save to database
}
```

## Web Scraping Resources (Legal & Ethical)

### DermNet NZ Scraping
```javascript
// Example scraper for DermNet NZ
const scrapeDermNet = async (topicUrl) => {
    const response = await axios.get(topicUrl);
    const $ = cheerio.load(response.data);
    
    return {
        title: $('h1').text(),
        content: $('.content').text(),
        sourceReference: `DermNet NZ: ${topicUrl}`
    };
};
```

**Note:** Always check `robots.txt` and terms of service before scraping.

### Books to Database

For textbooks, consider:
1. **PDF Text Extraction:**
```bash
npm install pdf-parse
```

```javascript
const fs = require('fs');
const pdfParse = require('pdf-parse');

async function parsePDF(pdfPath) {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    return data.text;
}
```

2. **OCR for Scanned Books:**
```bash
npm install tesseract.js
```

## API Usage Examples

### Chat with AI Dermatologist
```javascript
const response = await fetch('http://localhost:3004/api/ai-dermatologist/chat', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        message: "What's the best treatment for acne?",
        conversationHistory: []
    })
});

const data = await response.json();
console.log(data.response); // AI response
console.log(data.sources);  // Knowledge base sources used
```

### Generate Personalized Routine
```javascript
const routine = await fetch('http://localhost:3004/api/ai-dermatologist/routine', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        skinType: 'oily',
        concerns: ['acne', 'large pores'],
        currentProducts: 'CeraVe cleanser',
        budget: 'moderate'
    })
});
```

## Features

### ✅ Implemented
- Real-time AI chat with Gemini
- Knowledge base retrieval
- Context-aware responses
- Conversation history
- Source citations
- Fallback to local responses
- Professional dermatologist persona

### 🚀 Future Enhancements
1. **Image Analysis**
   - Upload skin photos
   - AI-powered skin condition detection
   - Use Gemini Vision

2. **User Profiles**
   - Save skin type and concerns
   - Personalized recommendations
   - Track product usage and results

3. **Product Database Integration**
   - Real product recommendations
   - Ingredient analysis
   - Price comparison

4. **Multi-language Support**
   - Translate knowledge base
   - Multi-lingual responses

5. **Voice Input/Output**
   - Voice-based consultation
   - Text-to-speech responses

## Security Considerations

### API Key Security
- Never commit API keys to public repos
- Use environment variables
- Rotate keys regularly
- Consider using Google Cloud Secret Manager for production

### Rate Limiting
Add to `routes/aiDermatologist.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20 // limit each user to 20 requests per windowMs
});

router.use(limiter);
```

### Content Filtering
```javascript
// Add harmful content detection
const filterHarmfulContent = (text) => {
    const harmfulPatterns = [/* patterns */];
    return harmfulPatterns.some(pattern => text.match(pattern));
};
```

## Cost Optimization

### Gemini API Pricing
- Gemini is free up to 60 requests/minute
- Consider caching common queries
- Implement query similarity detection

### Caching Strategy
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour

// Before API call
const cachedResponse = cache.get(queryHash);
if (cachedResponse) return cachedResponse;

// After API call
cache.set(queryHash, response);
```

## Testing

### Test the Knowledge Base
```javascript
// Test search functionality
const results = await DermatologyKnowledge.find({
    $text: { $search: "acne treatment" }
});
console.log(`Found ${results.length} relevant articles`);
```

### Test AI Responses
```bash
curl -X POST http://localhost:3004/api/ai-dermatologist/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "What is retinol?"}'
```

## Troubleshooting

### Issue: "API Key Invalid"
- Check `.env` file has correct key
- Restart backend server after changing `.env`

### Issue: "No knowledge found"
- Run: `npm run seed:knowledge`
- Check MongoDB connection

### Issue: "Slow responses"
- Reduce conversation history (currently 10 messages)
- Optimize knowledge base queries
- Add caching

## Legal & Medical Disclaimer

⚠️ **Important:** This AI Dermatologist is for educational and informational purposes only:

- NOT a replacement for professional medical advice
- NOT for diagnosing medical conditions
- NOT for prescribing treatments
- Always recommend consulting a licensed dermatologist for serious concerns

Add disclaimer to frontend:
```vue
<div class="disclaimer">
    ⚠️ This AI provides educational information only. 
    Consult a licensed dermatologist for medical advice, 
    diagnosis, or treatment.
</div>
```

## Contributing

To add more knowledge:
1. Research credible sources
2. Add to `seedKnowledgeBase.js`
3. Include proper source citations
4. Mark `verified: true` only for medical-grade sources
5. Test with various queries

## Resources for Further Training

### Academic Databases
- PubMed Central (free full-text articles)
- Google Scholar
- JAMA Dermatology (journal)
- Journal of the American Academy of Dermatology

### Professional Organizations
- American Academy of Dermatology (AAD)
- British Association of Dermatologists (BAD)
- European Academy of Dermatology (EADV)

### Continuing Medical Education
- Medscape Dermatology
- DermNet NZ CME modules
- AAD Virtual Library

## License

Ensure compliance with:
- Medical information usage rights
- Source citation requirements
- Google Gemini API terms of service
- Data privacy regulations (GDPR, HIPAA if applicable)

---

**Built with:**
- Google Gemini AI
- Node.js + Express
- MongoDB
- Vue.js
- Evidence-based dermatology knowledge
