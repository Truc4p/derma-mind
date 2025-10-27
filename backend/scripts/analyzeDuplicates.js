#!/usr/bin/env node

/**
 * Script to analyze duplicate patterns in the vector database
 * This will help identify if the entire document was processed twice
 */

require('dotenv').config();
const { QdrantClient } = require('@qdrant/js-client-rest');

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const COLLECTION_NAME = 'dermatology_knowledge';

async function analyzeDuplicates() {
    try {
        console.log('🔍 Analyzing duplicate patterns in the vector database...\n');

        // Initialize Qdrant client
        const qdrantClient = new QdrantClient({
            url: QDRANT_URL,
            apiKey: process.env.QDRANT_API_KEY || undefined
        });

        // Get all points from the collection
        const scrollResult = await qdrantClient.scroll(COLLECTION_NAME, {
            limit: 10000,
            with_payload: true,
            with_vector: false
        });

        const points = scrollResult.points;
        console.log(`📊 Total chunks in database: ${points.length}`);

        // Sort by chunk index to see the pattern
        points.sort((a, b) => a.payload.metadata.chunkIndex - b.payload.metadata.chunkIndex);

        // Look for patterns that suggest double processing
        console.log('\n🔍 Looking for duplicate patterns...\n');

        // Check if we have roughly double the expected chunks
        const expectedChunks = Math.floor(points.length / 2);
        console.log(`Expected chunks if no duplication: ~${expectedChunks}`);
        console.log(`Actual chunks: ${points.length}`);
        console.log(`Duplication factor: ${(points.length / expectedChunks).toFixed(2)}x\n`);

        // Look for chunks that appear to be duplicates with different formatting
        const duplicateGroups = [];
        const processedChunks = new Set();

        for (let i = 0; i < points.length; i++) {
            if (processedChunks.has(i)) continue;

            const chunk1 = points[i];
            const text1 = chunk1.payload.text;
            const chunkIndex1 = chunk1.payload.metadata.chunkIndex;

            // Look for similar chunks
            const similarChunks = [];
            for (let j = i + 1; j < points.length; j++) {
                if (processedChunks.has(j)) continue;

                const chunk2 = points[j];
                const text2 = chunk2.payload.text;
                const chunkIndex2 = chunk2.payload.metadata.chunkIndex;

                // Check if texts are very similar (one contains the other or vice versa)
                if (text1.includes(text2) || text2.includes(text1)) {
                    const shorter = text1.length < text2.length ? text1 : text2;
                    const longer = text1.length < text2.length ? text2 : text1;
                    
                    // If the shorter text is at least 80% of the longer text, consider it a duplicate
                    if (shorter.length / longer.length > 0.8) {
                        similarChunks.push({
                            chunkIndex: chunkIndex2,
                            text: text2,
                            isSubset: text1.includes(text2),
                            isSuperset: text2.includes(text1)
                        });
                        processedChunks.add(j);
                    }
                }
            }

            if (similarChunks.length > 0) {
                duplicateGroups.push({
                    original: {
                        chunkIndex: chunkIndex1,
                        text: text1
                    },
                    duplicates: similarChunks
                });
                processedChunks.add(i);
            }
        }

        console.log(`Found ${duplicateGroups.length} groups of duplicate chunks\n`);

        // Show first 10 duplicate groups
        console.log('📋 DUPLICATE GROUPS (first 10):');
        console.log('='.repeat(60));

        duplicateGroups.slice(0, 10).forEach((group, index) => {
            console.log(`\n${index + 1}. Original Chunk ${group.original.chunkIndex}:`);
            console.log(`   Text: "${group.original.text.substring(0, 100)}..."`);
            console.log(`   Length: ${group.original.text.length} chars`);
            
            group.duplicates.forEach(dup => {
                console.log(`   └─ Duplicate Chunk ${dup.chunkIndex}:`);
                console.log(`      Text: "${dup.text.substring(0, 100)}..."`);
                console.log(`      Length: ${dup.text.length} chars`);
                console.log(`      Relationship: ${dup.isSubset ? 'Subset of original' : 'Superset of original'}`);
            });
        });

        if (duplicateGroups.length > 10) {
            console.log(`\n... and ${duplicateGroups.length - 10} more duplicate groups`);
        }

        // Analyze the pattern
        console.log('\n📊 PATTERN ANALYSIS:');
        console.log('='.repeat(30));

        const originalChunks = duplicateGroups.map(g => g.original.chunkIndex).sort((a, b) => a - b);
        const duplicateChunks = duplicateGroups.flatMap(g => g.duplicates.map(d => d.chunkIndex)).sort((a, b) => a - b);

        console.log(`Original chunks range: ${originalChunks[0]} - ${originalChunks[originalChunks.length - 1]}`);
        console.log(`Duplicate chunks range: ${duplicateChunks[0]} - ${duplicateChunks[duplicateChunks.length - 1]}`);

        // Check if there's a clear split (e.g., first half vs second half)
        const midPoint = Math.floor(points.length / 2);
        const firstHalfDuplicates = duplicateChunks.filter(idx => idx < midPoint).length;
        const secondHalfDuplicates = duplicateChunks.filter(idx => idx >= midPoint).length;

        console.log(`\nDuplicates in first half (0-${midPoint}): ${firstHalfDuplicates}`);
        console.log(`Duplicates in second half (${midPoint}-${points.length}): ${secondHalfDuplicates}`);

        // Check for systematic duplication
        if (duplicateGroups.length > points.length * 0.3) {
            console.log('\n⚠️  WARNING: High duplication rate detected!');
            console.log('This suggests the entire document may have been processed twice.');
            console.log('Recommendation: Re-run the chunking process with proper deduplication.');
        }

        // Calculate storage waste
        const totalDuplicateChars = duplicateGroups.reduce((sum, group) => {
            return sum + group.duplicates.reduce((dupSum, dup) => dupSum + dup.text.length, 0);
        }, 0);
        
        const totalChars = points.reduce((sum, point) => sum + point.payload.text.length, 0);
        const wastePercentage = ((totalDuplicateChars / totalChars) * 100).toFixed(1);

        console.log(`\n💾 STORAGE IMPACT:`);
        console.log(`Total characters: ${totalChars.toLocaleString()}`);
        console.log(`Duplicate characters: ${totalDuplicateChars.toLocaleString()}`);
        console.log(`Storage waste: ${wastePercentage}%`);

    } catch (error) {
        console.error('❌ Error analyzing duplicates:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    analyzeDuplicates();
}

module.exports = { analyzeDuplicates };
