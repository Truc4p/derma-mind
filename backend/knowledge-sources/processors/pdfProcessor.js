/**
 * PDF Knowledge Processor
 * 
 * Extracts knowledge from PDF books and prepares it for the knowledge base
 * Requires: pdf-parse for PDF extraction
 * 
 * Install: npm install pdf-parse
 * 
 * NEW FEATURES:
 * - Extract table of contents with chapters, sections, subsections, page numbers
 * - Build structured index before extracting content
 * - Better page range tracking using TOC
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const DermatologyKnowledge = require('../../models/DermatologyKnowledge');
const mongoose = require('mongoose');
require('dotenv').config();

class PDFProcessor {
    constructor() {
        // Optimized for quality extraction with plenty of quota available
        // Smaller chunks = more precise extraction, better attribution, more detailed entries
        // With 1500 req/day limit and ~935 chunks, we have plenty of headroom
        this.chunkSize = 3000; // Sweet spot: detailed but not too fragmented
        this.overlapSize = 300; // 10% overlap maintains context between chunks
        this.tocCache = null; // Cache for table of contents
    }

    /**
     * Read and parse PDF file using pdf-parse v2 API
     */
    async readPDF(pdfPath) {
        let parser;
        try {
            const dataBuffer = fsSync.readFileSync(pdfPath);
            parser = new PDFParse({ data: dataBuffer });
            
            // Get document info (metadata)
            const info = await parser.getInfo();
            
            // Extract all text
            const textResult = await parser.getText();
            
            console.log(`📄 PDF Info:`);
            console.log(`   Pages: ${info.total}`);
            console.log(`   Title: ${info.info?.Title || 'N/A'}`);
            console.log(`   Text length: ${textResult.text.length} characters`);
            
            return {
                text: textResult.text,
                numPages: info.total,
                info: info.info,
                metadata: info
            };
        } catch (error) {
            console.error('Error reading PDF:', error);
            throw error;
        } finally {
            // Always destroy parser to free memory
            if (parser) {
                await parser.destroy();
            }
        }
    }

    /**
     * Extract Table of Contents with AI
     * Finds chapters, sections, subsections, and page numbers
     */
    async extractTableOfContents(pdfPath) {
        console.log(`\n📑 Extracting Table of Contents from: ${path.basename(pdfPath)}`);
        
        // Read PDF
        const pdfData = await this.readPDF(pdfPath);
        
        // The TOC is usually in the first 10-20 pages
        // Let's extract the first portion of text (approximately first 30 pages worth)
        const tocText = pdfData.text.substring(0, 100000); // First ~100k characters should cover TOC
        
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-2.0-flash-exp',
            generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json"
            }
        });

        const prompt = `You are analyzing the Table of Contents from "Skin Care: Beyond the Basics (4th Edition)" by Mark Lees.

EXTRACT ALL TABLE OF CONTENTS ENTRIES with their structure and page numbers.

The book TOC typically includes:
- CHAPTERS (main sections, numbered like "CHAPTER 1")
- SECTIONS (subsections within chapters)
- SUBSECTIONS (topics within sections)
- PAGE NUMBERS (where each section starts)

Common TOC patterns:
- "CHAPTER 1 Advanced Anatomy and Physiology of the Skin........15"
- "The Cell...............................16"
- "Nucleus..................................17"
- Or variations with dots, dashes, or spaces between title and page number

IMPORTANT RULES:
1. Extract ONLY the table of contents entries - not the actual book content
2. Preserve the hierarchy (chapter → section → subsection)
3. Extract page numbers accurately
4. For chapters, set type="chapter" and level=1
5. For major sections under chapters, set type="section" and level=2
6. For subsections, set type="subsection" and level=3
7. Skip: preface, introduction pages, about the author (unless they're numbered chapters)
8. Maintain the order as it appears in the book

Return ONLY a valid JSON array with this exact schema:
{
  "toc": [
    {
      "type": "chapter",
      "level": 1,
      "number": "1",
      "title": "Advanced Anatomy and Physiology of the Skin",
      "page": 15,
      "parent": null
    },
    {
      "type": "section",
      "level": 2,
      "number": null,
      "title": "The Cell",
      "page": 16,
      "parent": "1"
    }
  ]
}

TEXT TO ANALYZE (First ~100k characters of the PDF):
${tocText}

Return ONLY valid JSON. If no TOC found, return {"toc": []}.`;

        try {
            console.log('   🤖 Analyzing TOC with Gemini AI...');
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            console.log('   📝 Raw response preview:', text.substring(0, 500));
            
            // Try to parse the JSON
            try {
                const parsed = JSON.parse(text);
                const tocEntries = parsed.toc || parsed;
                
                if (Array.isArray(tocEntries) && tocEntries.length > 0) {
                    console.log(`   ✅ Extracted ${tocEntries.length} TOC entries`);
                    
                    // Cache the TOC
                    this.tocCache = tocEntries;
                    
                    // Save TOC to file
                    const tocOutputPath = path.join(path.dirname(pdfPath), 'table-of-contents.json');
                    await fs.writeFile(
                        tocOutputPath,
                        JSON.stringify(tocEntries, null, 2),
                        'utf-8'
                    );
                    console.log(`   💾 Saved TOC to: ${tocOutputPath}`);
                    
                    // Print summary
                    this.printTOCSummary(tocEntries);
                    
                    return tocEntries;
                } else {
                    console.log('   ⚠️  No TOC entries found in response');
                    console.log('   📄 Full response:', text.substring(0, 1000));
                    return [];
                }
            } catch (parseError) {
                console.log('   ⚠️  Could not parse full JSON response');
                console.log('   ❌ Parse error:', parseError.message);
                
                // Try to save the raw response for manual inspection
                const rawOutputPath = path.join(path.dirname(pdfPath), 'toc-raw-response.txt');
                await fs.writeFile(rawOutputPath, text, 'utf-8');
                console.log(`   💾 Saved raw response to: ${rawOutputPath}`);
                console.log('   ℹ️  You can manually fix the JSON and save it as table-of-contents.json');
                
                // Try to extract partial JSON by finding the array bounds
                try {
                    // Look for the start of the array
                    const tocArrayMatch = text.match(/"toc"\s*:\s*\[([\s\S]*)/);
                    if (tocArrayMatch) {
                        // Try to find a valid closing point
                        const arrayContent = tocArrayMatch[0];
                        // Find the last complete entry before the error
                        const lastCompleteEntry = arrayContent.lastIndexOf('},');
                        if (lastCompleteEntry > 0) {
                            const partialJson = arrayContent.substring(0, lastCompleteEntry + 1) + '\n]';
                            const wrapped = '{' + partialJson + '}';
                            
                            const parsedPartial = JSON.parse(wrapped);
                            if (parsedPartial.toc && parsedPartial.toc.length > 0) {
                                console.log(`   ✅ Recovered ${parsedPartial.toc.length} TOC entries from partial parse`);
                                
                                // Save the recovered TOC
                                const tocOutputPath = path.join(path.dirname(pdfPath), 'table-of-contents.json');
                                await fs.writeFile(
                                    tocOutputPath,
                                    JSON.stringify(parsedPartial.toc, null, 2),
                                    'utf-8'
                                );
                                console.log(`   💾 Saved recovered TOC to: ${tocOutputPath}`);
                                
                                this.tocCache = parsedPartial.toc;
                                this.printTOCSummary(parsedPartial.toc);
                                
                                return parsedPartial.toc;
                            }
                        }
                    }
                } catch (recoveryError) {
                    console.log('   ⚠️  Could not recover partial JSON');
                }
                
                return [];
            }
        } catch (error) {
            console.error('   ❌ Error extracting TOC:', error.message);
            return [];
        }
    }

    /**
     * Print formatted TOC summary
     */
    printTOCSummary(tocEntries) {
        console.log('\n📖 Table of Contents Summary:');
        console.log('─'.repeat(80));
        
        const chapters = tocEntries.filter(e => e.type === 'chapter');
        const sections = tocEntries.filter(e => e.type === 'section');
        const subsections = tocEntries.filter(e => e.type === 'subsection');
        
        console.log(`   📚 Chapters: ${chapters.length}`);
        console.log(`   📄 Sections: ${sections.length}`);
        console.log(`   📝 Subsections: ${subsections.length}`);
        console.log(`   📊 Total entries: ${tocEntries.length}`);
        console.log('─'.repeat(80));
        
        // Print all chapters with their sections
        console.log('\n📋 Chapters with Sections:');
        chapters.forEach(chapter => {
            const chapterSections = tocEntries.filter(e => 
                e.parent === chapter.number && e.type === 'section'
            );
            console.log(`\n   ${chapter.number ? `Ch ${chapter.number}` : '•'}: ${chapter.title} (p.${chapter.page})`);
            if (chapterSections.length > 0) {
                chapterSections.forEach(section => {
                    console.log(`      └─ ${section.title} (p.${section.page})`);
                });
            }
        });
        console.log('');
    }

    /**
     * Load cached TOC or extract it
     */
    async getTOC(pdfPath) {
        if (this.tocCache) {
            return this.tocCache;
        }
        
        // Try to load from file first
        const tocPath = path.join(path.dirname(pdfPath), 'table-of-contents.json');
        try {
            const tocData = await fs.readFile(tocPath, 'utf-8');
            this.tocCache = JSON.parse(tocData);
            console.log(`   📑 Loaded cached TOC (${this.tocCache.length} entries)`);
            return this.tocCache;
        } catch (error) {
            // File doesn't exist, extract it
            return await this.extractTableOfContents(pdfPath);
        }
    }

    /**
     * Find which chapter/section a piece of text belongs to based on TOC
     */
    findContextFromTOC(textChunk, toc) {
        // Look for chapter markers in the text
        const chapterMatch = textChunk.match(/CHAPTER\s+(\d+)/i);
        if (chapterMatch) {
            const chapterNum = chapterMatch[1];
            const chapter = toc.find(e => e.number === chapterNum && e.type === 'chapter');
            if (chapter) {
                return {
                    chapterNumber: chapter.number,
                    chapterTitle: chapter.title,
                    pageReference: `Page ${chapter.page}`
                };
            }
        }
        
        // Look for page numbers in the text
        const pageMatch = textChunk.match(/--\s*(\d+)\s*of\s*\d+\s*--/);
        if (pageMatch) {
            const pageNum = parseInt(pageMatch[1]);
            // Find the chapter/section that this page belongs to
            const relevantEntries = toc
                .filter(e => e.page <= pageNum)
                .sort((a, b) => b.page - a.page);
            
            if (relevantEntries.length > 0) {
                const entry = relevantEntries[0];
                if (entry.type === 'chapter') {
                    return {
                        chapterNumber: entry.number,
                        chapterTitle: entry.title,
                        pageReference: `Page ${pageNum}`
                    };
                } else {
                    // Find the parent chapter
                    const chapter = toc.find(e => e.number === entry.parent && e.type === 'chapter');
                    return {
                        chapterNumber: chapter?.number || null,
                        chapterTitle: chapter?.title || entry.title,
                        pageReference: `Page ${pageNum}`,
                        section: entry.title
                    };
                }
            }
        }
        
        return null;
    }

    /**
     * Split text into manageable chunks with overlap
     */
    splitIntoChunks(text, chunkSize = this.chunkSize, overlap = this.overlapSize) {
        const chunks = [];
        let start = 0;

        while (start < text.length) {
            const end = Math.min(start + chunkSize, text.length);
            const chunk = text.substring(start, end);
            chunks.push(chunk);
            
            // Move start position, accounting for overlap
            start = end - overlap;
            
            // Prevent infinite loop at the end
            if (start + overlap >= text.length) break;
        }

        return chunks;
    }

    /**
     * Use Gemini AI to extract structured information from text chunks
     * Detects chapter numbers and page references automatically
     * Implements retry logic for rate limiting
     */
    async extractKnowledgeWithAI(textChunk, chunkIndex, totalChunks, context = {}) {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // 250 req/day limit

        // Build context string if available
        let contextStr = '';
        if (context.lastChapterNumber || context.lastChapterTitle || context.lastPageReference) {
            const parts = [];
            if (context.lastChapterNumber || context.lastChapterTitle) {
                parts.push(`Chapter ${context.lastChapterNumber || '?'}: ${context.lastChapterTitle || 'Unknown'}`);
            }
            if (context.lastPageReference) {
                parts.push(`Last known page: ${context.lastPageReference}`);
            }
            contextStr = `\n\nCONTEXT FROM PREVIOUS CHUNK: ${parts.join(', ')}. If you cannot detect explicit page/chapter info in this chunk, use the context values above.`;
        }

        const prompt = `You are a dermatology knowledge extraction assistant extracting from "Skin Care: Beyond the Basics (4th Edition)" - a professional esthetics textbook.${contextStr}

IMPORTANT - Book Structure:
- SIDEBAR DEFINITIONS: Key terms with brief definitions (left margin)
- MAIN TEXT: Detailed explanations and clinical information (main body)
- FIGURES: Diagrams referenced like "Figure 1-1" (with labels like "Nucleus", "Mitochondrion")

EXTRACTION RULES:
1. COMBINE sidebar definitions WITH their main text explanations into coherent entries
2. Include figure references when relevant (e.g., "as shown in Figure 1-1")
3. Skip: copyright notices, page markers, pure diagram labels, table of contents
4. Extract ONLY significant clinical/professional knowledge
5. When you see a term defined in sidebar + explained in main text, merge them into one comprehensive entry

Extract and structure as JSON array (chunk ${chunkIndex + 1}/${totalChunks}):

[
  {
    "category": "one of: skin-conditions, ingredients, treatments, routines, cosmetics, procedures, general-advice",
    "subcategory": "specific subcategory (e.g., acne, retinoids, cell-biology, etc.)",
    "title": "Clear, descriptive title",
    "content": "Detailed, well-structured content. Combine definitions with explanations. Include mechanisms, usage guidelines, contraindications, and evidence.",
    "keywords": ["keyword1", "keyword2", "keyword3", ...],
    "chapterNumber": "X" or null,
    "chapterTitle": "Chapter name" or null,
    "pageReference": "Page X" or "Pages X-Y" if identifiable
  }
]

Text chunk:
${textChunk}

Respond ONLY with valid JSON array. Return [] if chunk has no valuable content.`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Extract JSON from response
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const extracted = JSON.parse(jsonMatch[0]);
                return Array.isArray(extracted) ? extracted : [];
            }
            
            return [];
        } catch (error) {
            // Handle rate limiting with exponential backoff
            if (error.message.includes('429') || error.message.includes('quota')) {
                console.error(`   ⚠️  Rate limit hit on chunk ${chunkIndex + 1}`);
                
                // Extract retry delay if available
                const retryMatch = error.message.match(/retry in ([\d.]+)s/);
                const retryDelay = retryMatch ? Math.ceil(parseFloat(retryMatch[1]) * 1000) : 60000;
                
                console.log(`   ⏱️  Waiting ${Math.ceil(retryDelay/1000)}s before retry...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay + 2000)); // Add 2s buffer
                
                // Retry once
                try {
                    const retryResult = await model.generateContent(prompt);
                    const retryResponse = await retryResult.response;
                    const retryText = retryResponse.text();
                    const jsonMatch = retryText.match(/\[[\s\S]*\]/);
                    if (jsonMatch) {
                        const extracted = JSON.parse(jsonMatch[0]);
                        return Array.isArray(extracted) ? extracted : [];
                    }
                    return [];
                } catch (retryError) {
                    console.error(`   ❌ Retry failed for chunk ${chunkIndex + 1}`);
                    throw error; // Throw original error to stop processing
                }
            }
            
            console.error(`Error processing chunk ${chunkIndex + 1}:`, error.message);
            return [];
        }
    }

    /**
     * Process entire PDF and extract all knowledge
     * Supports resuming from a specific chunk
     */
    async processPDF(pdfPath, options = {}) {
        const {
            useAI = true,
            saveToDatabase = false,
            outputFile = null,
            startFromChunk = 0, // Resume from this chunk
            maxChunks = null // Limit chunks to process (for testing)
        } = options;

        console.log(`\n🔄 Processing PDF: ${path.basename(pdfPath)}`);
        
        // Load or extract TOC first
        const toc = await this.getTOC(pdfPath);
        
        // Read PDF
        const pdfData = await this.readPDF(pdfPath);
        
        // Clean text - remove boilerplate that adds noise to extraction
        // This textbook has copyright notices on every page and page markers
        const cleanedText = pdfData.text
            // Remove copyright notices (appears on every page)
            .replace(/Copyright \d{4} Cengage Learning.*?restrictions require it\./gs, '')
            // Remove page markers like "-- 16 of 528 --"
            .replace(/--\s*\d+\s*of\s*\d+\s*--/g, '')
            // Remove excessive newlines
            .replace(/\n\s*\n\s*\n+/g, '\n\n')
            // Remove standalone page numbers
            .replace(/^\d+\s*$/gm, '')
            // Normalize spaces
            .replace(/\s+/g, ' ')
            .replace(/\n /g, '\n')
            .trim();

        // Split into chunks
        const chunks = this.splitIntoChunks(cleanedText);
        console.log(`📚 Split into ${chunks.length} chunks`);
        
        // Apply chunk limits if specified
        const chunksToProcess = maxChunks 
            ? chunks.slice(startFromChunk, startFromChunk + maxChunks)
            : chunks.slice(startFromChunk);
        
        if (startFromChunk > 0) {
            console.log(`📍 Resuming from chunk ${startFromChunk + 1}/${chunks.length}`);
        }
        if (maxChunks) {
            console.log(`⚡ Processing ${maxChunks} chunks (chunks ${startFromChunk + 1}-${startFromChunk + chunksToProcess.length})`);
        }

        if (!useAI) {
            console.log('\n⚠️  AI extraction disabled. Returning raw chunks.');
            return { chunks, rawText: cleanedText };
        }

        // Process each chunk with AI
        console.log('\n🤖 Extracting knowledge with Gemini AI...');
        const allKnowledge = [];
        
        // Track chapter and page context across chunks
        let chapterContext = {
            lastChapterNumber: null,
            lastChapterTitle: null,
            lastPageReference: null
        };
        
        for (let i = 0; i < chunksToProcess.length; i++) {
            const actualChunkIndex = startFromChunk + i;
            console.log(`   Processing chunk ${actualChunkIndex + 1}/${chunks.length}...`);
            
            // Try to find context from TOC
            const tocContext = this.findContextFromTOC(chunksToProcess[i], toc);
            if (tocContext) {
                // Update context from TOC
                chapterContext = {
                    ...chapterContext,
                    ...tocContext
                };
            }
            
            try {
                const extracted = await this.extractKnowledgeWithAI(
                    chunksToProcess[i], 
                    actualChunkIndex, 
                    chunks.length,
                    chapterContext
                );
                
                if (extracted.length > 0) {
                    // Update chapter and page context from extracted entries
                    for (const item of extracted) {
                        if (item.chapterNumber) chapterContext.lastChapterNumber = item.chapterNumber;
                        if (item.chapterTitle) chapterContext.lastChapterTitle = item.chapterTitle;
                        if (item.pageReference) chapterContext.lastPageReference = item.pageReference;
                    }
                    
                    // Fill in missing page references using context
                    const enriched = extracted.map(item => {
                        // If pageReference is null, use the last known page reference
                        if (!item.pageReference && chapterContext.lastPageReference) {
                            item.pageReference = chapterContext.lastPageReference;
                        }
                        
                        // Build detailed source reference
                        let sourceRef = 'Skin Care: Beyond the Basics (4th Edition)';
                        
                        if (item.chapterNumber && item.chapterTitle) {
                            sourceRef += ` - Chapter ${item.chapterNumber}: ${item.chapterTitle}`;
                        } else if (item.chapterTitle) {
                            sourceRef += ` - ${item.chapterTitle}`;
                        } else if (item.chapterNumber) {
                            sourceRef += ` - Chapter ${item.chapterNumber}`;
                        }
                        
                        if (item.pageReference) {
                            sourceRef += ` (${item.pageReference})`;
                        }
                        
                        return {
                            ...item,
                            sourceReference: sourceRef,
                            verified: true // Book content is verified
                        };
                    });
                    
                    allKnowledge.push(...enriched);
                    console.log(`   ✓ Extracted ${extracted.length} knowledge entries`);
                }
                
                // Increased delay to respect rate limits
                // 10 req/min = 6 seconds between requests minimum
                if (i < chunksToProcess.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 7000)); // 7 second delay for safety
                }
            } catch (error) {
                console.error(`\n❌ Fatal error on chunk ${actualChunkIndex + 1}: ${error.message}`);
                console.log(`\n💾 Saving ${allKnowledge.length} entries extracted so far...`);
                
                // Save progress before exiting
                if (outputFile && allKnowledge.length > 0) {
                    await fs.writeFile(
                        outputFile.replace('.json', `-progress-chunk${actualChunkIndex}.json`),
                        JSON.stringify(allKnowledge, null, 2),
                        'utf-8'
                    );
                    console.log(`💾 Progress saved! Resume with: startFromChunk: ${actualChunkIndex + 1}`);
                }
                
                throw error; // Re-throw to stop execution
            }
        }

        console.log(`\n✅ Total knowledge entries extracted: ${allKnowledge.length}`);

        // Save to file
        if (outputFile) {
            await fs.writeFile(
                outputFile,
                JSON.stringify(allKnowledge, null, 2),
                'utf-8'
            );
            console.log(`💾 Saved to: ${outputFile}`);
        }

        // Save to database
        if (saveToDatabase && allKnowledge.length > 0) {
            await this.saveToDatabase(allKnowledge);
        }

        return {
            knowledge: allKnowledge,
            totalEntries: allKnowledge.length,
            pdfInfo: pdfData.info
        };
    }

    /**
     * Save extracted knowledge to MongoDB
     */
    async saveToDatabase(knowledgeArray) {
        try {
            console.log('\n💾 Saving to database...');
            
            if (!mongoose.connection.readyState) {
                await mongoose.connect(process.env.MONGODB_URI);
                console.log('   Connected to MongoDB');
            }

            // Insert all knowledge entries
            const result = await DermatologyKnowledge.insertMany(knowledgeArray, {
                ordered: false // Continue even if some entries fail
            });

            console.log(`   ✅ Saved ${result.length} entries to database`);
            
            return result;
        } catch (error) {
            if (error.code === 11000) {
                console.log('   ⚠️  Some entries already exist (duplicates skipped)');
            } else {
                console.error('   ❌ Error saving to database:', error.message);
            }
        }
    }

    /**
     * Remove duplicate entries based on title and content similarity
     */
    removeDuplicates(knowledgeArray) {
        const seen = new Set();
        const unique = [];

        for (const item of knowledgeArray) {
            const key = `${item.title.toLowerCase().trim()}|${item.category}`;
            
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(item);
            }
        }

        console.log(`   Removed ${knowledgeArray.length - unique.length} duplicates`);
        return unique;
    }
}

/**
 * Main execution function
 * 
 * MODES:
 * 1. 'toc' - Extract table of contents only
 * 2. 'extract' - Extract knowledge using TOC guidance
 * 3. 'full' - Extract TOC then extract knowledge
 */
async function main() {
    const pdfPath = path.join(__dirname, '../pdfs/skin-care-beyond-the-basics-4th.pdf');
    const outputPath = path.join(__dirname, '../pdfs/extracted-knowledge.json');
    const tocPath = path.join(__dirname, '../pdfs/table-of-contents.json');

    const processor = new PDFProcessor();

    // Get mode from command line argument
    const mode = process.argv[2] || 'toc'; // Default to TOC extraction

    try {
        if (mode === 'toc' || mode === 'full') {
            console.log('\n🎯 MODE: Extracting Table of Contents');
            console.log('─'.repeat(80));
            
            const toc = await processor.extractTableOfContents(pdfPath);
            
            console.log('\n✅ Table of Contents extraction complete!');
            console.log(`📄 Saved to: ${tocPath}`);
            console.log('\n📋 Next Steps:');
            console.log('   1. Review the table-of-contents.json file');
            console.log('   2. Run with "extract" mode to extract content using TOC:');
            console.log('      node pdfProcessor.js extract');
            console.log('');
            
            if (mode === 'toc') {
                return; // Stop here if only extracting TOC
            }
        }

        if (mode === 'extract' || mode === 'full') {
            console.log('\n🎯 MODE: Extracting Knowledge with TOC Guidance');
            console.log('─'.repeat(80));
            
            const result = await processor.processPDF(pdfPath, {
                useAI: true,
                saveToDatabase: false, // Set to true to save directly to DB
                outputFile: outputPath,
                startFromChunk: 0,
                maxChunks: null // Process all chunks
            });

            console.log('\n📊 Processing Summary:');
            console.log(`   Total entries: ${result.totalEntries}`);
            console.log(`   Output file: ${outputPath}`);
            console.log('\n✅ Processing complete!');
        }

        // Close database connection
        if (mongoose.connection.readyState) {
            await mongoose.connection.close();
            console.log('   Database connection closed');
        }

    } catch (error) {
        console.error('\n❌ Error:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = PDFProcessor;
