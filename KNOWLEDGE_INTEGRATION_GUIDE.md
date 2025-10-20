# 📚 Knowledge Integration Guide

## Overview
This guide explains how to integrate your extracted knowledge from `extracted-knowledge.json` into the Gemini AI Dermatologist system.

## Current Status ✅

1. ✅ **Extracted Knowledge**: 9,614 entries in `backend/knowledge-sources/pdfs/extracted-knowledge.json`
2. ✅ **Database Model**: `DermatologyKnowledge` model defined in `backend/models/DermatologyKnowledge.js`
3. ✅ **Gemini Service**: `backend/services/geminiService.js` ready to query knowledge
4. ✅ **Frontend**: `frontend/src/views/AIDermatologist.vue` ready to display responses
5. ✅ **Import Script**: `backend/seedExtractedKnowledge.js` created to import knowledge

## Step-by-Step Integration Process

### Step 1: Verify MongoDB Atlas Connection

Your project is configured to use **MongoDB Atlas** (cloud database), so you don't need to install or run MongoDB locally.

**Connection String:**
```
mongodb+srv://mongo-api:7TZYsdhwiXhiKRp9@cluster0.18pi3.mongodb.net/skinStudyWeb?retryWrites=true&w=majority
```

**Verify in `.env`:**
```bash
cat backend/.env | grep MONGODB_URI
# Should show: MONGODB_URI=mongodb+srv://mongo-api:...
```

### Step 2: Configure Environment Variables

Your `backend/.env` file should already have the MongoDB Atlas connection:

```env
# MongoDB Atlas Cloud Connection
MONGODB_URI=mongodb+srv://mongo-api:7TZYsdhwiXhiKRp9@cluster0.18pi3.mongodb.net/skinStudyWeb?retryWrites=true&w=majority

# Gemini API Key
GEMINI_API_KEY=AIzaSyA02nsG75qUblT_aiS8r8x2iLcIg9k18mQ

# Server Port
PORT=3004
```

### Step 3: Import Extracted Knowledge to Database

Run the seed script to import all 9,614 knowledge entries:

```bash
cd backend
node seedExtractedKnowledge.js
```

**Expected Output:**
```
🚀 Starting knowledge base import...
✅ Connected to MongoDB Atlas
📂 Reading extracted knowledge from: /path/to/extracted-knowledge.json
📊 Found 9614 knowledge entries

🗑️  Clearing existing knowledge base...
   Deleted X existing entries

📥 Importing knowledge entries...
   Progress: 100% (9614/9614)

✅ Import completed!
   Successfully imported: 9614 entries
   
📇 Creating search indexes...
✅ Search indexes created

📊 Knowledge Base Statistics:
   Total categories: X
   Categories: cell-biology, anatomy-physiology, skin-conditions, ...
   Total entries in database: 9614

🔍 Testing knowledge retrieval...
✅ Sample entry found:
   Title: The Cell: Basic Unit and Stratum Corneum Distinction
   Category: cell-biology
   Keywords: cell, building blocks, biochemical processes...

✨ Knowledge base is ready to use!
👋 Database connection closed
```

### Step 4: Verify Database Import

You can verify the import using MongoDB Atlas web interface or MongoDB Compass:

**Using MongoDB Compass:**
1. Connect to: `mongodb+srv://mongo-api:7TZYsdhwiXhiKRp9@cluster0.18pi3.mongodb.net/skinStudyWeb`
2. Select database: `skinStudyWeb`
3. Check collection: `dermatologyknowledges`
4. Should show ~9,614 documents

**Using MongoDB Shell (mongosh):**
```bash
mongosh "mongodb+srv://mongo-api:7TZYsdhwiXhiKRp9@cluster0.18pi3.mongodb.net/skinStudyWeb"
db.dermatologyknowledges.countDocuments()  # Should return 9614
db.dermatologyknowledges.findOne()         # View a sample document
```

### Step 5: Start the Backend Server

```bash
cd backend
npm install  # If you haven't already
npm start    # or node server.js
```

**Expected Output:**
```
Server running on port 3004
MongoDB connected: MongoDB Atlas
```

