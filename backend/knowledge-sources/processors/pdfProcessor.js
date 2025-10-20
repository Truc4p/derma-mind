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
        this.tocCache = null; // Cache for table of contents
        // Page offset: TOC pages vs actual PDF pages
        // Chapter 1 lists as page 1 in TOC, but is actually page 15 in PDF
        this.pageOffset = 14; // Offset for front matter (title, copyright, TOC, etc.)
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
            model: 'gemini-2.5-flash',
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
     * Extract text for a specific page range from PDF using page markers
     * Must be called BEFORE cleaning (while page markers still exist)
     */
    getTextForPageRange(rawText, startPage, endPage) {
        // Build a map of page numbers to text positions
        const pageMarkers = [];
        const pagePattern = /--\s*(\d+)\s*of\s*\d+\s*--/g;
        let match;
        
        while ((match = pagePattern.exec(rawText)) !== null) {
            pageMarkers.push({
                page: parseInt(match[1]),
                position: match.index
            });
        }
        
        if (pageMarkers.length === 0) {
            // Fallback: estimate based on average page length
            console.log('      ⚠️  No page markers found, using estimation');
            const avgCharsPerPage = rawText.length / 528; // Total pages in book
            const estimatedStart = Math.floor((startPage - 1) * avgCharsPerPage);
            const estimatedEnd = Math.floor(endPage * avgCharsPerPage);
            return rawText.substring(estimatedStart, estimatedEnd);
        }
        
        // Find the marker closest to startPage
        const startMarker = pageMarkers.find(m => m.page >= startPage) || pageMarkers[0];
        
        // Find the marker closest to endPage (or slightly after)
        const endMarker = pageMarkers.find(m => m.page > endPage) || pageMarkers[pageMarkers.length - 1];
        
        const extractedText = rawText.substring(startMarker.position, endMarker.position);
        
        // Clean the extracted text
        return extractedText
            .replace(/Copyright \d{4} Cengage Learning.*?restrictions require it\./gs, '')
            .replace(/--\s*\d+\s*of\s*\d+\s*--/g, '')
            .replace(/\n\s*\n\s*\n+/g, '\n\n')
            .replace(/^\d+\s*$/gm, '')
            .replace(/\s+/g, ' ')
            .replace(/\n /g, '\n')
            .trim();
    }

    /**
     * Process PDF by extracting knowledge section-by-section based on TOC
     * This provides much better context and attribution than arbitrary chunking
     */
    async processPDFByTOC(pdfPath, options = {}) {
        const {
            saveToDatabase = false,
            outputFile = null,
            startFromSection = 0, // Resume from this section index
            maxSections = null // Limit sections to process (for testing)
        } = options;

        console.log(`\n🔄 Processing PDF by TOC Structure: ${path.basename(pdfPath)}`);
        
        // Load or extract TOC
        const toc = await this.getTOC(pdfPath);
        
        if (!toc || toc.length === 0) {
            console.error('❌ No TOC found! Please run TOC extraction first.');
            return { knowledge: [], totalEntries: 0 };
        }
        
        // Read PDF
        const pdfData = await this.readPDF(pdfPath);
        
        // Keep the raw text for page range extraction (with page markers)
        const rawText = pdfData.text;

        // Get all chapters and sections
        const chapters = toc.filter(e => e.type === 'chapter');
        const sections = toc.filter(e => e.type === 'section');
        
        console.log(`📚 Found ${chapters.length} chapters and ${sections.length} sections`);
        
        // Build section list with page ranges
        const sectionsToProcess = [];
        
        for (let i = 0; i < chapters.length; i++) {
            const chapter = chapters[i];
            const chapterSections = toc.filter(e => e.parent === chapter.number && e.type === 'section');
            
            for (let j = 0; j < chapterSections.length; j++) {
                const section = chapterSections[j];
                const nextSection = chapterSections[j + 1];
                const nextChapter = chapters[i + 1];
                
                // Determine end page for this section
                let endPage;
                if (nextSection) {
                    endPage = nextSection.page - 1;
                } else if (nextChapter) {
                    endPage = nextChapter.page - 1;
                } else {
                    endPage = section.page + 10; // Default to 10 pages if no next section
                }
                
                sectionsToProcess.push({
                    chapterNumber: chapter.number,
                    chapterTitle: chapter.title,
                    sectionTitle: section.title,
                    startPage: section.page + this.pageOffset, // Apply page offset
                    endPage: endPage + this.pageOffset, // Apply page offset
                    pageRange: `Pages ${section.page}-${endPage} (PDF: ${section.page + this.pageOffset}-${endPage + this.pageOffset})`
                });
            }
        }
        
        console.log(`📄 Total sections to process: ${sectionsToProcess.length}`);
        
        // Apply limits if specified
        const limitedSections = maxSections 
            ? sectionsToProcess.slice(startFromSection, startFromSection + maxSections)
            : sectionsToProcess.slice(startFromSection);
        
        if (startFromSection > 0) {
            console.log(`📍 Resuming from section ${startFromSection + 1}/${sectionsToProcess.length}`);
        }
        if (maxSections) {
            console.log(`⚡ Processing ${maxSections} sections (${startFromSection + 1}-${startFromSection + limitedSections.length})`);
        }

        // Process each section with AI
        console.log('\n🤖 Extracting knowledge section by section...\n');
        const allKnowledge = [];
        
        for (let i = 0; i < limitedSections.length; i++) {
            const actualIndex = startFromSection + i;
            const sectionInfo = limitedSections[i];
            
            console.log(`   [${actualIndex + 1}/${sectionsToProcess.length}] Ch ${sectionInfo.chapterNumber}: ${sectionInfo.sectionTitle} (${sectionInfo.pageRange})`);
            
            // Extract text for this section based on page range
            // Use rawText (with page markers) for accurate extraction
            const sectionText = this.getTextForPageRange(
                rawText, 
                sectionInfo.startPage, 
                sectionInfo.endPage
            );
            
            if (!sectionText || sectionText.length < 100) {
                console.log(`      ⚠️  Section text too short (${sectionText?.length || 0} chars), skipping`);
                continue;
            }
            
            console.log(`      📝 Extracted ${sectionText.length} characters`);
            
            // If section text is too long, split it into smaller chunks
            const maxChunkSize = 5000;
            let sectionChunks = [];
            
            if (sectionText.length > maxChunkSize) {
                // Split into smaller chunks but keep them manageable
                for (let start = 0; start < sectionText.length; start += maxChunkSize) {
                    sectionChunks.push(sectionText.substring(start, start + maxChunkSize));
                }
                console.log(`      (Split into ${sectionChunks.length} chunks due to length)`);
            } else {
                sectionChunks = [sectionText];
            }
            
            try {
                // Process each chunk of this section
                for (let chunkIdx = 0; chunkIdx < sectionChunks.length; chunkIdx++) {
                    const extracted = await this.extractKnowledgeFromSection(
                        sectionChunks[chunkIdx],
                        sectionInfo,
                        chunkIdx,
                        sectionChunks.length
                    );
                    
                    if (extracted.length > 0) {
                        // Enrich with full context
                        const enriched = extracted.map(item => ({
                            ...item,
                            chapterNumber: sectionInfo.chapterNumber,
                            chapterTitle: sectionInfo.chapterTitle,
                            sectionTitle: sectionInfo.sectionTitle,
                            pageReference: sectionInfo.pageRange,
                            sourceReference: `Skin Care: Beyond the Basics (4th Edition) - Chapter ${sectionInfo.chapterNumber}: ${sectionInfo.chapterTitle} - ${sectionInfo.sectionTitle} (${sectionInfo.pageRange})`,
                            verified: true
                        }));
                        
                        allKnowledge.push(...enriched);
                        console.log(`      ✓ Extracted ${extracted.length} entries`);
                    } else {
                        console.log(`      ⊘ No valuable content`);
                    }
                    
                    // Small delay between chunks of same section
                    if (chunkIdx < sectionChunks.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    }
                }
                
                // Delay between sections to respect rate limits
                if (i < limitedSections.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 7000));
                }
                
            } catch (error) {
                console.error(`\n❌ Fatal error on section ${actualIndex + 1}: ${error.message}`);
                console.log(`\n💾 Saving ${allKnowledge.length} entries extracted so far...`);
                
                // Save progress before exiting
                if (outputFile && allKnowledge.length > 0) {
                    await fs.writeFile(
                        outputFile.replace('.json', `-progress-section${actualIndex}.json`),
                        JSON.stringify(allKnowledge, null, 2),
                        'utf-8'
                    );
                    console.log(`💾 Progress saved! Resume with: startFromSection: ${actualIndex + 1}`);
                }
                
                throw error;
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
            sectionsProcessed: limitedSections.length,
            pdfInfo: pdfData.info
        };
    }

    /**
     * Extract knowledge from a specific section using AI
     */
    async extractKnowledgeFromSection(sectionText, sectionInfo, chunkIndex, totalChunks) {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const chunkInfo = totalChunks > 1 ? ` (chunk ${chunkIndex + 1}/${totalChunks})` : '';

        const prompt = `You are extracting knowledge from "Skin Care: Beyond the Basics (4th Edition)" - Chapter ${sectionInfo.chapterNumber}: ${sectionInfo.chapterTitle}.

CURRENT SECTION: "${sectionInfo.sectionTitle}" (${sectionInfo.pageRange})${chunkInfo}

CONTEXT:
- This is a professional esthetics textbook
- Extract ONLY clinically relevant, professional-level knowledge
- This specific section focuses on: ${sectionInfo.sectionTitle}

EXTRACTION RULES:
1. Extract knowledge entries that are substantial and clinically useful
2. COMBINE sidebar definitions WITH main text explanations
3. Include mechanisms, clinical applications, contraindications
4. Skip: pure navigation text, figure labels, "In Conclusion" summaries, page numbers
5. Each entry should be comprehensive (not fragmented)
6. Focus on professional/clinical information, not basic definitions

Extract as JSON array:
[
  {
    "category": "MUST be one of these EXACT values: skin-conditions, ingredients, treatments, routines, cosmetics, procedures, general-advice",
    "subcategory": "specific subcategory (e.g., cell-biology, sterilization, immune-function, anatomy, physiology)",
    "title": "Clear, professional title",
    "content": "Detailed, well-structured content with clinical relevance. Combine definitions with explanations. Include mechanisms, applications, and evidence.",
    "keywords": ["keyword1", "keyword2", "keyword3"]
  }
]

IMPORTANT: For anatomy/biology topics (cells, tissues, etc.), use category="general-advice" with appropriate subcategory.

SECTION TEXT:
${sectionText}

Respond ONLY with valid JSON array. Return [] if no valuable content.`;

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
                console.error(`      ⚠️  Rate limit hit`);
                
                const retryMatch = error.message.match(/retry in ([\d.]+)s/);
                const retryDelay = retryMatch ? Math.ceil(parseFloat(retryMatch[1]) * 1000) : 60000;
                
                console.log(`      ⏱️  Waiting ${Math.ceil(retryDelay/1000)}s before retry...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay + 2000));
                
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
                    console.error(`      ❌ Retry failed`);
                    throw error;
                }
            }
            
            console.error(`      Error processing section: ${error.message}`);
            return [];
        }
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
 * 2. 'extract' - Extract knowledge section-by-section using TOC (RECOMMENDED)
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
            console.log('   2. Run with "extract" mode to extract content by sections:');
            console.log('      node pdfProcessor.js extract');
            console.log('');
            
            if (mode === 'toc') {
                return; // Stop here if only extracting TOC
            }
        }

        if (mode === 'extract' || mode === 'full') {
            console.log('\n🎯 MODE: Extracting Knowledge by TOC Sections');
            console.log('─'.repeat(80));
            
            const result = await processor.processPDFByTOC(pdfPath, {
                saveToDatabase: false, // Set to true to save directly to DB
                outputFile: outputPath,
                startFromSection: 0,
                maxSections: 10 // Start with first 10 sections for testing
            });

            console.log('\n📊 Processing Summary:');
            console.log(`   Sections processed: ${result.sectionsProcessed}`);
            console.log(`   Total entries: ${result.totalEntries}`);
            console.log(`   Avg entries per section: ${(result.totalEntries / result.sectionsProcessed).toFixed(1)}`);
            console.log(`   Output file: ${outputPath}`);
            console.log('\n✅ Processing complete!');
            console.log('\n📋 To process more sections, update maxSections or remove the limit.');
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
