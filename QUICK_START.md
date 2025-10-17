# Quick Start Guide: AI Dermatologist Setup

## Prerequisites
- Node.js installed
- MongoDB connection (already configured)
- Gemini API key (already added to .env)

## Step-by-Step Setup

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

This installs the new `@google/generative-ai` package along with existing dependencies.

### 2. Seed the Knowledge Base
```bash
npm run seed:knowledge
```

Expected output:
```
✅ Connected to MongoDB
Cleared existing knowledge base
Successfully seeded XX knowledge articles
Created search indexes
Database connection closed
```

### 3. Start the Backend Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Expected output:
```
✅ Connected to MongoDB
🚀 Server is running on port 3004
📱 Frontend URL: http://localhost:5175
🔗 API URL: http://localhost:3004
```

### 4. Start the Frontend
In a new terminal:
```bash
cd frontend
npm run dev
```

### 5. Test the AI Dermatologist
1. Open browser to `http://localhost:5175`
2. Navigate to "AI Dermatologist" page
3. Ask a question like: "What's good for oily skin?"
4. Watch the AI respond with knowledge from the database!

## Verification

### Check Backend API
```bash
curl http://localhost:3004/api/health
```

Should return:
```json
{
  "status": "OK",
  "message": "Skin Study API is running",
  "timestamp": "..."
}
```

### Check Knowledge Base
```bash
# In mongo shell or using MongoDB Compass
db.dermatologyknowledges.count()
```

Should show 15+ documents.

### Test AI Endpoint (requires login)
```bash
curl -X POST http://localhost:3004/api/ai-dermatologist/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "What is retinol?",
    "conversationHistory": []
  }'
```

## Understanding the Flow

```
User Question
     ↓
Frontend (AIDermatologist.vue)
     ↓
API Call (/api/ai-dermatologist/chat)
     ↓
Gemini Service
     ├→ Search Knowledge Base
     ├→ Build Context
     └→ Call Gemini AI
          ↓
     Generate Response
          ↓
     Return with Sources
          ↓
Display to User
```

## Adding More Knowledge

### Method 1: Edit seedKnowledgeBase.js
1. Open `backend/seedKnowledgeBase.js`
2. Add new entry to `knowledgeData` array:
```javascript
{
    category: 'skin-conditions',
    subcategory: 'your-subcategory',
    title: 'Your Title',
    content: `Your detailed content...`,
    keywords: ['keyword1', 'keyword2'],
    sourceReference: 'Your source',
    verified: true
}
```
3. Run: `npm run seed:knowledge`

### Method 2: Use addKnowledge.js
1. Open `backend/addKnowledge.js`
2. Add entries to `newKnowledgeEntries` array
3. Run: `node addKnowledge.js`

### Method 3: Direct Database Insert
```javascript
const knowledge = new DermatologyKnowledge({
    category: 'ingredients',
    subcategory: 'moisturizers',
    title: 'Ceramides in Skincare',
    content: 'Detailed content...',
    keywords: ['ceramides', 'barrier', 'moisturizer'],
    sourceReference: 'Source citation',
    verified: true
});
await knowledge.save();
```

## Troubleshooting

### Error: "GEMINI_API_KEY not found"
**Solution:** Check `.env` file in backend folder:
```
GEMINI_API_KEY=AIzaSyD45yKmp57ntK9UmtJOSii5Shky32FuO0w
```

### Error: "Cannot find module '@google/generative-ai'"
**Solution:** 
```bash
cd backend
npm install @google/generative-ai
```

### Error: "Knowledge base empty"
**Solution:**
```bash
cd backend
npm run seed:knowledge
```

### Error: "MongoDB connection failed"
**Solution:** Check `MONGODB_URI` in `.env` file is correct.

### AI Gives Generic Responses
**Cause:** Knowledge base not seeded or not finding relevant articles.
**Solution:**
1. Verify knowledge exists: Check MongoDB
2. Test search: Add console.log in geminiService.js
3. Add more relevant keywords to knowledge entries

### Slow Response Times
**Causes:**
- First request to Gemini is slower (cold start)
- Large conversation history
- Many knowledge articles returned

**Solutions:**
1. Reduce conversation history (currently 10 messages)
2. Add caching for common queries
3. Limit knowledge results to top 3 instead of 5

## Configuration Options

### Adjust AI Temperature (Creativity)
In `backend/services/geminiService.js`:
```javascript
generationConfig: {
    temperature: 0.7, // 0 = factual, 1 = creative
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
}
```

### Change Knowledge Retrieval Count
In `geminiService.js`, `getRelevantKnowledge`:
```javascript
.limit(5) // Change to 3, 5, 10, etc.
```

### Modify Conversation History Length
In `AIDermatologist.vue`:
```javascript
conversationHistory: this.messages.slice(-10) // Change -10 to -5, -15, etc.
```

## Testing Different Queries

Try these to test different knowledge areas:

1. **Ingredients:**
   - "What is niacinamide?"
   - "Tell me about retinol"
   - "What does vitamin C do for skin?"

2. **Routines:**
   - "What's a good routine for oily skin?"
   - "How to care for dry skin?"
   - "Anti-aging routine for mature skin"

3. **Conditions:**
   - "What is acne and how to treat it?"
   - "How to deal with hyperpigmentation?"
   - "What causes rosacea?"

4. **General:**
   - "How does the skin barrier work?"
   - "How to layer skincare products?"
   - "How often should I exfoliate?"

## Next Steps

### Expand Knowledge Base
1. Add more skin conditions (rosacea, eczema, psoriasis)
2. Add more ingredients (ceramides, peptides, bakuchiol)
3. Add professional treatments (chemical peels, lasers)
4. Add product categories (cleansers, moisturizers, sunscreens)

### Enhance Features
1. Add image upload for skin analysis
2. Create user profiles for personalized advice
3. Add product recommendations
4. Implement routine generator
5. Add multilingual support

### Improve AI Responses
1. Fine-tune system prompts
2. Add response templates
3. Implement feedback mechanism
4. Add response caching
5. Optimize knowledge retrieval

## Resources

- **Gemini API Docs:** https://ai.google.dev/docs
- **Knowledge Sources:** See AI_DERMATOLOGIST_README.md
- **MongoDB Docs:** https://www.mongodb.com/docs/
- **Vue.js Docs:** https://vuejs.org/guide/

## Support

If you encounter issues:
1. Check backend logs for errors
2. Check frontend console for errors
3. Verify MongoDB connection
4. Test API endpoints with curl
5. Review knowledge base content

## Success Checklist

- [ ] Backend dependencies installed
- [ ] Knowledge base seeded (15+ articles)
- [ ] Backend server running on port 3004
- [ ] Frontend running on port 5175
- [ ] Can access AI Dermatologist page
- [ ] AI responds to questions
- [ ] Responses cite knowledge sources
- [ ] Conversation history works

---

**You're ready to go! 🚀**

The AI Dermatologist is now powered by Google Gemini and your dermatology knowledge base.
