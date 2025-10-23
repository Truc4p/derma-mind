# RAG Vector Database Setup Guide

This guide will help you set up a Retrieval-Augmented Generation (RAG) system for the AI Dermatologist using vector embeddings and Qdrant.

## Architecture Overview

```
User Query → Vector Search (Qdrant) → Retrieve Relevant Chunks → 
    → Combine with Query → Gemini AI → Response with Sources
```

## Prerequisites

1. **Qdrant Vector Database** - Two options:
   - **Option A (Local)**: Run Qdrant locally using Docker
   - **Option B (Cloud)**: Use Qdrant Cloud (free tier available)

2. **Gemini API Key** - For response generation AND embeddings (100% FREE for embeddings!)

## Step 1: Install Dependencies

```bash
cd backend
npm install @qdrant/js-client-rest @langchain/google-genai langchain
# npm install @qdrant/js-client-rest @langchain/google-genai langchain --legacy-peer-deps
```

## Step 2: Choose Qdrant Setup

### Option A: Local Qdrant (Recommended for Development)

1. **Install Docker** (if not already installed)

2. **Run Qdrant using Docker:**

```bash
docker pull qdrant/qdrant
docker run -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage:z \
    qdrant/qdrant
```

3. **Verify Qdrant is running:**
   - Open http://localhost:6333/dashboard in your browser
   - You should see the Qdrant dashboard

### Option B: Qdrant Cloud (Recommended for Production)

1. **Sign up for Qdrant Cloud:**
   - Go to https://cloud.qdrant.io/
   - Create a free account
   - Create a new cluster

2. **Get your credentials:**
   - Copy the cluster URL (e.g., `https://xyz-example.eu-central.aws.cloud.qdrant.io:6333`)
   - Copy your API key

## Step 3: Configure Environment Variables

Add these to your `.env` file:

```env
# Gemini API Key (required - used for both responses AND embeddings)
GEMINI_API_KEY=your-gemini-api-key-here

# Embedding Provider: Use 'gemini' (FREE!)
EMBEDDING_PROVIDER=gemini

# Qdrant Configuration
# For local Docker:
QDRANT_URL=http://localhost:6333

# For Qdrant Cloud:
# QDRANT_URL=https://your-cluster-url.cloud.qdrant.io:6333
# QDRANT_API_KEY=your-qdrant-api-key
```

## Step 4: Initialize the Vector Database

This is a **ONE-TIME setup** that indexes your knowledge base:

```bash
cd backend
node scripts/setupVectorDB.js
```

This script will:
1. Create a Qdrant collection
2. Load the dermatology textbook (markdown file)
3. Split it into chunks
4. Generate embeddings for each chunk
5. Store embeddings in Qdrant

**Expected output:**
```
🚀 Starting Vector Database Setup...
Collection 'dermatology_knowledge' created successfully
Split knowledge base into 450 chunks
Indexing 450 documents...
Indexed batch 1/5
...
✅ Setup Complete!
Total Documents: 450
```

## Step 5: Test the System

### Test 1: Vector Search

Create `backend/scripts/testRAG.js`:

```javascript
require('dotenv').config();
const vectorService = require('../services/vectorService');

async function test() {
    const queries = [
        "What causes acne?",
        "How to treat wrinkles?",
        "Best ingredients for sensitive skin"
    ];
    
    for (const query of queries) {
        console.log(`\n📝 Query: ${query}`);
        const results = await vectorService.searchRelevantDocs(query, 3);
        results.forEach((doc, i) => {
            console.log(`  ${i+1}. Score: ${doc.score.toFixed(4)}`);
            console.log(`     ${doc.content.substring(0, 100)}...`);
        });
    }
}

test();
```

Run it:
```bash
node scripts/testRAG.js
```

### Test 2: Full RAG Pipeline

Start your backend server:
```bash
npm start
```

Test the API:
```bash
curl -X POST http://localhost:5000/api/ai-dermatologist/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the best treatments for acne?",
    "conversationHistory": []
  }'
```

## How It Works

