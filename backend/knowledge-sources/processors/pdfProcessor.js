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
     */
    async extractKnowledgeWithAI(textChunk, chunkIndex, totalChunks, context = {}) {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `You are a dermatology knowledge extraction assistant extracting from "Skin Care: Beyond the Basics (4th Edition)" - a professional esthetics textbook.

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
            console.error(`Error processing chunk ${chunkIndex + 1}:`, error.message);
            return [];
        }
    }

    /**
     * Process entire PDF and extract all knowledge
     */
    async processPDF(pdfPath, options = {}) {
        const {
            useAI = true,
            saveToDatabase = false,
            outputFile = null
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

        if (!useAI) {
            console.log('\n⚠️  AI extraction disabled. Returning raw chunks.');
            return { chunks, rawText: cleanedText };
        }

        // Process each chunk with AI
        console.log('\n🤖 Extracting knowledge with Gemini AI...');
        const allKnowledge = [];
        
        for (let i = 0; i < chunks.length; i++) {
            console.log(`   Processing chunk ${i + 1}/${chunks.length}...`);
            
            const extracted = await this.extractKnowledgeWithAI(chunks[i], i, chunks.length);
            
            if (extracted.length > 0) {
                // Add source reference and verification status
                const enriched = extracted.map(item => {
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
            
            // Rate limiting (Gemini API has limits)
            // Reduced delay since we're well within quota limits
            if (i < chunks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay
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
            saveToDatabase: true, // Set to true to save directly to DB
            outputFile: outputPath
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
