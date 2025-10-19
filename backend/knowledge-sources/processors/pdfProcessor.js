/**
 * PDF Knowledge Processor
 * 
 * Extracts knowledge from PDF books and prepares it for the knowledge base
 * Requires: pdf-parse for PDF extraction
 * 
 * Install: npm install pdf-parse
 */

const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');
const DermatologyKnowledge = require('../../models/DermatologyKnowledge');
const mongoose = require('mongoose');
require('dotenv').config();

class PDFProcessor {
    constructor() {
        this.chunkSize = 2000; // Characters per chunk for processing
        this.overlapSize = 200; // Overlap between chunks to maintain context
    }

    /**
     * Read and parse PDF file
     */
    async readPDF(pdfPath) {
        try {
            const dataBuffer = await fs.readFile(pdfPath);
            const data = await pdf(dataBuffer);
            
            console.log(`📄 PDF Info:`);
            console.log(`   Pages: ${data.numpages}`);
            console.log(`   Text length: ${data.text.length} characters`);
            
            return {
                text: data.text,
                numPages: data.numpages,
                info: data.info
            };
        } catch (error) {
            console.error('Error reading PDF:', error);
            throw error;
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
     */
    async extractKnowledgeWithAI(textChunk, chunkIndex, totalChunks) {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `You are a dermatology knowledge extraction assistant. Extract key dermatological information from this text chunk (${chunkIndex + 1}/${totalChunks}) from the book "Skin Care: Beyond the Basics (4th Edition)".

Extract and structure the information as JSON array with multiple entries (if applicable):

[
  {
    "category": "one of: skin-conditions, ingredients, treatments, routines, cosmetics, procedures, general-advice",
    "subcategory": "specific subcategory (e.g., acne, retinoids, anti-aging, etc.)",
    "title": "Clear, descriptive title",
    "content": "Detailed, well-structured content. Include: key points, mechanisms, usage guidelines, contraindications, evidence",
    "keywords": ["keyword1", "keyword2", "keyword3", ...],
    "chapter": "chapter name or section if identifiable",
    "pageReference": "approximate page or chapter reference"
  }
]

IMPORTANT:
- Only extract significant, clinically relevant information
- Skip introductory text, table of contents, references pages
- Combine related information into comprehensive entries
- If chunk contains no valuable information, return empty array []
- Focus on actionable dermatology knowledge
- Maintain scientific accuracy

Text chunk:
${textChunk}

Respond ONLY with valid JSON array.`;

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
        
        // Clean text (remove excessive whitespace, page numbers, etc.)
        const cleanedText = pdfData.text
            .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive newlines
            .replace(/^\d+\s*$/gm, '') // Remove standalone page numbers
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
                const enriched = extracted.map(item => ({
                    ...item,
                    sourceReference: `Skin Care: Beyond the Basics (4th Edition) - ${item.pageReference || 'Chapter: ' + (item.chapter || 'N/A')}`,
                    verified: true // Book content is verified
                }));
                
                allKnowledge.push(...enriched);
                console.log(`   ✓ Extracted ${extracted.length} knowledge entries`);
            }
            
            // Rate limiting (Gemini API has limits)
            if (i < chunks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
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
