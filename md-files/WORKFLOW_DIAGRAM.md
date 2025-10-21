# Knowledge Integration Workflow

## Step-by-Step Process

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Import Knowledge to Database                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
        ┌────────────────────────────────────────┐
        │  npm run seed:extracted                │
        └────────────────────────────────────────┘
                              │
                              ↓
        ┌────────────────────────────────────────┐
        │  Read extracted-knowledge.json         │
        │  (9,614 entries)                       │
        └────────────────────────────────────────┘
                              │
                              ↓
        ┌────────────────────────────────────────┐
        │  Insert into MongoDB                   │
        │  Collection: dermatologyknowledges     │
        └────────────────────────────────────────┘
                              │
                              ↓
        ┌────────────────────────────────────────┐
        │  Create search indexes                 │
        │  - keywords index                      │
        │  - text search index                   │
        └────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  ✅ Knowledge Base Ready                                    │
└─────────────────────────────────────────────────────────────┘




┌─────────────────────────────────────────────────────────────┐
│  Step 2: User Asks Question                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
        ┌────────────────────────────────────────┐
        │  User types: "What is collagen?"       │
        │  (in AIDermatologist.vue)              │
        └────────────────────────────────────────┘
                              │
                              ↓
        ┌────────────────────────────────────────┐
        │  Frontend sends POST request           │
        │  to /api/ai-dermatologist/chat         │
        └────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Backend Processes Request                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
        ┌────────────────────────────────────────┐
        │  Route: aiDermatologist.js             │
        │  Receives message                      │
        └────────────────────────────────────────┘
                              │
                              ↓
        ┌────────────────────────────────────────┐
        │  Call: geminiService.generateResponse()│
        └────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Search Knowledge Base                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
        ┌────────────────────────────────────────┐
        │  Extract keywords:                     │
        │  ["collagen", "skin", "protein"]       │
        └────────────────────────────────────────┘
                              │
                              ↓
        ┌────────────────────────────────────────┐
        │  Query MongoDB:                        │
        │  Find entries matching keywords        │
        │  or text search                        │
        └────────────────────────────────────────┘
                              │
                              ↓
        ┌────────────────────────────────────────┐
        │  Results Found (up to 5):              │
        │  1. "Collagen in the Skin"             │
        │  2. "Collagen and Elastin"             │
        │  3. "Fibroblasts"                      │
        │  4. "Skin Structure"                   │
        │  5. "Aging Process"                    │
        └────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 5: Build Context for AI                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
        ┌────────────────────────────────────────┐
        │  System Context:                       │
        │  "You are a dermatologist..."          │
        └────────────────────────────────────────┘
                              │
                              ↓
        ┌────────────────────────────────────────┐
        │  Knowledge Context:                    │
        │  "Relevant Information:                │
        │   1. Collagen in the Skin              │
        │   Collagen is made of large...         │
        │   Source: Chapter 1, Page 7            │
        │                                        │
        │   2. Fibroblasts                       │
        │   Specialized cells that produce...    │
        │   Source: Chapter 1, Page 7"           │
        └────────────────────────────────────────┘
                              │
                              ↓
        ┌────────────────────────────────────────┐
        │  User Question:                        │
        │  "What is collagen?"                   │
        └────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 6: Send to Gemini AI                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
        ┌────────────────────────────────────────┐
        │  Full Prompt =                         │
        │  System Context +                      │
        │  Knowledge Context +                   │
        │  User Question                         │
        └────────────────────────────────────────┘
                              │
                              ↓
        ┌────────────────────────────────────────┐
        │  Gemini AI processes with context      │
        │  Generates informed response           │
        └────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 7: Format Response                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
        ┌────────────────────────────────────────┐
        │  AI Response:                          │
        │  "Collagen is a crucial protein that   │
        │   provides skin with firmness and      │
        │   structure. It's composed of long-    │
        │   chain amino acids and is produced    │
        │   by specialized cells called          │
        │   fibroblasts..."                      │
        └────────────────────────────────────────┘
                              │
                              ↓
        ┌────────────────────────────────────────┐
        │  Append Sources:                       │
        │  "**Sources:**                         │
        │   1. Collagen in the Skin - Chapter 1  │
        │   2. Fibroblasts - Chapter 1, Page 7"  │
        └────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 8: Return to Frontend                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
        ┌────────────────────────────────────────┐
        │  JSON Response:                        │
        │  {                                     │
        │    response: "Collagen is...",         │
        │    sources: [...],                     │
        │    timestamp: "2025-..."               │
        │  }                                     │
        └────────────────────────────────────────┘
                              │
                              ↓
        ┌────────────────────────────────────────┐
        │  Frontend receives response            │
        │  Parses markdown                       │
        │  Displays formatted message            │
        └────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  ✅ User sees answer with sources                          │