### Step 6: Start the Frontend

In a new terminal:

```bash
cd frontend
npm install  # If you haven't already
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### Step 7: Test the AI Dermatologist

1. Open your browser to `http://localhost:5173/`
2. Navigate to **AI Dermatologist** page
3. Try asking questions like:
   - "What is the structure of skin cells?"
   - "Explain the stratum corneum"
   - "What are keratinocytes?"
   - "Tell me about collagen and elastin"
   - "How does skin aging work?"

## How It Works 🔄

### Query Flow

```
User Question (Frontend)
    ↓
API Call to /ai-dermatologist/chat (Backend Route)
    ↓
geminiService.generateResponse()
    ↓
┌─────────────────────────────────┐
│ 1. Extract keywords from query  │
│ 2. Search MongoDB for relevant  │
│    knowledge (keywords + text)  │
│ 3. Build context from results   │
│ 4. Send to Gemini AI with ctx   │
│ 5. Get AI-generated response    │
│ 6. Append source references     │
└─────────────────────────────────┘
    ↓
Response with Sources (Frontend Display)
```

### Example Knowledge Retrieval

When a user asks: **"What is collagen?"**

1. **Keyword Extraction**: `["collagen", "skin", "protein"]`

2. **Database Query**:
```javascript
DermatologyKnowledge.find({
  $or: [
    { keywords: { $in: ["collagen", "skin", "protein"] } },
    { $text: { $search: "collagen" } }
  ]
}).limit(5)
```

3. **Retrieved Knowledge** (example):
```json
{
  "title": "Collagen",
  "content": "Collagen is made of large, long-chain molecular proteins...",
  "category": "general-advice",
  "subcategory": "cell-biology",
  "keywords": ["collagen", "protein", "skin firmness", ...],
  "sourceReference": "Skin Care: Beyond the Basics (4th Edition) - Chapter 1",
  "verified": true
}
```

4. **Context Building**:
```
Relevant Knowledge Base Information:

1. Collagen (general-advice)
Collagen is made of large, long-chain molecular proteins. It is not 
flexible and provides the skin with its firmness...
Source: Skin Care: Beyond the Basics (4th Edition) - Chapter 1
```

5. **Gemini AI Response**: Uses this context to generate an accurate, detailed response

6. **Frontend Display**: Shows the response with clickable source references

## Gemini Service Features 🤖

The `geminiService.js` provides these capabilities:

### 1. Context-Aware Responses
```javascript
// Automatically searches knowledge base for relevant info
const relevantKnowledge = await this.getRelevantKnowledge(userMessage);
```

### 2. Conversation History
```javascript
// Maintains context from previous messages
generateResponse(userMessage, conversationHistory)
```

### 3. Source Citations
```javascript
// Every response includes sources
{
  response: "Detailed answer...\n\n**Sources:**\n1. Title - Source",
  knowledgeSources: [{ title, source, chapter, page }]
}
```

### 4. Query Analysis
```javascript
// Categorizes and prioritizes queries
analyzeQuery(query) // Returns: concern, skin type, urgency, keywords
```

### 5. Custom Routines
```javascript
// Generates personalized skincare routines
generateSkincareRoutine({ skinType, concerns, budget })
```

## Database Schema 📋

The knowledge entries follow this structure:

```javascript
{
  category: String,           // Main category (e.g., "cell-biology")
  subcategory: String,        // Subcategory (e.g., "cell-structure")
  title: String,              // Entry title
  content: String,            // Detailed content (indexed for text search)
  keywords: [String],         // Search keywords (indexed)
  chapterNumber: String,      // Source chapter
  chapterTitle: String,       // Chapter name
  pageReference: String,      // Page number
  sourceReference: String,    // Full source citation
  verified: Boolean,          // Verification status
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}
```

## Optimizing Search Results 🎯

### Current Search Strategy

The system uses a **hybrid search approach**:

1. **Keyword Matching**: Fast, exact matches
2. **Full-Text Search**: Fuzzy, comprehensive matches

```javascript
DermatologyKnowledge.find({
  $or: [
    { keywords: { $in: extractedKeywords } },  // Keyword match
    { $text: { $search: userQuery } }          // Text search
  ]
}).limit(5)
```

