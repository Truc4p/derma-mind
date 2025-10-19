# Knowledge Sources

This directory contains raw knowledge sources and processing tools for extracting dermatology information to feed into the AI Dermatologist.

## Directory Structure

```
knowledge-sources/
├── pdfs/                          # PDF books and documents
│   ├── skin-care-beyond-the-basics-4th.pdf
│   └── extracted-knowledge.json   # Output from PDF processing
├── processors/                    # Processing scripts
│   └── pdfProcessor.js           # PDF extraction and processing
└── README.md                      # This file
```

## Setup

1. **Install required dependencies:**
   ```bash
   cd backend
   npm install pdf-parse
   ```

2. **Place your PDF:**
   Move your PDF file to `pdfs/` directory:
   ```bash
   # From your Downloads folder
   cp ~/Downloads/skin-care-beyond-the-basics-4th.pdf ./knowledge-sources/pdfs/
   ```

3. **Configure environment:**
   Ensure your `.env` file has:
   ```
   GEMINI_API_KEY=your_api_key_here
   MONGODB_URI=your_mongodb_connection_string
   ```

## Usage

### Process PDF and Extract Knowledge

```bash
# From backend directory
node knowledge-sources/processors/pdfProcessor.js
```

This will:
1. Read the PDF file
2. Split it into manageable chunks
3. Use Gemini AI to extract structured knowledge
4. Save to JSON file (`pdfs/extracted-knowledge.json`)
5. Optionally save directly to MongoDB

### Options

Edit `pdfProcessor.js` main function to customize:

```javascript
const result = await processor.processPDF(pdfPath, {
    useAI: true,              // Use AI extraction (vs raw chunks)
    saveToDatabase: true,     // Save directly to MongoDB
    outputFile: outputPath    // Save to JSON file
});
```

## How It Works

1. **PDF Reading**: Uses `pdf-parse` to extract text from PDF
2. **Chunking**: Splits large text into chunks (~2000 chars) with overlap
3. **AI Extraction**: Gemini AI analyzes each chunk and extracts:
   - Category (skin-conditions, ingredients, treatments, etc.)
   - Subcategory
   - Title
   - Detailed content
   - Keywords
   - Chapter/page reference
4. **Structuring**: Formats data to match `DermatologyKnowledge` schema
5. **Deduplication**: Removes duplicate entries
6. **Storage**: Saves to JSON file and/or MongoDB

## Output Format

Extracted knowledge is structured as:

```json
[
  {
    "category": "ingredients",
    "subcategory": "retinoids",
    "title": "Retinoids in Clinical Practice",
    "content": "Detailed information about retinoids...",
    "keywords": ["retinol", "tretinoin", "anti-aging"],
    "chapter": "Chapter 5: Active Ingredients",
    "pageReference": "Chapter 5, pages 45-52",
    "sourceReference": "Skin Care: Beyond the Basics (4th Edition) - Chapter 5",
    "verified": true
  }
]
```

## Best Practices

1. **Review Extracted Content**: Always review AI-extracted content for accuracy
2. **Manual Curation**: Consider manually refining important entries
3. **Incremental Processing**: Process large PDFs in sections if hitting API limits
4. **Backup Data**: Keep the JSON output as backup before database insertion

## Troubleshooting

**PDF not reading correctly:**
- Ensure PDF is not encrypted or password-protected
- Check PDF is text-based (not scanned images)
- If scanned, consider OCR preprocessing

**API Rate Limits:**
- Increase delay between chunks (edit `setTimeout` in processor)
- Process in smaller batches
- Use Gemini API with higher quota

**Duplicate entries:**
- Run deduplication: `processor.removeDuplicates(knowledge)`
- Manually review JSON output before database insertion

## Future Enhancements

- [ ] OCR support for scanned PDFs
- [ ] Multi-language support
- [ ] Automatic chapter detection
- [ ] Image extraction for diagrams
- [ ] Citation extraction
- [ ] Cross-referencing between entries
- [ ] Quality scoring for extracted content

## Related Files

- **Models**: `backend/models/DermatologyKnowledge.js`
- **Seeding**: `backend/seedKnowledgeBase.js`
- **AI Service**: `backend/services/geminiService.js`
- **Web Scraping**: `backend/tools/scrapeDermNet.js`
