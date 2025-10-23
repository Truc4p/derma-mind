#!/usr/bin/env node

/**
 * Test script for RAG system
 * Tests vector search functionality
 */

require('dotenv').config();
const vectorService = require('../services/vectorService');

const testQueries = [
    "What causes acne and how to treat it?",
    "Best ingredients for anti-aging?",
    "How to treat sensitive skin?",
    "What is rosacea and its symptoms?",
    "Recommended skincare routine for oily skin",
    "How do retinoids work on the skin?",
    "What are the layers of the skin?",
    "How to prevent sun damage?"
];

async function testVectorSearch() {
    console.log('🧪 Testing Vector Search System\n');
    console.log('================================\n');

    try {
        // Get stats first
        const stats = await vectorService.getStats();
        if (!stats) {
            console.error('❌ Vector database not initialized!');
            console.log('Please run: npm run setup:rag');
            process.exit(1);
        }

        console.log('📊 Collection Stats:');
        console.log(`   Documents: ${stats.pointsCount}`);
        console.log(`   Vector Size: ${stats.vectorSize}`);
        console.log(`   Status: ${stats.status}\n`);

        // Test each query
        for (let i = 0; i < testQueries.length; i++) {
            const query = testQueries[i];
            console.log(`\n🔍 Test ${i + 1}/${testQueries.length}: "${query}"`);
            console.log('─'.repeat(60));

            const results = await vectorService.searchRelevantDocs(query, 3);

            if (results.length === 0) {
                console.log('   ⚠️  No results found');
                continue;
            }

            results.forEach((doc, idx) => {
                console.log(`\n   ${idx + 1}. Relevance Score: ${(doc.score * 100).toFixed(2)}%`);
                console.log(`      Source: ${doc.metadata.source} (Chunk ${doc.metadata.chunkIndex})`);
                console.log(`      Preview: ${doc.content.substring(0, 120).replace(/\n/g, ' ')}...`);
            });
        }

        console.log('\n\n✅ All tests completed!');
        console.log('\n💡 Next steps:');
        console.log('   1. Start the backend server: npm start');
        console.log('   2. Test the chat endpoint with the frontend');
        console.log('   3. Monitor response quality and adjust if needed\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    }
}

// Test RAG query (full pipeline)
async function testRAGPipeline() {
    console.log('\n🔬 Testing Full RAG Pipeline\n');
    console.log('================================\n');

    try {
        const query = "What are the best treatments for acne?";
        console.log(`Query: "${query}"\n`);

        const result = await vectorService.ragQuery(query);

        console.log('📚 Retrieved Context:');
        console.log('─'.repeat(60));
        console.log(result.context.substring(0, 500) + '...\n');

        console.log('📖 Sources Used:');
        result.sources.forEach((source, idx) => {
            console.log(`   ${idx + 1}. ${source.text} (Score: ${(source.score * 100).toFixed(2)}%)`);
        });

        console.log('\n✅ RAG pipeline working correctly!');
    } catch (error) {
        console.error('\n❌ RAG test failed:', error);
    }
}

// Run tests
async function main() {
    await testVectorSearch();
    await testRAGPipeline();
}

main();
