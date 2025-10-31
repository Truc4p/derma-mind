#!/usr/bin/env node

/**
 * Reset script for clearing the vector database
 * Use this when you want to completely reset and rebuild the knowledge base
 */

require('dotenv').config();
const vectorService = require('../../services/vectorService');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    console.log('⚠️  WARNING: Vector Database Reset\n');
    console.log('This will DELETE all existing data in the vector database.');
    console.log('The database will be rebuilt from your knowledge sources.\n');
    
    rl.question('Are you sure you want to continue? (yes/no): ', async (answer) => {
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
            try {
                console.log('\n🔄 Starting reset process...\n');
                
                // Reset the database
                await vectorService.reset();
                
                // Get and display stats
                console.log('\n📊 Getting collection statistics...');
                const stats = await vectorService.getStats();
                
                if (stats) {
                    console.log('\n✅ Reset Complete!');
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
                
                console.log('\n✨ Vector database has been reset and is ready to use!\n');
                
                process.exit(0);
            } catch (error) {
                console.error('\n❌ Reset failed:', error);
                process.exit(1);
            }
        } else {
            console.log('\n❌ Reset cancelled.');
            process.exit(0);
        }
        
        rl.close();
    });
}

main();
