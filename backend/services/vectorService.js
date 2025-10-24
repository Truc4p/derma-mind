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
     * Extract metadata from chunk content (chapter, section, etc.)
     */
    extractMetadataFromChunk(chunk, chunkIndex) {
        const metadata = {
            source: 'Skin Care: Beyond the Basics, 4th Edition by Mark Lees, Ph.D.',
            chunkIndex: chunkIndex,
            chapter: null,
            section: null,
            hasImages: false,
            imageReferences: []
        };

        // Extract chapter (looks for "CHAPTER X" pattern)
        const chapterMatch = chunk.match(/CHAPTER\s+(\d+)\s+([^\n]+)/i);
        if (chapterMatch) {
            metadata.chapter = `Chapter ${chapterMatch[1]}: ${chapterMatch[2].trim()}`;
        }

        // Extract section headers (looks for ## or ### patterns)
        const sectionMatch = chunk.match(/^#+\s+([^\n]+)/m);
        if (sectionMatch && !chapterMatch) {
            metadata.section = sectionMatch[1].trim();
        }

        // Detect figure references
        const imageRegex = /!\[([^\]]*)\]\(images\/([^)]+)\)/g;
        let imageMatch;
        const images = [];
        
        while ((imageMatch = imageRegex.exec(chunk)) !== null) {
            images.push({
                altText: imageMatch[1],
                filename: imageMatch[2]
            });
        }

        if (images.length > 0) {
            metadata.hasImages = true;
            metadata.imageReferences = images;
        }

        return metadata;
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
            
            return chunks.map((chunk, index) => {
                const metadata = this.extractMetadataFromChunk(chunk, index);
                return {
                    pageContent: chunk,
                    metadata: metadata
                };
            });
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
            // 1. Retrieve relevant context (increased from 5 to 10 for better coverage of split content)
            const relevantDocs = await this.searchRelevantDocs(userQuery, 10);
            
            console.log(`📚 Retrieved ${relevantDocs.length} chunks for RAG:`);
            relevantDocs.forEach((doc, idx) => {
                const preview = doc.content.substring(0, 100).replace(/\n/g, ' ');
                const source = doc.metadata.chapter || doc.metadata.section || 'General content';
                console.log(`   ${idx + 1}. [${source}] Score: ${doc.score.toFixed(4)} - "${preview}..."`);
            });
            
            // 2. Build context from retrieved documents with source attribution
            const context = relevantDocs
                .map((doc, idx) => {
                    let sourceAttribution = `[Source ${idx + 1}`;
                    if (doc.metadata.chapter) {
                        sourceAttribution += ` - ${doc.metadata.chapter}`;
                    } else if (doc.metadata.section) {
                        sourceAttribution += ` - ${doc.metadata.section}`;
                    }
                    sourceAttribution += `]`;
                    
                    return `${sourceAttribution}: ${doc.content}`;
                })
                .join('\n\n');
            
            // 3. Prepare unique source references for citation
            const uniqueSources = new Map();
            relevantDocs.forEach(doc => {
                const sourceKey = doc.metadata.chapter || doc.metadata.section || 'General Content';
                if (!uniqueSources.has(sourceKey)) {
                    uniqueSources.set(sourceKey, {
                        reference: sourceKey,
                        hasImages: doc.metadata.hasImages || false,
                        images: doc.metadata.imageReferences || [],
                        bookTitle: doc.metadata.source
                    });
                }
            });
            
            // 4. Return context and sources for use with Gemini
            return {
                context: context,
                sources: Array.from(uniqueSources.values()),
                chunks: relevantDocs.map(doc => ({
                    text: doc.content.substring(0, 200) + '...',
                    score: doc.score,
                    chapter: doc.metadata.chapter,
                    section: doc.metadata.section,
                    hasImages: doc.metadata.hasImages
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
