#!/usr/bin/env node

/**
 * Setup script for initializing the vector database with dermatology knowledge
 * Run this once to index all your knowledge base into Qdrant
 */

require('dotenv').config();
const vectorService = require('../../services/vectorService');

async function main() {
    console.log('🚀 Starting Vector Database Setup...\n');
    
    try {
        // Run the complete setup
        await vectorService.setup();
        
        // Get and display stats
        console.log('\n📊 Getting collection statistics...');
        const stats = await vectorService.getStats();
        
        if (stats) {
            console.log('\n✅ Setup Complete!');
            console.log('=================');
            console.log(`Collection Name: ${vectorService.collectionName}`);
            console.log(`Total Documents: ${stats.pointsCount}`);
            console.log(`Vector Size: ${stats.vectorSize}`);
            console.log(`Status: ${stats.status}`);
        }
        
        // Test a sample query
        console.log('\n🔍 Testing sample query...');
        const testQuery = "What is acne and how to treat it?";
        const results = await vectorService.searchRelevantDocs(testQuery, 3);
        
        console.log(`\nQuery: "${testQuery}"`);
        console.log(`Found ${results.length} relevant documents:`);
        results.forEach((doc, idx) => {
            console.log(`\n${idx + 1}. Score: ${doc.score.toFixed(4)}`);
            console.log(`   Preview: ${doc.content.substring(0, 150)}...`);
        });
        
        console.log('\n✨ Vector database is ready to use!');
        console.log('You can now start your backend server and use the AI Dermatology Expert.\n');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Setup failed:', error);
        process.exit(1);
    }
}

main();
