const { QdrantClient } = require('@qdrant/js-client-rest');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { Document } = require('langchain/document');
const fs = require('fs').promises;
const path = require('path');

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
     * Load and process the markdown knowledge base
     */
    async loadKnowledgeBase() {
        try {
            const knowledgeBasePath = path.join(
                __dirname,
                '../knowledge-sources/extracted-content/skin-care-beyond-the-basics-4th_figures.md'
            );
            
            const content = await fs.readFile(knowledgeBasePath, 'utf-8');
            
            // Split the text into chunks
            const textSplitter = new RecursiveCharacterTextSplitter({
                chunkSize: 1500,  // Increased from 1000 to capture more complete sections
                chunkOverlap: 300, // Increased overlap to ensure continuity
                separators: ['\n\n', '\n', '. ', ' ', '']
            });

            const chunks = await textSplitter.splitText(content);
            
            console.log(`Split knowledge base into ${chunks.length} chunks`);
            
            return chunks.map((chunk, index) => ({
                pageContent: chunk,
                metadata: {
                    source: 'skin-care-beyond-the-basics-4th',
                    chunkIndex: index
                }
            }));
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
            
            const batchSize = 100;
            for (let i = 0; i < documents.length; i += batchSize) {
                const batch = documents.slice(i, i + batchSize);
                
                // Generate embeddings for batch
                const texts = batch.map(doc => doc.pageContent);
                const embeddings = await this.embeddings.embedDocuments(texts);
                
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
                
                console.log(`Indexed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documents.length / batchSize)}`);
            }
            
            console.log('Indexing completed successfully');
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
            
            // Search in Qdrant
            const searchResults = await this.qdrantClient.search(this.collectionName, {
                vector: queryEmbedding,
                limit: limit,
                with_payload: true
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
     * Helper: Detect if chunk contains figures
     */
    hasFigures(text) {
        return /!\[Figure|\(images\/figure_/i.test(text);
    }

    /**
     * Complete RAG pipeline: search + generate response with detailed scoring
     */
    async ragQuery(userQuery, conversationHistory = [], debugMode = false) {
        try {
            console.log('\n' + '='.repeat(80));
            console.log('🔍 RAG QUERY ANALYSIS');
            console.log('='.repeat(80));
            console.log(`📝 User Query: "${userQuery}"`);
            console.log(`📊 Query Length: ${userQuery.length} chars, ${userQuery.split(' ').length} words`);
            
            // 1. Retrieve relevant context (increased from 5 to 10 for better coverage of split content)
            const relevantDocs = await this.searchRelevantDocs(userQuery, 10, debugMode);
            
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
                const hasFigs = this.hasFigures(doc.content);
                const figLabel = hasFigs ? '📸 HAS FIGURES' : '   ';
                const preview = doc.content
                    .substring(0, 120)
                    .replace(/\n/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                
                console.log(`   ${idx + 1}. Chunk #${chunkId}`);
                console.log(`      Score: ${score.toFixed(4)} (${(score * 100).toFixed(1)}%) ${category} ${figLabel}`);
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
                
                const figureMatch = /Figure \d+/i.test(userQuery) && /Figure \d+/.test(content);
                
                console.log(`   Chunk ${idx + 1} (${score.toFixed(4)}):`);
                if (matchedWords.length > 0) {
                    console.log(`      ✓ Matching keywords: ${matchedWords.slice(0, 3).join(', ')}`);
                }
                if (figureMatch) {
                    console.log(`      ✓ Figure reference match detected`);
                }
                if (score < 0.50) {
                    console.log(`      ⚠ Lower score: may be tangentially related or semantic drift`);
                }
                console.log('');
            });
            
            console.log('='.repeat(80) + '\n');
            
            // 2. Build context from retrieved documents
            const context = relevantDocs
                .map((doc, idx) => `[Source ${idx + 1} - Chunk ${doc.metadata.chunkIndex}]: ${doc.content}`)
                .join('\n\n');
            
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
}

module.exports = new VectorService();
