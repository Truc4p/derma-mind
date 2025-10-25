#!/usr/bin/env node

/**
 * Debug script to analyze how similarity scores are calculated
 * Usage: node scripts/debugScore.js "your query here"
 */

require('dotenv').config();
const vectorService = require('../services/vectorService');
const scoreAnalyzer = require('../utils/scoreAnalyzer');

async function debugScoreCalculation(query) {
    console.log('🔍 DEBUGGING SCORE CALCULATION');
    console.log('================================\n');
    
    try {
        // Get search results from your RAG system
        console.log(`🔎 Searching for: "${query}"`);
        const results = await vectorService.searchRelevantDocs(query, 3);
        
        if (results.length === 0) {
            console.log('❌ No results found');
            return;
        }
        
        console.log(`\n📊 Found ${results.length} results:\n`);
        
        // Analyze each result
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            console.log(`\n${'─'.repeat(60)}`);
            console.log(`📄 RESULT ${i + 1} - Score: ${result.score.toFixed(8)}`);
            console.log(`${'─'.repeat(60)}`);
            
            // Use the score analyzer to break down the calculation
            await scoreAnalyzer.analyzeScore(
                query,
                result.content,
                result.score
            );
        }
        
        // Show comparison between results
        console.log('\n' + '='.repeat(80));
        console.log('📈 SCORE COMPARISON SUMMARY');
        console.log('='.repeat(80));
        
        results.forEach((result, idx) => {
            const percentage = (result.score * 100).toFixed(2);
            const category = getScoreCategory(result.score);
            console.log(`${idx + 1}. ${percentage}% ${category} - Chunk ${result.metadata.chunkIndex}`);
        });
        
        console.log('\n💡 KEY INSIGHTS:');
        console.log('   • Scores are calculated using cosine similarity between 768-dimensional vectors');
        console.log('   • Each vector represents semantic meaning via Gemini text-embedding-004');
        console.log('   • Higher scores = more semantically similar content');
        console.log('   • Scores > 0.7 are considered good matches');
        console.log('   • Scores < 0.5 may be tangentially related');
        
    } catch (error) {
        console.error('❌ Error during score analysis:', error);
    }
}

function getScoreCategory(score) {
    if (score >= 0.90) return '🟢 PERFECT';
    if (score >= 0.75) return '🟢 EXCELLENT';
    if (score >= 0.60) return '🟡 GOOD';
    if (score >= 0.45) return '🟡 FAIR';
    if (score >= 0.30) return '🔴 WEAK';
    return '⚫ POOR';
}

async function analyzeSpecificScore() {
    console.log('\n🎯 ANALYZING YOUR SPECIFIC EXAMPLE');
    console.log('===================================\n');
    
    // Your example data
    const exampleQuery = "dehydrated skin treatment";
    const exampleDoc = ". Clients often call their dehydrated skin \"dry,\" but it is important to distinguish between a lack of sebum flow and a lack of moisture in the skin surface, which is dehydration. Dehydration can affe...";
    const exampleScore = 0.6348387;
    
    console.log('📝 Example Query:', exampleQuery);
    console.log('📄 Example Document:', exampleDoc);
    console.log('🎯 Example Score:', exampleScore);
    console.log('');
    
    await scoreAnalyzer.analyzeScore(exampleQuery, exampleDoc, exampleScore);
}

// Main execution
async function main() {
    const query = process.argv[2];
    
    if (!query) {
        console.log('Usage: node scripts/debugScore.js "your query here"');
        console.log('\nExample: node scripts/debugScore.js "dehydrated skin treatment"');
        console.log('\nOr run without arguments to analyze the specific example:');
        await analyzeSpecificScore();
        return;
    }
    
    await debugScoreCalculation(query);
}

main().catch(console.error);
