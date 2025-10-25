#!/usr/bin/env node

/**
 * Simple test to demonstrate score calculation
 * Run this to see exactly how your 0.63495445 score is calculated
 */

require('dotenv').config();
const vectorService = require('../services/vectorService');

async function testScoreCalculation() {
    console.log('🧪 TESTING SCORE CALCULATION');
    console.log('============================\n');
    
    try {
        // Test with your example query
        const testQuery = "dehydrated skin treatment";
        
        console.log(`🔍 Testing query: "${testQuery}"`);
        console.log('📊 This will show you exactly how the similarity score is calculated\n');
        
        // Enable debug mode to see detailed information
        const results = await vectorService.searchRelevantDocs(testQuery, 3, true);
        
        console.log('\n📈 FINAL RESULTS:');
        console.log('==================');
        
        results.forEach((result, idx) => {
            const score = result.score;
            const percentage = (score * 100).toFixed(2);
            
            console.log(`\n${idx + 1}. Score: ${score.toFixed(8)} (${percentage}%)`);
            console.log(`   Chunk: ${result.metadata.chunkIndex}`);
            console.log(`   Text: "${result.content.substring(0, 100)}..."`);
            
            // Show score interpretation
            if (score >= 0.7) {
                console.log(`   🟢 This is a GOOD match (${percentage}% similarity)`);
            } else if (score >= 0.5) {
                console.log(`   🟡 This is a MODERATE match (${percentage}% similarity)`);
            } else {
                console.log(`   🔴 This is a WEAK match (${percentage}% similarity)`);
            }
        });
        
        console.log('\n💡 HOW THE SCORE IS CALCULATED:');
        console.log('================================');
        console.log('1. Your query is converted to a 768-dimensional vector using Gemini');
        console.log('2. Each document chunk is also a 768-dimensional vector');
        console.log('3. Cosine similarity is calculated: (A·B) / (||A|| × ||B||)');
        console.log('4. Result is a number between 0.0 (no similarity) and 1.0 (identical)');
        console.log('5. Your score of 0.63495445 means ~63.5% semantic similarity');
        
        console.log('\n🎯 TO ANALYZE A SPECIFIC SCORE:');
        console.log('Run: node scripts/debugScore.js "your query here"');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Make sure your vector database is set up:');
        console.log('   npm run setup:rag');
    }
}

testScoreCalculation();
