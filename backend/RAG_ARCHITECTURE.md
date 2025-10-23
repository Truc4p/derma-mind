# RAG System Architecture for AI Dermatologist

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI Dermatologist RAG System                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  Vector DB   │
│  (Vue.js)    │◀────│  (Express)   │◀────│  (Qdrant)    │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                      │
       │                    │                      │
       └────────────────────┴──────────────────────┘
                           │
                   ┌───────▼────────┐
                   │   Gemini AI    │
                   │  (Response)    │
                   └────────────────┘
```

## Data Flow

### 1. Setup Phase (One-Time)

```
┌────────────────────┐
│ Dermatology PDF    │
│ (450 pages)        │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Extract to MD      │
│ (markdown file)    │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Text Splitter      │
│ - Chunk: 1000 char │
│ - Overlap: 200     │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ ~450 Text Chunks   │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Gemini Embeddings  │
│ text-embedding-004 │
│ (768 dimensions)   │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Store in Qdrant    │
│ Collection         │
└────────────────────┘
```

### 2. Query Phase (Every User Question)

```
User types question in frontend
          │
          ▼
┌────────────────────────────────┐
│ POST /api/ai-dermatologist/chat│
│ { message, conversationHistory }│
└───────────────┬────────────────┘
                │
                ▼
      ┌─────────────────┐
      │ aiDermatologist │
      │   Controller    │
      └────────┬────────┘
               │
               ▼
    ┌──────────────────────┐
    │   vectorService      │
    │   .ragQuery()        │
    └──────────┬───────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
┌──────────────┐  ┌──────────────┐
│ 1. Generate  │  │ 2. Search    │
│   Embedding  │──▶│   Qdrant     │
│   (Query)    │  │   Vector DB  │
└──────────────┘  └──────┬───────┘
                         │
                         ▼
               ┌─────────────────┐
               │ Top 5 Relevant  │
               │ Text Chunks     │
               │ (with scores)   │
               └────────┬────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │ Build Context String  │
            │ [Source 1]: chunk...  │
            │ [Source 2]: chunk...  │
            │ [Source 3]: chunk...  │
            └───────────┬───────────┘
                        │
                        ▼
          ┌─────────────────────────┐
          │   geminiService         │
          │   .generateResponse     │
          │   WithContext()         │
          └──────────┬──────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌────────────────┐      ┌───────────────┐
│ System Prompt  │      │  User Query   │
│ + Context      │──────│  + History    │
│ + Instructions │      │               │
└────────┬───────┘      └───────────────┘
         │
         ▼
┌────────────────────────┐
│   Gemini API           │
│   (Google AI)          │
│   Model: gemini-2.5    │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  Generated Response    │
│  (markdown formatted)  │
└───────────┬────────────┘
            │
            ▼
    ┌───────────────┐
    │ Return JSON:  │
    │ - response    │
    │ - sources[]   │
    │ - timestamp   │
    └───────┬───────┘
            │
            ▼
┌────────────────────────┐
│  Frontend Displays     │
│  - Formatted response  │
│  - Source attribution  │
└────────────────────────┘
```

## Component Responsibilities

### vectorService.js
```javascript
Responsibilities:
├── Initialize Qdrant collection
├── Load and chunk knowledge base
├── Generate embeddings (OpenAI)
├── Index documents in Qdrant
├── Search for relevant documents
└── RAG query pipeline

Key Methods:
├── setup() - One-time initialization
├── searchRelevantDocs(query, limit)
├── ragQuery(query, history)
└── getStats() - Collection info
```

### geminiService.js
```javascript
Responsibilities:
├── System prompt configuration
├── Context building from RAG
├── Conversation management
├── Response generation
└── Source attribution

Key Methods:
├── generateResponseWithContext()
│   - Uses RAG-retrieved context
│   - Formats prompt for Gemini
│   - Manages conversation history
└── Original methods still available
```

### aiDermatologistController.js
```javascript
Responsibilities:
├── HTTP request handling
├── Input validation
├── Orchestrate RAG + AI
└── Response formatting

Flow:
1. Receive user message
2. Call vectorService.ragQuery()
3. Pass context to geminiService
4. Return response + sources
```

## Vector Database Details

### Qdrant Collection Schema
```javascript
{
  name: "dermatology_knowledge",
  vectors: {
    size: 768,            // Gemini embedding dimension
    distance: "Cosine"    // Similarity metric
  },
  points: [
    {
      id: 0,
      vector: [0.123, -0.456, ...], // 768 numbers
      payload: {
        text: "chunk content...",
        metadata: {
          source: "skin-care-beyond-basics",
          chunkIndex: 0
        }
      }
    },
    // ... 450+ points
  ]
}
```

### Search Process
```
Query: "What causes acne?"
  │
  ▼
Convert to embedding vector [768 numbers]
  │
  ▼
Cosine similarity search in Qdrant
  │
  ▼
Find top 5 most similar vectors
  │
  ▼
Return corresponding text chunks
  │
  ▼
Scores: [0.89, 0.85, 0.82, 0.78, 0.76]
```

## Benefits of This Architecture

✅ **Accurate**: Uses actual textbook content
✅ **Fast**: Vector search < 100ms
✅ **Scalable**: Easy to add more knowledge
✅ **Traceable**: Know which sources used
✅ **Cost-effective**: ~$0.00002 per query
✅ **No hallucination**: Grounded in facts
✅ **Flexible**: Can adjust retrieval parameters

## Configuration Options

### Tunable Parameters

```javascript
// In vectorService.js

// Chunk size (affects granularity)
chunkSize: 1000        // Current
                       // Smaller = more precise
                       // Larger = more context

// Overlap (prevents info loss)
chunkOverlap: 200      // Current
                       // Higher = more redundancy

// Retrieved docs per query
limit: 5               // Current
                       // More = more context but slower

// Embedding model
modelName: 'text-embedding-004'  // Current (Gemini)
```

## Performance Metrics

### Latency Breakdown
```
Total Response Time: ~2-3 seconds
├── Vector Search: ~50-100ms
├── Embedding Generation: ~200-300ms
├── Gemini Response: ~1.5-2s
└── Network: ~100-200ms
```

### Storage Requirements
```
450 chunks × 768 dimensions × 4 bytes = ~1.4 MB
Metadata: ~500 KB
Total: ~1.9 MB

Qdrant free tier: 1 GB (plenty of room!)
```

### Cost Analysis
```
Setup (one-time):
- Embeddings: FREE (using Gemini!)

Per 1000 queries:
- Embeddings: FREE (using Gemini!)
- Qdrant: Free (local) or $0 (free tier)
- Gemini: ~$0.50-1.00 (varies by response length)

Total: ~$0.50-1.00 per 1000 queries
```

## Monitoring & Debugging

### Health Checks
```bash
# Check Qdrant status
curl http://localhost:6333/

# Collection info
curl http://localhost:6333/collections/dermatology_knowledge

# Count documents
curl http://localhost:6333/collections/dermatology_knowledge/points/count
```

### Logs to Watch
```javascript
// vectorService.js logs:
"📚 Retrieved X knowledge entries for query"
"✅ AI used X out of Y sources"

// Search relevance scores:
Score > 0.8 = Very relevant
Score 0.6-0.8 = Relevant
Score < 0.6 = Marginally relevant
```

## Future Enhancements

Possible improvements:
- [ ] Hybrid search (keyword + vector)
- [ ] Re-ranking retrieved results
- [ ] Query expansion
- [ ] Caching popular queries
- [ ] Multi-source knowledge bases
- [ ] Feedback loop for quality
- [ ] A/B testing different prompts
