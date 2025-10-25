const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');

class ScoreAnalyzer {
    constructor() {
        this.embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            modelName: 'text-embedding-004'
        });
    }

    /**
     * Analyze why a specific score was calculated
     */
    async analyzeScore(query, documentText, actualScore) {
        console.log('\n' + '='.repeat(80));
        console.log('🔍 SCORE ANALYSIS BREAKDOWN');
        console.log('='.repeat(80));
        
        // Generate embeddings
        const [queryEmbedding, docEmbedding] = await Promise.all([
            this.embeddings.embedQuery(query),
            this.embeddings.embedQuery(documentText)
        ]);

        // Calculate cosine similarity manually
        const manualScore = this.calculateCosineSimilarity(queryEmbedding, docEmbedding);
        
        console.log(`📝 Query: "${query}"`);
        console.log(`📄 Document: "${documentText.substring(0, 100)}..."`);
        console.log(`\n🎯 SCORE COMPARISON:`);
        console.log(`   Qdrant Score: ${actualScore.toFixed(8)}`);
        console.log(`   Manual Calc:  ${manualScore.toFixed(8)}`);
        console.log(`   Difference:   ${Math.abs(actualScore - manualScore).toFixed(8)}`);
        
        // Vector analysis
        console.log(`\n📊 VECTOR ANALYSIS:`);
        console.log(`   Query Vector Length: ${queryEmbedding.length}`);
        console.log(`   Doc Vector Length:   ${docEmbedding.length}`);
        console.log(`   Query Magnitude:     ${this.calculateMagnitude(queryEmbedding).toFixed(6)}`);
        console.log(`   Doc Magnitude:       ${this.calculateMagnitude(docEmbedding).toFixed(6)}`);
        
        // Dot product breakdown
        const dotProduct = this.calculateDotProduct(queryEmbedding, docEmbedding);
        console.log(`   Dot Product:         ${dotProduct.toFixed(6)}`);
        
        // Semantic analysis
        this.analyzeSemanticSimilarity(query, documentText, actualScore);
        
        // Vector dimension analysis
        this.analyzeVectorDimensions(queryEmbedding, docEmbedding);
        
        console.log('='.repeat(80) + '\n');
        
        return {
            actualScore,
            manualScore,
            queryEmbedding,
            docEmbedding,
            dotProduct,
            queryMagnitude: this.calculateMagnitude(queryEmbedding),
            docMagnitude: this.calculateMagnitude(docEmbedding)
        };
    }

    /**
     * Calculate cosine similarity manually
     */
    calculateCosineSimilarity(vectorA, vectorB) {
        const dotProduct = this.calculateDotProduct(vectorA, vectorB);
        const magnitudeA = this.calculateMagnitude(vectorA);
        const magnitudeB = this.calculateMagnitude(vectorB);
        
        return dotProduct / (magnitudeA * magnitudeB);
    }

    /**
     * Calculate dot product of two vectors
     */
    calculateDotProduct(vectorA, vectorB) {
        return vectorA.reduce((sum, val, index) => sum + (val * vectorB[index]), 0);
    }

    /**
     * Calculate magnitude of a vector
     */
    calculateMagnitude(vector) {
        return Math.sqrt(vector.reduce((sum, val) => sum + (val * val), 0));
    }

    /**
     * Analyze semantic similarity factors
     */
    analyzeSemanticSimilarity(query, document, score) {
        console.log(`\n🧠 SEMANTIC ANALYSIS:`);
        
        // Keyword matching
        const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
        const docWords = document.toLowerCase().split(/\W+/).filter(w => w.length > 2);
        
        const matchingWords = queryWords.filter(word => docWords.includes(word));
        const uniqueQueryWords = [...new Set(queryWords)];
        const uniqueDocWords = [...new Set(docWords)];
        
        console.log(`   Query Words: ${uniqueQueryWords.length} unique`);
        console.log(`   Doc Words:   ${uniqueDocWords.length} unique`);
        console.log(`   Matching:    ${matchingWords.length}/${uniqueQueryWords.length} (${(matchingWords.length/uniqueQueryWords.length*100).toFixed(1)}%)`);
        
        if (matchingWords.length > 0) {
            console.log(`   Matched:     ${matchingWords.slice(0, 5).join(', ')}${matchingWords.length > 5 ? '...' : ''}`);
        }
        
        // Score interpretation
        console.log(`\n📈 SCORE INTERPRETATION:`);
        if (score >= 0.9) {
            console.log(`   🟢 EXCELLENT (${(score*100).toFixed(1)}%): Very high semantic similarity`);
        } else if (score >= 0.7) {
            console.log(`   🟡 GOOD (${(score*100).toFixed(1)}%): Strong semantic similarity`);
        } else if (score >= 0.5) {
            console.log(`   🟡 MODERATE (${(score*100).toFixed(1)}%): Moderate semantic similarity`);
        } else if (score >= 0.3) {
            console.log(`   🔴 WEAK (${(score*100).toFixed(1)}%): Low semantic similarity`);
        } else {
            console.log(`   ⚫ POOR (${(score*100).toFixed(1)}%): Very low semantic similarity`);
        }
        
        // Context analysis
        const queryContext = this.extractContext(query);
        const docContext = this.extractContext(document);
        
        console.log(`\n🎯 CONTEXT ANALYSIS:`);
        console.log(`   Query Context: ${queryContext}`);
        console.log(`   Doc Context:   ${docContext}`);
        
        if (queryContext === docContext) {
            console.log(`   ✅ Same domain - explains higher score`);
        } else {
            console.log(`   ⚠️  Different domains - may explain lower score`);
        }
    }

    /**
     * Analyze vector dimensions
     */
    analyzeVectorDimensions(queryVector, docVector) {
        console.log(`\n🔢 VECTOR DIMENSION ANALYSIS:`);
        
        // Find dimensions with highest values
        const queryMaxIndices = this.getTopIndices(queryVector, 5);
        const docMaxIndices = this.getTopIndices(docVector, 5);
        
        console.log(`   Query Top Dims: ${queryMaxIndices.map(i => `${i}:${queryVector[i].toFixed(4)}`).join(', ')}`);
        console.log(`   Doc Top Dims:   ${docMaxIndices.map(i => `${i}:${docVector[i].toFixed(4)}`).join(', ')}`);
        
        // Check for overlapping high-value dimensions
        const overlap = queryMaxIndices.filter(i => docMaxIndices.includes(i));
        console.log(`   Overlap:        ${overlap.length}/5 dimensions (${overlap.length > 0 ? 'Strong' : 'Weak'} semantic alignment)`);
        
        // Vector statistics
        const queryStats = this.getVectorStats(queryVector);
        const docStats = this.getVectorStats(docVector);
        
        console.log(`\n📊 VECTOR STATISTICS:`);
        console.log(`   Query - Mean: ${queryStats.mean.toFixed(4)}, Std: ${queryStats.std.toFixed(4)}, Range: [${queryStats.min.toFixed(4)}, ${queryStats.max.toFixed(4)}]`);
        console.log(`   Doc   - Mean: ${docStats.mean.toFixed(4)}, Std: ${docStats.std.toFixed(4)}, Range: [${docStats.min.toFixed(4)}, ${docStats.max.toFixed(4)}]`);
    }

    /**
     * Get top N indices with highest values
     */
    getTopIndices(vector, n) {
        return vector
            .map((val, index) => ({ val, index }))
            .sort((a, b) => b.val - a.val)
            .slice(0, n)
            .map(item => item.index);
    }

    /**
     * Get vector statistics
     */
    getVectorStats(vector) {
        const mean = vector.reduce((sum, val) => sum + val, 0) / vector.length;
        const variance = vector.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / vector.length;
        const std = Math.sqrt(variance);
        const min = Math.min(...vector);
        const max = Math.max(...vector);
        
        return { mean, std, min, max };
    }

    /**
     * Extract context/domain from text
     */
    extractContext(text) {
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('skin') || lowerText.includes('dermat') || lowerText.includes('acne')) {
            return 'Dermatology';
        } else if (lowerText.includes('treatment') || lowerText.includes('therapy')) {
            return 'Medical Treatment';
        } else if (lowerText.includes('ingredient') || lowerText.includes('product')) {
            return 'Skincare Products';
        } else if (lowerText.includes('routine') || lowerText.includes('care')) {
            return 'Skincare Routine';
        } else {
            return 'General';
        }
    }

    /**
     * Compare multiple documents with the same query
     */
    async compareDocuments(query, documents) {
        console.log('\n' + '='.repeat(80));
        console.log('📊 DOCUMENT COMPARISON ANALYSIS');
        console.log('='.repeat(80));
        console.log(`Query: "${query}"\n`);
        
        const queryEmbedding = await this.embeddings.embedQuery(query);
        
        for (let i = 0; i < documents.length; i++) {
            const doc = documents[i];
            const docEmbedding = await this.embeddings.embedQuery(doc.text);
            const score = this.calculateCosineSimilarity(queryEmbedding, docEmbedding);
            
            console.log(`📄 Document ${i + 1}:`);
            console.log(`   Score: ${score.toFixed(6)} (${(score * 100).toFixed(2)}%)`);
            console.log(`   Text: "${doc.text.substring(0, 80)}..."`);
            console.log(`   Source: ${doc.metadata?.source || 'Unknown'}`);
            console.log('');
        }
        
        console.log('='.repeat(80) + '\n');
    }
}

module.exports = new ScoreAnalyzer();