### Improving Search Results

You can adjust the `geminiService.js` to improve relevance:

**1. Increase result limit for complex queries:**
```javascript
// In geminiService.js, line ~33
const knowledge = await this.getRelevantKnowledge(userMessage, limit = 10); // Increased from 5
```

**2. Add category filtering:**
```javascript
async getRelevantKnowledge(userQuery, category = null, limit = 5) {
    const query = {
        $or: [
            { keywords: { $in: keywords } },
            { $text: { $search: userQuery } }
        ]
    };
    
    if (category) {
        query.category = category;
    }
    
    return await DermatologyKnowledge.find(query).limit(limit);
}
```

**3. Add relevance scoring:**
```javascript
.find({...})
.sort({ score: { $meta: "textScore" } })
.limit(limit)
```

## Troubleshooting 🔧

### Issue: "MongoDB connection failed"
**Solution**: Check your internet connection (using cloud MongoDB Atlas)
```bash
# Test connection
ping cluster0.18pi3.mongodb.net

# Verify credentials in .env
cat backend/.env | grep MONGODB_URI
```

### Issue: "Authentication failed"
**Solution**: Verify the MongoDB Atlas credentials are correct in `.env`

### Issue: "Import script fails"
**Solution**: Check file path and permissions
```bash
ls -la backend/knowledge-sources/pdfs/extracted-knowledge.json
```

### Issue: "Responses are generic"
**Solution**: 
1. Check if knowledge is being retrieved (add console.log in geminiService.js)
2. Increase limit in `getRelevantKnowledge()`
3. Verify keyword extraction is working

## Advanced Configuration ⚙️

### Adjusting AI Temperature

For more precise responses (less creative):
```javascript
// In geminiService.js
generationConfig: {
    temperature: 0.5,  // Lower = more focused (default: 0.7)
    topP: 0.8,
    topK: 40,
}
```

### Adding Custom System Instructions

Modify the system context in `geminiService.js`:
```javascript
this.systemContext = `You are a Board-Certified Virtual Dermatologist...
[Add your custom instructions here]
Always prioritize evidence-based information from the knowledge base.
If information conflicts, cite the source with the most recent date.`;
```

### Enabling Debug Mode

Add logging to track knowledge retrieval:
```javascript
async getRelevantKnowledge(userQuery, limit = 5) {
    const knowledge = await DermatologyKnowledge.find({...});
    console.log(`📚 Retrieved ${knowledge.length} knowledge items for: "${userQuery}"`);
    knowledge.forEach(k => console.log(`  - ${k.title}`));
    return knowledge;
}
```

## Testing the Integration ✅

### Test Queries

Try these queries to verify the system is working:

1. **Cell Biology**: "What are the components of a cell?"
2. **Skin Structure**: "Explain the epidermis layers"
3. **Aging**: "How does collagen affect skin aging?"
4. **Ingredients**: "What is hyaluronic acid?"
5. **Treatments**: "What are the benefits of retinol?"

### Expected Behavior

Each response should:
- ✅ Be relevant to the query
- ✅ Include information from knowledge base
- ✅ Cite sources at the end
- ✅ Be well-formatted (Markdown)
- ✅ Include chapter/page references when available

## Next Steps 🚀

1. **Expand Knowledge Base**: Add more PDF sources
2. **Improve Search**: Implement semantic search (embeddings)
3. **Add Filters**: Category, subcategory filters in UI
4. **User Feedback**: Track helpful/unhelpful responses
5. **Export Conversations**: Allow users to download chat history

## Resources 📖

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Gemini AI Documentation](https://ai.google.dev/docs)
- [Vue.js Documentation](https://vuejs.org/)
- [Express.js Documentation](https://expressjs.com/)

## Support 💬

If you encounter issues:
1. Check the backend console for errors
2. Check the frontend console (browser DevTools)
3. Verify MongoDB connection
4. Test API endpoints directly (Postman/curl)

---

**Last Updated**: $(date)
**Knowledge Entries**: 9,614
**Source**: Skin Care: Beyond the Basics (4th Edition)
