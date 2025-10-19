/**
 * PDF Knowledge Processor
 * 
 * Extracts knowledge from PDF books and prepares it for the knowledge base
 * Requires: pdf-parse for PDF extraction
 * 
 * Install: npm install pdf-parse
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
 */
async function main() {
    const pdfPath = path.join(__dirname, '../pdfs/skin-care-beyond-the-basics-4th.pdf');
    const outputPath = path.join(__dirname, '../pdfs/extracted-knowledge.json');

    const processor = new PDFProcessor();

    try {
        const result = await processor.processPDF(pdfPath, {
            useAI: true,
            saveToDatabase: false, // Set to true to save directly to DB
            outputFile: outputPath,
            startFromChunk: 0, // Start from beginning
            maxChunks: 100 // Today: 211 remaining - 10 buffer = 200 safe chunks
        });

        console.log('\n📊 Processing Summary:');
        console.log(`   Total entries: ${result.totalEntries}`);
        console.log(`   Output file: ${outputPath}`);
        console.log('\n✅ Processing complete!');

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
