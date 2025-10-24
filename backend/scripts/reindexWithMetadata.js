/**
 * Re-index the vector database with enhanced metadata
 * This adds chapter, section, and image reference metadata to each chunk
 */

const vectorService = require('../services/vectorService');

async function reindex() {
    try {
        console.log('🔄 Starting re-indexing with enhanced metadata...\n');
        
        // This will:
        // 1. Initialize collection (if not exists)
        // 2. Load knowledge base with NEW metadata extraction
        // 3. Index documents with enhanced metadata
        await vectorService.setup();
        
        console.log('\n✅ Re-indexing completed successfully!');
        console.log('\nEnhanced metadata now includes:');
        console.log('  - Chapter titles (e.g., "Chapter 1: Advanced Anatomy")');
        console.log('  - Section headers');
        console.log('  - Image references and figure detection');
        console.log('  - Book source attribution');
        
        // Show stats
        const stats = await vectorService.getStats();
        if (stats) {
            console.log('\n📊 Collection Statistics:');
            console.log(`  - Total chunks: ${stats.pointsCount}`);
            console.log(`  - Vector size: ${stats.vectorSize}`);
            console.log(`  - Status: ${stats.status}`);
        }
        
        console.log('\n🎉 Your RAG system now has proper source references!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during re-indexing:', error);
        process.exit(1);
    }
}

reindex();
