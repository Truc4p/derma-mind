const { QdrantClient } = require('@qdrant/js-client-rest');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { Document } = require('langchain/document');
const fs = require('fs').promises;
const path = require('path');
const performanceMonitor = require('../utils/performanceMonitor');

class VectorService {
    constructor() {
        this.qdrantClient = new QdrantClient({
            url: process.env.QDRANT_URL || 'http://localhost:6333',
            apiKey: process.env.QDRANT_API_KEY || undefined
        });
        
        console.log('🆓 Using Gemini embeddings');
        this.embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            modelName: 'text-embedding-004' // Gemini's latest embedding model
        });
        this.vectorSize = 768; // Gemini embedding dimension
        
        this.collectionName = 'dermatology_knowledge';
    }

    /**
     * Initialize the Qdrant collection
     */
    async initializeCollection() {
        try {
            // Check if collection exists
            const collections = await this.qdrantClient.getCollections();
            const exists = collections.collections.some(
                col => col.name === this.collectionName
            );

            if (!exists) {
                // Create collection with Gemini vector size (768)
                await this.qdrantClient.createCollection(this.collectionName, {
                    vectors: {
                        size: this.vectorSize,
                        distance: 'Cosine'
                    }
                });
                console.log(`Collection '${this.collectionName}' created successfully with vector size ${this.vectorSize}`);
            } else {
                console.log(`Collection '${this.collectionName}' already exists`);
            }
        } catch (error) {
            console.error('Error initializing collection:', error);
            throw error;
        }
    }

    /**
     * Load and process all text files from the knowledge base directory
     */
    async loadKnowledgeBase() {
        try {
            const knowledgeBasePath = path.join(
                __dirname,
                '../knowledge-sources/extracted-content'
            );
            
            // Read all files in the directory
            const files = await fs.readdir(knowledgeBasePath);
            
            // Filter for .txt files only
            const txtFiles = files.filter(file => file.endsWith('.txt'));
            
            if (txtFiles.length === 0) {
                throw new Error('No .txt files found in knowledge-sources/extracted-content/');
            }
            
            console.log(`Found ${txtFiles.length} text files:`);
            txtFiles.forEach(file => console.log(`  - ${file}`));
            
            let allDocuments = [];
            let globalChunkIndex = 0;
            
            // Process each text file
            for (const file of txtFiles) {
                const filePath = path.join(knowledgeBasePath, file);
                const content = await fs.readFile(filePath, 'utf-8');
                
                console.log(`\nProcessing: ${file}`);
                console.log(`  Content length: ${content.length} characters`);
                
                // Split the text into chunks
                const textSplitter = new RecursiveCharacterTextSplitter({
                    chunkSize: 1500,  // Increased from 1000 to capture more complete sections
                    chunkOverlap: 300, // Increased overlap to ensure continuity
                    separators: ['\n\n', '\n', '. ', ' ', '']
                });

                const chunks = await textSplitter.splitText(content);
                console.log(`  Created ${chunks.length} chunks`);
                
                // Map chunks to documents with metadata
                const documents = chunks.map((chunk, index) => ({
                    pageContent: chunk,
                    metadata: {
                        source: file.replace('.txt', ''),
                        fileName: file,
                        chunkIndex: globalChunkIndex + index,
                        fileChunkIndex: index,
                        totalChunksInFile: chunks.length
                    }
                }));
                
                allDocuments = allDocuments.concat(documents);
                globalChunkIndex += chunks.length;
            }
            
            console.log(`\n✅ Total documents created: ${allDocuments.length} from ${txtFiles.length} files`);
            
            return allDocuments;
        } catch (error) {
            console.error('Error loading knowledge base:', error);
            throw error;
        }
    }

    /**
     * Index documents into Qdrant
     */
    async indexDocuments(documents) {
        try {
            console.log(`Indexing ${documents.length} documents...`);
            
            const batchSize = 50; // Reduced from 100 to prevent timeouts
            const totalBatches = Math.ceil(documents.length / batchSize);
            let successfulBatches = 0;
            let failedBatches = 0;
            const failedBatchNumbers = [];
            
            for (let i = 0; i < documents.length; i += batchSize) {
                const batch = documents.slice(i, i + batchSize);
                const batchNum = Math.floor(i / batchSize) + 1;
                
                let retries = 3;
                let success = false;
                
                while (retries > 0 && !success) {
                    try {
                        // Generate embeddings for batch
                        const texts = batch.map(doc => doc.pageContent);
                        const embeddings = await this.embeddings.embedDocuments(texts);
                        
                        // Validate embeddings before uploading
                        const validEmbeddings = embeddings.every(emb => 
                            Array.isArray(emb) && emb.length === 768 && emb.some(v => v !== 0)
                        );
                        
                        if (!validEmbeddings) {
                            throw new Error('Invalid embeddings: empty or wrong dimension');
                        }
                        
                        // Prepare points for Qdrant
                        const points = batch.map((doc, index) => ({
                            id: i + index,
                            vector: embeddings[index],
                            payload: {
                                text: doc.pageContent,
                                metadata: doc.metadata
                            }
                        }));
                        
                        // Upload to Qdrant
                        await this.qdrantClient.upsert(this.collectionName, {
                            wait: true,
                            points: points
                        });
                        
                        console.log(`Indexed batch ${batchNum}/${totalBatches} (${i + batch.length}/${documents.length} docs)`);
                        success = true;
                        successfulBatches++;
                        
                        // Small delay between batches to prevent overwhelming Qdrant
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                    } catch (error) {
                        retries--;
                        if (retries > 0) {
                            console.log(`   ⚠️  Batch ${batchNum} failed, retrying... (${retries} attempts left)`);
                            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
                        } else {
                            console.log(`   ❌ Batch ${batchNum} failed after 3 attempts - SKIPPING and continuing...`);
                            console.log(`      Error: ${error.message}`);
                            failedBatches++;
                            failedBatchNumbers.push(batchNum);
                            success = true; // Mark as "success" to continue to next batch
                        }
                    }
                }
            }
            
            console.log('\n' + '='.repeat(60));
            console.log('Indexing Summary:');
            console.log('='.repeat(60));
            console.log(`✅ Successful batches: ${successfulBatches}/${totalBatches}`);
            console.log(`❌ Failed batches: ${failedBatches}/${totalBatches}`);
            if (failedBatches > 0) {
                console.log(`   Failed batch numbers: ${failedBatchNumbers.join(', ')}`);
                console.log(`   Documents skipped: ~${failedBatches * batchSize}`);
            }
            console.log(`📊 Total documents indexed: ~${successfulBatches * batchSize}/${documents.length}`);
            console.log('='.repeat(60));
            
            if (failedBatches === totalBatches) {
                throw new Error('All batches failed - check Gemini API key and rate limits');
            }
            
            console.log('\n✅ Indexing completed with some batches skipped');
        } catch (error) {
            console.error('Error indexing documents:', error);
            throw error;
        }
    }

    /**
     * Search for relevant documents based on query
     */
    async searchRelevantDocs(query, limit = 5, debugMode = false) {
        try {
            // Generate embedding for the query
            const queryEmbedding = await this.embeddings.embedQuery(query);
            
            if (debugMode) {
                console.log('\n🔍 VECTOR SEARCH DEBUG INFO:');
                console.log(`   Query: "${query}"`);
                console.log(`   Query Vector Length: ${queryEmbedding.length}`);
                console.log(`   Query Vector Sample: [${queryEmbedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
                console.log(`   Search Limit: ${limit}`);
            }
            
            // Search in Qdrant with score threshold to filter out irrelevant results
            const searchResults = await this.qdrantClient.search(this.collectionName, {
                vector: queryEmbedding,
                limit: limit,
                with_payload: true,
                score_threshold: 0.4 // Only return results with >40% similarity
            });
            
            if (debugMode) {
                console.log(`   Found ${searchResults.length} results from Qdrant`);
                searchResults.forEach((result, idx) => {
                    console.log(`   ${idx + 1}. Score: ${result.score.toFixed(8)} (${(result.score * 100).toFixed(2)}%)`);
                    console.log(`      Chunk: ${result.payload.metadata.chunkIndex}`);
                    console.log(`      Text: "${result.payload.text.substring(0, 60)}..."`);
                });
            }
            
            return searchResults.map(result => ({
                content: result.payload.text,
                metadata: result.payload.metadata,
                score: result.score
            }));
        } catch (error) {
            console.error('Error searching documents:', error);
            throw error;
        }
    }

    /**
     * Helper: Analyze and categorize score
     */
    scoreCategory(score) {
        if (score >= 0.90) return '🟢 PERFECT (90-100%)';
        if (score >= 0.75) return '🟢 EXCELLENT (75-89%)';
        if (score >= 0.60) return '🟡 GOOD (60-74%)';
        if (score >= 0.45) return '🟡 FAIR (45-59%)';
        if (score >= 0.30) return '🔴 WEAK (30-44%)';
        return '⚫ POOR (<30%)';
    }

    /**
     * Complete RAG pipeline: search + generate response with detailed scoring
     */
    async ragQuery(userQuery, conversationHistory = [], debugMode = false) {
        try {
            const startTime = performanceMonitor.startTimer();
            
            console.log('\n' + '='.repeat(80));
            console.log('🔍 RAG QUERY ANALYSIS');
            console.log('='.repeat(80));
            console.log(`📝 User Query: "${userQuery}"`);
            console.log(`📊 Query Length: ${userQuery.length} chars, ${userQuery.split(' ').length} words`);
            
            // 1. Retrieve relevant context - OPTIMIZED: reduced from 5 to 3 chunks for faster processing
            const searchStart = performanceMonitor.startTimer();
            const relevantDocs = await this.searchRelevantDocs(userQuery, 3, debugMode);
            const searchTime = performanceMonitor.endTimer(searchStart);
            performanceMonitor.record('vectorSearch', searchTime);
            
            console.log(`\n📚 Retrieved ${relevantDocs.length} chunks from Qdrant:\n`);
            
            // Calculate statistics
            const scores = relevantDocs.map(d => d.score);
            const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            const maxScore = Math.max(...scores);
            const minScore = Math.min(...scores);
            
            console.log(`📈 Score Statistics:`);
            console.log(`   Highest: ${maxScore.toFixed(4)} (100% match)`);
            console.log(`   Average: ${avgScore.toFixed(4)} (${(avgScore * 100).toFixed(1)}% avg similarity)`);
            console.log(`   Lowest:  ${minScore.toFixed(4)} (${(minScore * 100).toFixed(1)}% similarity)`);
            console.log(`   Range:   ${(maxScore - minScore).toFixed(4)} (score spread)\n`);
            
            // Detailed breakdown
            console.log('💡 Chunk Details (sorted by relevance):\n');
            relevantDocs.forEach((doc, idx) => {
                const chunkId = doc.metadata.chunkIndex;
                const score = doc.score;
                const category = this.scoreCategory(score);
                const preview = doc.content
                    .substring(0, 120)
                    .replace(/\n/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                
                console.log(`   ${idx + 1}. Chunk #${chunkId}`);
                console.log(`      Score: ${score.toFixed(4)} (${(score * 100).toFixed(1)}%) ${category}`);
                console.log(`      Text: "${preview}..."`);
                console.log(`      Length: ${doc.content.length} chars`);
                console.log('');
            });
            
            // Scoring explanation
            console.log('📖 SCORING EXPLAINED:');
            console.log('   Score = Cosine Similarity between query vector and chunk vector');
            console.log('   Range: 0.0 (completely different) to 1.0 (identical meaning)');
            console.log('   Distance metric: Cosine');
            console.log('   Vector dimensions: 768 (Gemini embeddings)');
            console.log('   Model: text-embedding-004\n');
            
            // Analyze why scores are what they are
            console.log('🧠 WHY THESE SCORES?:');
            relevantDocs.slice(0, 3).forEach((doc, idx) => {
                const score = doc.score;
                const content = doc.content;
                
                // Detect matching keywords
                const queryWords = userQuery.toLowerCase().split(/\W+/);
                const matchedWords = queryWords.filter(w => 
                    content.toLowerCase().includes(w) && w.length > 3
                );
                
                console.log(`   Chunk ${idx + 1} (${score.toFixed(4)}):`);
                if (matchedWords.length > 0) {
                    console.log(`      ✓ Matching keywords: ${matchedWords.slice(0, 3).join(', ')}`);
                }
                if (score < 0.50) {
                    console.log(`      ⚠ Lower score: may be tangentially related or semantic drift`);
                }
                console.log('');
            });
            
            console.log('='.repeat(80) + '\n');
            
            // 2. Build context from retrieved documents
            const context = relevantDocs
                .map((doc, idx) => {
                    const bookTitle = doc.metadata.source || doc.metadata.fileName?.replace('.txt', '') || 'Unknown Source';
                    return `[Source ${idx + 1} - "${bookTitle}"]\n${doc.content}`;
                })
                .join('\n\n---\n\n');
            
            // Record metrics
            performanceMonitor.record('contextSize', context.length);
            performanceMonitor.record('chunksRetrieved', relevantDocs.length);
            
            // 3. Return context and sources for use with Gemini
            return {
                context: context,
                sources: relevantDocs.map(doc => ({
                    text: doc.content.substring(0, 200) + '...',
                    score: doc.score,
                    metadata: doc.metadata
                }))
            };
        } catch (error) {
            console.error('❌ Error in RAG query:', error);
            throw error;
        }
    }

    /**
     * Setup the entire vector database (run once)
     */
    async setup() {
        try {
            console.log('Starting vector database setup...');
            
            // 1. Initialize collection
            await this.initializeCollection();
            
            // 2. Load knowledge base
            const documents = await this.loadKnowledgeBase();
            
            // 3. Index documents
            await this.indexDocuments(documents);
            
            console.log('Vector database setup completed!');
        } catch (error) {
            console.error('Error during setup:', error);
            throw error;
        }
    }

    /**
     * Get collection stats
     */
    async getStats() {
        try {
            const collectionInfo = await this.qdrantClient.getCollection(this.collectionName);
            return {
                pointsCount: collectionInfo.points_count,
                vectorSize: collectionInfo.config.params.vectors.size,
                status: collectionInfo.status
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            return null;
        }
    }

    /**
     * Delete the collection (reset the vector database)
     */
    async deleteCollection() {
        try {
            const collections = await this.qdrantClient.getCollections();
            const exists = collections.collections.some(
                col => col.name === this.collectionName
            );

            if (exists) {
                await this.qdrantClient.deleteCollection(this.collectionName);
                console.log(`✅ Collection '${this.collectionName}' deleted successfully`);
                return true;
            } else {
                console.log(`ℹ️  Collection '${this.collectionName}' does not exist`);
                return false;
            }
        } catch (error) {
            console.error('Error deleting collection:', error);
            throw error;
        }
    }

    /**
     * Reset and rebuild the entire vector database
     */
    async reset() {
        try {
            console.log('🔄 Resetting vector database...\n');
            
            // 1. Delete existing collection
            await this.deleteCollection();
            
            // 2. Run setup again
            await this.setup();
            
            console.log('\n✅ Vector database reset completed!');
        } catch (error) {
            console.error('Error during reset:', error);
            throw error;
        }
    }
}

module.exports = new VectorService();
