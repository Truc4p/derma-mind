# Database Seed Scripts

Scripts for populating the database with initial data.

## Available Scripts

### seedIngredients.js
Seeds the ingredients collection with comprehensive skincare ingredient data.

**Data Includes:**
- 25+ common skincare ingredients
- Benefits, safety information, usage guidelines
- Ratings and reviews
- Categories and tags

**Usage:**
```bash
node scripts/seed/seedIngredients.js
```

**What it does:**
1. Connects to MongoDB
2. Clears existing ingredients
3. Inserts sample ingredients
4. Creates text search index
5. Displays statistics

---

### seedEducation.js
Seeds the education content collection with detailed articles.

**Data Includes:**
- Skincare fundamentals
- Ingredient science
- Routine building guides
- Acne education
- Myth-busting articles

**Usage:**
```bash
node scripts/seed/seedEducation.js
```

**What it does:**
1. Connects to MongoDB
2. Clears existing education content
3. Inserts 5+ comprehensive articles
4. Creates search indexes
5. Reports success

---

### seedExtractedKnowledge.js
Imports extracted knowledge from JSON file to MongoDB.

**Data Source:**
`knowledge-sources/pdfs/extracted-knowledge.json`

**Features:**
- Batch processing (100 entries per batch)
- Progress indicators
- Error tracking and reporting
- Optional database clearing

**Usage:**
```bash
node scripts/seed/seedExtractedKnowledge.js
```

**What it does:**
1. Reads extracted-knowledge.json
2. Clears existing knowledge (optional)
3. Imports in batches
4. Creates search indexes
5. Displays statistics

---

### seedKnowledgeBase.js
Seeds curated dermatology knowledge base.

**Data Includes:**
- Skin conditions (acne, hyperpigmentation, etc.)
- Ingredients (retinoids, AHAs, BHAs, etc.)
- Treatment routines by skin type
- Anti-aging protocols
- Sunscreen science

**Usage:**
```bash
node scripts/seed/seedKnowledgeBase.js
```

**What it does:**
1. Connects to MongoDB
2. Clears existing knowledge
3. Inserts curated knowledge articles
4. Creates search indexes
5. Reports completion

## Running Order

For a fresh database setup, run in this order:

```bash
# 1. Seed ingredients
node scripts/seed/seedIngredients.js

# 2. Seed education content
node scripts/seed/seedEducation.js

# 3. Seed knowledge base (choose one)
node scripts/seed/seedKnowledgeBase.js
# OR
node scripts/seed/seedExtractedKnowledge.js
```

## Environment Requirements

Ensure `.env` file contains:
```env
MONGODB_URI=your_mongodb_connection_string
```

## Common Issues

### Issue: "File not found" error
**Solution:** Make sure you're running the script from the backend directory

### Issue: Connection timeout
**Solution:** Check your MongoDB URI and network connection

### Issue: Duplicate key errors
**Solution:** The script should clear existing data first. If not, manually clear the collection.

## Data Volume

- **Ingredients:** ~25 entries
- **Education:** ~5-6 comprehensive articles  
- **Knowledge Base:** ~15-20 curated entries
- **Extracted Knowledge:** ~55 entries from JSON

## Notes

- All scripts clear existing data before inserting new data
- Progress is logged to console
- Errors are reported with details
- Database connection is closed after completion