### 1. Indexing (One-time setup)
```
Dermatology PDF → Extract Text → Split into Chunks (1000 chars) 
→ Generate Embeddings → Store in Qdrant
```

### 2. Query Processing (Every user question)
```
User Question → Generate Embedding → Search Similar Chunks in Qdrant 
→ Retrieve Top 5 Relevant Chunks → Pass to Gemini with Query 
→ Generate Response
```

## Vector Database Specifications

- **Collection Name**: `dermatology_knowledge`
- **Vector Size**: 768 (Gemini)
- **Distance Metric**: Cosine similarity
- **Chunk Size**: 1000 characters
- **Chunk Overlap**: 200 characters
- **Retrieved Chunks per Query**: 5 (configurable)

## Cost Considerations

### Gemini Embeddings (text-embedding-004) ✨
- **Setup (one-time)**: **FREE** 🎉
- **Per query**: **FREE** 🎉
- **Unlimited queries**: **FREE** 🎉

### Qdrant Storage
- **Local Docker**: Free
- **Qdrant Cloud Free Tier**: 1GB storage (plenty for this use case)

### Gemini API for Responses
- Already configured, same costs as before

### 💡 Total Cost Summary

**Using Gemini Embeddings:**
- Setup: **$0**
- Per 1000 queries: **$0** for embeddings + ~$1 for Gemini responses = **~$1**

**Savings with Gemini**: Free embeddings forever! 🎉

## Advantages of This Approach

✅ **Accurate**: Retrieves exact text from the textbook
✅ **Scalable**: Can add more PDFs/knowledge sources easily
✅ **Cost-effective**: Embeddings are very cheap
✅ **Fast**: Vector search is extremely fast (<100ms)
✅ **No hallucination**: AI responds based on retrieved facts
✅ **Source attribution**: Shows which parts of the textbook were used

## Adding More Knowledge Sources

To add more PDFs or documents:

1. Convert to markdown and place in `knowledge-sources/extracted-content/`
2. Update `vectorService.js` to include new files
3. Re-run: `node scripts/setupVectorDB.js`

Example:
```javascript
// In vectorService.js loadKnowledgeBase() method
const files = [
    'skin-care-beyond-the-basics-4th_figures.md',
    'advanced-dermatology-guide.md',  // Add new file
    'cosmetic-chemistry-handbook.md'   // Add another
];
```

## Monitoring & Maintenance

### Check Vector DB Status
```bash
# Get statistics
curl http://localhost:6333/collections/dermatology_knowledge
```

### Clear and Rebuild Index
```bash
# Delete collection
curl -X DELETE http://localhost:6333/collections/dermatology_knowledge

# Re-run setup
node scripts/setupVectorDB.js
```

## Troubleshooting

### Issue: "Connection refused to Qdrant"
- Make sure Docker container is running: `docker ps`
- Check URL in .env matches Qdrant setup

### Issue: "Gemini API key not found"
- Verify GEMINI_API_KEY in .env file
- Verify EMBEDDING_PROVIDER=gemini in .env

### Issue: "No results found"
- Check if collection was created: Visit http://localhost:6333/dashboard
- Verify documents were indexed: Check point count
- Re-run setup script if needed

## Alternative: Using Pinecone Instead

If you prefer Pinecone over Qdrant:

1. **Install Pinecone:**
```bash
npm install @pinecone-database/pinecone
```

2. **Update vectorService.js** to use Pinecone client
3. Similar concepts apply

**Why Qdrant over Pinecone?**
- Open source
- Can run locally
- No vendor lock-in
- Free self-hosted option
- Similar performance

## Next Steps

1. ✅ Complete setup following this guide
2. ✅ Test with sample queries
3. ✅ Monitor quality of responses
4. 🔄 Fine-tune chunk size/overlap if needed
5. 📈 Add more knowledge sources
6. 🚀 Deploy to production

## Support

For issues or questions:
- Check Qdrant docs: https://qdrant.tech/documentation/
- Check LangChain docs: https://js.langchain.com/docs/
- Review vector search best practices

Happy building! 🎉
