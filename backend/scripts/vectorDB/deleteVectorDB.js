#!/usr/bin/env node

/**
 * Delete script for clearing the vector database
 * Use this when you want to delete the collection before adding new knowledge
 */

require('dotenv').config();
const vectorService = require('../../services/vectorService');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    console.log('⚠️  WARNING: Delete Vector Database\n');
    console.log('This will DELETE all existing data in the vector database.');
    console.log('You will need to run setupVectorDB.js afterwards to rebuild it.\n');
    
    rl.question('Are you sure you want to delete the collection? (yes/no): ', async (answer) => {
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
            try {
                console.log('\n🗑️  Deleting collection...\n');
                
                // Delete the collection
                const deleted = await vectorService.deleteCollection();
                
                if (deleted) {
                    console.log('\n✅ Collection deleted successfully!');
                    console.log('You can now:');
                    console.log('1. Update your knowledge source file');
                    console.log('2. Run: node scripts/setupVectorDB.js');
                } else {
                    console.log('\nℹ️  No collection to delete.');
                }
                
                process.exit(0);
            } catch (error) {
                console.error('\n❌ Delete failed:', error);
                process.exit(1);
            }
        } else {
            console.log('\n❌ Delete cancelled.');
            process.exit(0);
        }
        
        rl.close();
    });
}

main();