└─────────────────────────────────────────────────────────────┘




┌─────────────────────────────────────────────────────────────┐
│  Data Flow Summary                                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐
│   User       │
└──────┬───────┘
       │ Question
       ↓
┌──────────────┐     HTTP      ┌──────────────┐
│  Frontend    │ ───────────→  │  Backend     │
│  (Vue.js)    │ ←──────────   │  (Express)   │
└──────────────┘    Response   └──────┬───────┘
                                       │
                                       │ Query
                                       ↓
                                ┌──────────────┐
                                │  MongoDB     │
                                │  Knowledge   │
                                │  (9,614)     │
                                └──────┬───────┘
                                       │
                                       │ Results
                                       ↓
                                ┌──────────────┐
                                │  Gemini AI   │
                                │  (Google)    │
                                └──────────────┘




┌─────────────────────────────────────────────────────────────┐
│  Knowledge Entry Structure                                 │
└─────────────────────────────────────────────────────────────┘

{
  "category": "cell-biology",           ← Main category
  "subcategory": "cell-structure",      ← Specific area
  "title": "Collagen in the Skin",      ← Entry title
  "content": "Collagen is made of...",  ← Full explanation
  "keywords": [                         ← Search terms
    "collagen",
    "protein",
    "skin firmness",
    "fibroblasts"
  ],
  "chapterNumber": "1",                 ← Source chapter
  "chapterTitle": "The Structure...",   ← Chapter name
  "pageReference": "Page 7",            ← Exact page
  "sourceReference": "Skin Care:...",   ← Full citation
  "verified": true                      ← Quality flag
}




┌─────────────────────────────────────────────────────────────┐
│  Search Strategy                                           │
└─────────────────────────────────────────────────────────────┘

User Query: "What is collagen?"
                │
                ↓
        Extract Keywords
                │
                ├─→ "collagen"
                ├─→ "what"
                └─→ "is"
                │
                ↓
        Filter Keywords (length > 3)
                │
                └─→ "collagen"
                │
                ↓
        MongoDB Query
                │
                ├─→ Keyword Match: { keywords: { $in: ["collagen"] } }
                │   Results: 5 entries
                │
                └─→ Text Search: { $text: { $search: "collagen" } }
                    Results: 8 entries
                │
                ↓
        Combine & Deduplicate
                │
                ↓
        Sort by Relevance
                │
                ↓
        Limit to 5 results
                │
                ↓
        Return to Gemini Service




┌─────────────────────────────────────────────────────────────┐
│  Performance Metrics                                       │
└─────────────────────────────────────────────────────────────┘

Import Time:        ~30 seconds (9,614 entries)
Query Time:         50-200ms (keyword + text search)
AI Response Time:   2-5 seconds (Gemini processing)
Total Response:     3-6 seconds (end-to-end)
Database Size:      ~15MB (MongoDB)
Memory Usage:       ~50MB (Node.js process)




┌─────────────────────────────────────────────────────────────┐
│  Example Complete Interaction                              │
└─────────────────────────────────────────────────────────────┘

👤 User: "What causes wrinkles?"

🔍 System:
   1. Extracts keywords: ["wrinkles", "causes"]
   2. Queries MongoDB → Finds 5 relevant entries:
      - "Elastin and Skin Elasticity"
      - "Collagen Production Decline"
      - "Intrinsic Aging"
      - "UV Damage and Photoaging"
      - "Free Radicals"
   3. Builds context with all 5 entries
   4. Sends to Gemini AI

🤖 Gemini AI:
   "Wrinkles are caused by multiple factors:
   
   **Intrinsic Aging:**
   As we age, fibroblast activity decreases around age 25,
   leading to reduced collagen and elastin production...
   
   **Extrinsic Factors:**
   UV exposure damages collagen fibers...
   
   **Sources:**
   1. Elastin and Skin Elasticity - Chapter 1, Page 7
   2. Intrinsic Aging - Chapter 1, Page 7"

✅ User sees: Comprehensive answer with scientific sources
