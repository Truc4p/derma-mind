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
    async searchRelevantDocs(query, limit = 5) {
        try {
            // Generate embedding for the query
            const queryEmbedding = await this.embeddings.embedQuery(query);
            
            // Search in Qdrant
            const searchResults = await this.qdrantClient.search(this.collectionName, {
                vector: queryEmbedding,
                limit: limit,
                with_payload: true
            });
            
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
     * Complete RAG pipeline: search + generate response
     */
    async ragQuery(userQuery, conversationHistory = []) {
        try {
            // 1. Retrieve relevant context (increased from 5 to 8 for better coverage)
            const relevantDocs = await this.searchRelevantDocs(userQuery, 8);
            
            // 2. Build context from retrieved documents
            const context = relevantDocs
                .map((doc, idx) => `[Source ${idx + 1}]: ${doc.content}`)
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
            console.error('Error in RAG query:', error);
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
