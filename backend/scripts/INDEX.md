# Scripts Index

**Quick navigation for all backend scripts and documentation.**

---

## 📖 Documentation

| File | Description |
|------|-------------|
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | Quick command reference - **START HERE** |
| [README.md](./README.md) | Complete overview and usage guide |
| [ORGANIZATION_SUMMARY.md](./ORGANIZATION_SUMMARY.md) | What changed and why |
| [seed/README.md](./seed/README.md) | Database seeding scripts documentation |
| [utils/README.md](./utils/README.md) | Utility scripts documentation |

---

## 🌱 Seed Scripts

**Location:** `scripts/seed/`

| Script | Purpose | Command |
|--------|---------|---------|
| [seedIngredients.js](./seed/seedIngredients.js) | Seed ingredients database (25+ entries) | `node scripts/seed/seedIngredients.js` |
| [seedEducation.js](./seed/seedEducation.js) | Seed education articles (5+ articles) | `node scripts/seed/seedEducation.js` |
| [seedKnowledgeBase.js](./seed/seedKnowledgeBase.js) | Seed curated knowledge base | `node scripts/seed/seedKnowledgeBase.js` |
| [seedExtractedKnowledge.js](./seed/seedExtractedKnowledge.js) | Import from JSON (55+ entries) | `node scripts/seed/seedExtractedKnowledge.js` |

---

## 🛠️ Utility Scripts

**Location:** `scripts/utils/`

| Script | Purpose | Command |
|--------|---------|---------|
| [addKnowledge.js](./utils/addKnowledge.js) | Add new knowledge entries | `node scripts/utils/addKnowledge.js` |
| [validateEntries.js](./utils/validateEntries.js) | Validate data before import | `node scripts/utils/validateEntries.js` |
| [debugInsert.js](./utils/debugInsert.js) | Debug insertion issues | `node scripts/utils/debugInsert.js` |

---

## 🚀 Common Workflows

### First Time Setup
```bash
node scripts/seed/seedIngredients.js
node scripts/seed/seedEducation.js
node scripts/seed/seedKnowledgeBase.js
```

### Add New Knowledge
```bash
# 1. Validate
node scripts/utils/validateEntries.js

# 2. Add
node scripts/utils/addKnowledge.js
```

### Troubleshoot Import Issues
```bash
# 1. Validate
node scripts/utils/validateEntries.js

# 2. Debug
node scripts/utils/debugInsert.js
```

---

## 📂 Directory Structure

```
scripts/
├── INDEX.md                          # This file
├── QUICK_REFERENCE.md                # Quick commands
├── README.md                         # Complete guide
├── ORGANIZATION_SUMMARY.md           # Organization details
│
├── seed/                             # Database seeding
│   ├── README.md
│   ├── seedIngredients.js
│   ├── seedEducation.js
│   ├── seedExtractedKnowledge.js
│   └── seedKnowledgeBase.js
│
└── utils/                            # Utilities
    ├── README.md
    ├── addKnowledge.js
    ├── debugInsert.js
    └── validateEntries.js
```

---

## 📋 Quick Reference

### All Seed Commands
```bash
node scripts/seed/seedIngredients.js
node scripts/seed/seedEducation.js
node scripts/seed/seedKnowledgeBase.js
node scripts/seed/seedExtractedKnowledge.js
```

### All Utility Commands
```bash
node scripts/utils/addKnowledge.js
node scripts/utils/validateEntries.js
node scripts/utils/debugInsert.js
```

---

## 🎯 Getting Started

1. **New to the scripts?**
   → Read [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

2. **Setting up database?**
   → See [seed/README.md](./seed/README.md)

3. **Adding new data?**
   → See [utils/README.md](./utils/README.md)

4. **Troubleshooting?**
   → Check individual README files

5. **Want full details?**
   → Read [README.md](./README.md)

---

**All scripts must be run from the `backend/` directory!**

```bash
cd backend
node scripts/seed/scriptName.js
```
