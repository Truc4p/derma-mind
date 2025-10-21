# Scripts Quick Reference

Quick command reference for all backend scripts.

## Seed Database

```bash
# Seed all data (run in order)
node scripts/seed/seedIngredients.js
node scripts/seed/seedEducation.js
node scripts/seed/seedKnowledgeBase.js

# OR seed from extracted JSON
node scripts/seed/seedExtractedKnowledge.js
```

## Add New Knowledge

```bash
# Add new entries (edit the script first with your data)
node scripts/utils/addKnowledge.js
```

## Debug & Validate

```bash
# Validate JSON data before import
node scripts/utils/validateEntries.js

# Debug import issues (one-by-one insertion)
node scripts/utils/debugInsert.js
```

## File Organization

```
backend/
├── scripts/
│   ├── seed/                    # Database seeding
│   │   ├── seedIngredients.js
│   │   ├── seedEducation.js
│   │   ├── seedExtractedKnowledge.js
│   │   └── seedKnowledgeBase.js
│   └── utils/                   # Helper utilities
│       ├── addKnowledge.js
│       ├── debugInsert.js
│       └── validateEntries.js
```

## Purpose Summary

| Script | Purpose | When to Use |
|--------|---------|-------------|
| **seedIngredients.js** | Populate ingredients database | Initial setup, reset ingredients |
| **seedEducation.js** | Populate education content | Initial setup, reset articles |
| **seedKnowledgeBase.js** | Seed curated knowledge | Initial setup, curated data |
| **seedExtractedKnowledge.js** | Import from JSON | Initial setup, JSON data source |
| **addKnowledge.js** | Add new knowledge entries | Adding new content incrementally |
| **debugInsert.js** | Debug insertion issues | Troubleshooting imports |
| **validateEntries.js** | Validate data format | Before importing, data quality check |

## Common Commands

### Fresh Database Setup
```bash
cd backend
node scripts/seed/seedIngredients.js
node scripts/seed/seedEducation.js
node scripts/seed/seedKnowledgeBase.js
```

### Reset Single Collection
```bash
# Reset just ingredients
node scripts/seed/seedIngredients.js

# Reset just education
node scripts/seed/seedEducation.js

# Reset just knowledge
node scripts/seed/seedKnowledgeBase.js
```

### Before Any Import
```bash
# Always validate first!
node scripts/utils/validateEntries.js
```

### When Import Fails
```bash
# Use debug mode
node scripts/utils/debugInsert.js
```

## Prerequisites

1. Node.js installed
2. MongoDB connection configured in `.env`
3. Run from `backend` directory

## Environment Variables

Required in `backend/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```
