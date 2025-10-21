# Backend Scripts

This directory contains utility and database seeding scripts for the Skin Study application.

## Directory Structure

```
scripts/
├── seed/           # Database seeding scripts
├── utils/          # Utility and helper scripts
└── README.md       # This file
```

## Script Categories

### 1. Seed Scripts (`/seed`)
Scripts for populating the database with initial data.

- **seedIngredients.js** - Seeds the ingredients database with sample skincare ingredients
- **seedEducation.js** - Seeds the education content database with articles
- **seedExtractedKnowledge.js** - Imports extracted knowledge from JSON files
- **seedKnowledgeBase.js** - Seeds comprehensive dermatology knowledge base

### 2. Utils Scripts (`/utils`)
Helper scripts for debugging, validation, and adding data.

- **addKnowledge.js** - Helper for adding new knowledge entries to the database
- **debugInsert.js** - Debug script for troubleshooting database insertions
- **validateEntries.js** - Validates knowledge entries before insertion

## Usage

### Running Seed Scripts

All seed scripts should be run from the backend directory:

```bash
# From the backend directory
cd /path/to/backend

# Seed ingredients
node scripts/seed/seedIngredients.js

# Seed education content
node scripts/seed/seedEducation.js

# Seed extracted knowledge
node scripts/seed/seedExtractedKnowledge.js

# Seed knowledge base
node scripts/seed/seedKnowledgeBase.js
```

### Running Utility Scripts

```bash
# Add new knowledge entries
node scripts/utils/addKnowledge.js

# Debug database insertions
node scripts/utils/debugInsert.js

# Validate entries
node scripts/utils/validateEntries.js
```

## Environment Setup

Make sure you have a `.env` file in the backend directory with:

```env
MONGODB_URI=your_mongodb_connection_string
```

## Important Notes

1. **Path Resolution**: All scripts use relative paths from the backend directory
2. **Database Connection**: Scripts will connect to MongoDB using the MONGODB_URI environment variable
3. **Data Clearing**: Most seed scripts clear existing data before inserting new data
4. **Error Handling**: Scripts include error handling and progress reporting

## Script Details

### Seed Scripts

#### seedIngredients.js
- Clears existing ingredients
- Inserts 25+ sample skincare ingredients
- Creates text search indexes
- Displays statistics after completion

#### seedEducation.js
- Clears existing education content
- Inserts comprehensive educational articles
- Creates search indexes for content discovery

#### seedExtractedKnowledge.js
- Imports knowledge from `knowledge-sources/pdfs/extracted-knowledge.json`
- Batch processing to avoid memory issues
- Detailed error reporting
- Progress indicators

#### seedKnowledgeBase.js
- Seeds curated dermatology knowledge
- Comprehensive coverage of skin conditions, ingredients, treatments
- Verified and sourced content

### Utility Scripts

#### addKnowledge.js
- Helper functions for adding single or multiple knowledge entries
- Can be used as a module or run directly
- Includes example entries

#### debugInsert.js
- One-by-one insertion for debugging
- Identifies problematic entries
- Detailed error messages

#### validateEntries.js
- Validates all entries in extracted-knowledge.json
- Checks required fields
- Validates category values
- Reports issues with specific entries

## Maintenance

When adding new scripts:

1. Place seed scripts in `/seed`
2. Place utility scripts in `/utils`
3. Update path references to use `../../` for accessing models and data
4. Update this README with script details
5. Add appropriate error handling and logging

## Dependencies

All scripts require:
- Node.js
- mongoose
- dotenv
- fs (built-in)
- path (built-in)

## Troubleshooting

### Connection Issues
- Verify MONGODB_URI in .env file
- Check network connectivity
- Ensure MongoDB Atlas IP whitelist is configured

### Path Errors
- Always run scripts from the backend directory
- Check relative path references in scripts
- Verify file structure matches expected layout

### Data Issues
- Use validateEntries.js before seeding
- Check debugInsert.js output for specific errors
- Review model schemas for required fields
