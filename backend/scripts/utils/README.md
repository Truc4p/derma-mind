# Utility Scripts

Helper scripts for debugging, validation, and adding data to the database.

## Available Scripts

### addKnowledge.js
Helper script for adding new knowledge entries to the database.

**Features:**
- Add single knowledge entry
- Add multiple entries at once
- Includes example entries
- Can be used as a module

**Usage:**

As a script (with example data):
```bash
node scripts/utils/addKnowledge.js
```

As a module in other scripts:
```javascript
const { addKnowledge, addMultipleKnowledge } = require('./scripts/utils/addKnowledge');

// Add single entry
await addKnowledge({
    category: 'skin-conditions',
    subcategory: 'acne',
    title: 'My Knowledge Entry',
    content: 'Detailed content...',
    keywords: ['keyword1', 'keyword2'],
    sourceReference: 'Source info',
    verified: true
});

// Add multiple entries
const results = await addMultipleKnowledge([entry1, entry2, entry3]);
```

**Example Entries Included:**
- Rosacea management
- Atopic dermatitis (eczema)
- Peptides in anti-aging
- Chemical peels guide

---

### debugInsert.js
Debug script for troubleshooting database insertions.

**Features:**
- Inserts entries one-by-one
- Identifies problematic entries
- Detailed error reporting
- Success/failure tracking

**Usage:**
```bash
node scripts/utils/debugInsert.js
```

**What it does:**
1. Reads extracted-knowledge.json
2. Clears existing database
3. Inserts entries individually
4. Reports which entries fail
5. Shows error messages for failed entries

**When to use:**
- When batch inserts are failing
- To identify invalid data
- To troubleshoot specific entries
- To understand why imports fail

---

### validateEntries.js
Validates knowledge entries before database insertion.

**Features:**
- Checks required fields
- Validates category values
- Identifies empty or missing data
- Detailed error reporting

**Usage:**
```bash
node scripts/utils/validateEntries.js
```

**What it validates:**
- Required fields: category, subcategory, title, content, sourceReference
- Valid categories: skin-conditions, ingredients, treatments, routines, cosmetics, procedures, general-advice
- Non-empty values

**Output:**
- Lists all entries with issues
- Shows specific problems per entry
- Summary of valid vs. invalid entries

**When to use:**
- Before seeding database
- After modifying JSON data
- To ensure data quality
- To troubleshoot import issues

## Workflow Recommendations

### Adding New Knowledge

1. **Prepare your data** in the format used by addKnowledge.js
2. **Validate** using validateEntries.js (if working with JSON)
3. **Add** using addKnowledge.js
4. **Verify** the addition in your database

### Debugging Import Issues

1. **Validate** your JSON file with validateEntries.js
2. **Fix** any reported issues
3. **Try batch import** with seed scripts
4. If it fails, **use debugInsert.js** to find problematic entries
5. **Fix** the problematic entries
6. **Re-run** the import

### Data Quality Checks

```bash
# 1. Validate entries
node scripts/utils/validateEntries.js

# 2. If validation passes, try seeding
node scripts/seed/seedExtractedKnowledge.js

# 3. If seeding fails, debug
node scripts/utils/debugInsert.js
```

## Data Format

All knowledge entries should follow this structure:

```javascript
{
    category: 'string',           // Required
    subcategory: 'string',        // Required
    title: 'string',              // Required
    content: 'string',            // Required (can be long)
    keywords: ['string'],         // Optional array
    sourceReference: 'string',    // Required
    verified: boolean             // Optional
}
```

### Valid Categories
- skin-conditions
- ingredients
- treatments
- routines
- cosmetics
- procedures
- general-advice

## Notes

- Run from backend directory
- Requires MongoDB connection
- Uses relative paths for data files
- Logs detailed output to console

## Troubleshooting

### "Cannot find module" errors
**Solution:** Check that you're running from the backend directory

### Path not found errors
**Solution:** Verify the relative paths in the scripts match your file structure

### Connection errors
**Solution:** Check your .env file has the correct MONGODB_URI
