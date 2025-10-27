#!/usr/bin/env node

/**
 * Script to clean the source document by removing duplicate content
 * This will remove the second half that contains the same content with different formatting
 */

const fs = require('fs').promises;
const path = require('path');

async function cleanSourceDocument() {
    try {
        console.log('🧹 Cleaning source document to remove duplicates...\n');

        const sourcePath = path.join(
            __dirname,
            '../knowledge-sources/extracted-content/skin-care-beyond-the-basics-4th_figures.md'
        );

        // Read the original file
        console.log('📖 Reading source document...');
        const content = await fs.readFile(sourcePath, 'utf-8');
        const lines = content.split('\n');
        
        console.log(`Original file has ${lines.length} lines`);

        // Find the split point - look for the first occurrence of "| FIGURE" pattern
        let splitPoint = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('| FIGURE')) {
                splitPoint = i;
                break;
            }
        }

        if (splitPoint === -1) {
            console.log('❌ Could not find split point. Document may not have duplicates.');
            return;
        }

        console.log(`🔍 Found split point at line ${splitPoint + 1}`);
        console.log(`Split line: "${lines[splitPoint].substring(0, 100)}..."`);

        // Extract the first half (original content)
        const cleanedLines = lines.slice(0, splitPoint);
        const cleanedContent = cleanedLines.join('\n');

        console.log(`Cleaned file will have ${cleanedLines.length} lines`);
        console.log(`Removed ${lines.length - cleanedLines.length} duplicate lines`);

        // Create backup of original file
        const backupPath = sourcePath + '.backup';
        console.log(`\n💾 Creating backup at: ${backupPath}`);
        await fs.writeFile(backupPath, content);

        // Write cleaned content
        console.log('✏️  Writing cleaned content...');
        await fs.writeFile(sourcePath, cleanedContent);

        console.log('\n✅ Source document cleaned successfully!');
        console.log(`📊 Statistics:`);
        console.log(`   Original lines: ${lines.length}`);
        console.log(`   Cleaned lines: ${cleanedLines.length}`);
        console.log(`   Removed lines: ${lines.length - cleanedLines.length}`);
        console.log(`   Reduction: ${(((lines.length - cleanedLines.length) / lines.length) * 100).toFixed(1)}%`);

        console.log('\n🔄 Next steps:');
        console.log('1. Re-run the vector database setup to re-index with cleaned content');
        console.log('2. Test the RAG system to ensure it works correctly');
        console.log('3. Verify that duplicate chunks are eliminated');

    } catch (error) {
        console.error('❌ Error cleaning source document:', error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    cleanSourceDocument();
}

module.exports = { cleanSourceDocument };
