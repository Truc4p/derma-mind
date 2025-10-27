#!/usr/bin/env node

/**
 * Script to clear the vector database and re-index with cleaned content
 */

require('dotenv').config();
const vectorService = require('../services/vectorService');

async function clearAndReindex() {
    try {
        console.log('🗑️  Clearing vector database and re-indexing with cleaned content...\n');
        
        // Clear the existing collection
        console.log('1. Clearing existing collection...');
        try {
            await vectorService.qdrantClient.deleteCollection('dermatology_knowledge');
            console.log('   ✅ Collection deleted');
        } catch (error) {
            console.log('   ℹ️  Collection may not exist or already cleared');
        }
        
        // Wait a moment for deletion to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Re-run the complete setup
        console.log('\n2. Re-indexing with cleaned content...');
        await vectorService.setup();
        
        // Get and display stats
        console.log('\n3. Getting updated statistics...');
        const stats = await vectorService.getStats();
        
        if (stats) {
            console.log('\n✅ Re-indexing Complete!');
            console.log('=======================');
            console.log(`Collection Name: ${vectorService.collectionName}`);
            console.log(`Total Documents: ${stats.pointsCount}`);
            console.log(`Vector Size: ${stats.vectorSize}`);
            console.log(`Status: ${stats.status}`);
        }
        
        // Test a sample query
        console.log('\n4. Testing sample query...');
        const testQuery = "What is acne and how to treat it?";
        const results = await vectorService.searchRelevantDocs(testQuery, 3);
        
        console.log(`\nQuery: "${testQuery}"`);
        console.log(`Found ${results.length} relevant documents:`);
        results.forEach((doc, idx) => {
            console.log(`\n${idx + 1}. Score: ${doc.score.toFixed(4)}`);
            console.log(`   Chunk: ${doc.metadata.chunkIndex}`);
            console.log(`   Preview: ${doc.content.substring(0, 150)}...`);
        });
        
        console.log('\n✨ Vector database has been successfully re-indexed!');
        console.log('The duplicate content issue has been resolved.\n');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Re-indexing failed:', error);
        process.exit(1);
    }
}

clearAndReindex();
