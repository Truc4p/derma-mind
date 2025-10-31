#!/usr/bin/env node

/**
 * Retry specific failed batches
 * Usage: node scripts/retryFailedBatches.js 264
 * Or: node scripts/retryFailedBatches.js 264,118,200 (comma-separated)
 */

require('dotenv').config();
const vectorService = require('../../services/vectorService');

async function main() {
    // Get batch numbers from command line argument
    const batchArg = process.argv[2];
    
    if (!batchArg) {
        console.error('❌ Please provide batch number(s) to retry');
        console.log('Usage: node scripts/retryFailedBatches.js 264');
        console.log('   Or: node scripts/retryFailedBatches.js 264,118,200');
        process.exit(1);
    }
    
    const batchNumbers = batchArg.split(',').map(b => parseInt(b.trim()));
    const batchSize = 50;
    
    console.log('🔄 Retrying Failed Batches...\n');
    console.log(`📍 Batches to retry: ${batchNumbers.join(', ')}\n`);
    
    try {
        // Check if collection exists
        const stats = await vectorService.getStats();
        if (!stats) {
            console.error('❌ Collection does not exist. Please run setupVectorDB.js first.');
            process.exit(1);
        }
        
        console.log(`📊 Current collection status:`);
        console.log(`   Collection: ${vectorService.collectionName}`);
        console.log(`   Documents indexed: ${stats.pointsCount}`);
        console.log(`   Vector size: ${stats.vectorSize}\n`);
        
        // Load all documents
        console.log('📚 Loading knowledge base...');
        const documents = await vectorService.loadKnowledgeBase();
        console.log(`✅ Loaded ${documents.length} documents\n`);
        
        let successCount = 0;
        let failCount = 0;
        
        // Process each failed batch
        for (const batchNum of batchNumbers) {
            const startIndex = (batchNum - 1) * batchSize;
            const endIndex = Math.min(startIndex + batchSize, documents.length);
            
            if (startIndex >= documents.length) {
                console.log(`⚠️  Batch ${batchNum}: Index ${startIndex} is beyond total documents (${documents.length})`);
                continue;
            }
            
            const batch = documents.slice(startIndex, endIndex);
            console.log(`\n🔄 Retrying batch ${batchNum} (documents ${startIndex}-${endIndex-1})...`);
            console.log(`   Batch contains ${batch.length} documents`);
            
            // Try with more retries and longer delays
            const success = await retryBatch(batch, startIndex, batchNum, 5);
            
            if (success) {
                successCount++;
                console.log(`✅ Batch ${batchNum} successfully indexed!`);
            } else {
                failCount++;
                console.log(`❌ Batch ${batchNum} failed after all attempts`);
                
                // Try indexing documents one by one for this batch
                console.log(`\n🔍 Attempting to index documents one by one for batch ${batchNum}...`);
                const oneByOneSuccess = await indexOneByOne(batch, startIndex, batchNum);
                if (oneByOneSuccess > 0) {
                    console.log(`✅ Successfully indexed ${oneByOneSuccess}/${batch.length} documents individually`);
                }
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('Retry Summary:');
        console.log('='.repeat(60));
        console.log(`✅ Successfully retried: ${successCount}/${batchNumbers.length}`);
        console.log(`❌ Still failed: ${failCount}/${batchNumbers.length}`);
        console.log('='.repeat(60));
        
        // Get final stats
        const finalStats = await vectorService.getStats();
        console.log(`\n📊 Final collection stats:`);
        console.log(`   Total documents: ${finalStats.pointsCount}`);
        
        process.exit(failCount > 0 ? 1 : 0);
    } catch (error) {
        console.error('\n❌ Retry failed:', error);
        process.exit(1);
    }
}

/**
 * Retry a single batch with multiple attempts
 */
async function retryBatch(batch, startIndex, batchNum, maxRetries = 5) {
    let retries = maxRetries;
    
    while (retries > 0) {
        try {
            console.log(`   Attempt ${maxRetries - retries + 1}/${maxRetries}...`);
            
            // Generate embeddings for batch
            const texts = batch.map(doc => doc.pageContent);
            
            // Add a small delay before generating embeddings to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const embeddings = await vectorService.embeddings.embedDocuments(texts);
            
            // Validate embeddings
            const validEmbeddings = embeddings.every(emb => 
                Array.isArray(emb) && emb.length === 768 && emb.some(v => v !== 0)
            );
            
            if (!validEmbeddings) {
                const invalidIndices = embeddings
                    .map((emb, idx) => (!Array.isArray(emb) || emb.length !== 768 || !emb.some(v => v !== 0)) ? idx : -1)
                    .filter(idx => idx !== -1);
                throw new Error(`Invalid embeddings at indices: ${invalidIndices.join(', ')}`);
            }
            
            // Prepare points for Qdrant
            const points = batch.map((doc, index) => ({
                id: startIndex + index,
                vector: embeddings[index],
                payload: {
                    text: doc.pageContent,
                    metadata: doc.metadata
                }
            }));
            
            // Upload to Qdrant
            await vectorService.qdrantClient.upsert(vectorService.collectionName, {
                wait: true,
                points: points
            });
            
            return true; // Success!
            
        } catch (error) {
            retries--;
            console.log(`   ⚠️  Failed: ${error.message}`);
            
            if (retries > 0) {
                const delay = 3000 * (maxRetries - retries); // Increasing delay
                console.log(`   Waiting ${delay/1000}s before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    return false; // All retries failed
}

/**
 * Try to index documents one by one for a failed batch
 */
async function indexOneByOne(batch, startIndex, batchNum) {
    let successCount = 0;
    
    for (let i = 0; i < batch.length; i++) {
        const doc = batch[i];
        const docIndex = startIndex + i;
        
        try {
            console.log(`   Indexing document ${i + 1}/${batch.length} (ID: ${docIndex})...`);
            
            // Small delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Generate embedding for single document
            const embedding = await vectorService.embeddings.embedQuery(doc.pageContent);
            
            // Validate
            if (!Array.isArray(embedding) || embedding.length !== 768 || !embedding.some(v => v !== 0)) {
                console.log(`   ⚠️  Document ${i + 1}: Invalid embedding - skipping`);
                continue;
            }
            
            // Upload to Qdrant
            await vectorService.qdrantClient.upsert(vectorService.collectionName, {
                wait: true,
                points: [{
                    id: docIndex,
                    vector: embedding,
                    payload: {
                        text: doc.pageContent,
                        metadata: doc.metadata
                    }
                }]
            });
            
            successCount++;
            console.log(`   ✅ Document ${i + 1} indexed successfully`);
            
        } catch (error) {
            console.log(`   ❌ Document ${i + 1} failed: ${error.message}`);
        }
    }
    
    return successCount;
}

main();
