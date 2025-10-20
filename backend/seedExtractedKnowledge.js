require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const DermatologyKnowledge = require('./models/DermatologyKnowledge');

/**
 * Script to import extracted knowledge from JSON file to MongoDB
 * This will populate the database with knowledge from extracted-knowledge.json
 */

async function seedExtractedKnowledge() {
    try {
        console.log('🚀 Starting knowledge base import...\n');

        // Connect to MongoDB Atlas
        const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://mongo-api:7TZYsdhwiXhiKRp9@cluster0.18pi3.mongodb.net/skinStudyWeb?retryWrites=true&w=majority';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB Atlas');

        // Read the extracted knowledge JSON file
        const jsonFilePath = path.join(__dirname, 'knowledge-sources', 'pdfs', 'extracted-knowledge.json');
        console.log('📂 Reading extracted knowledge from:', jsonFilePath);

        if (!fs.existsSync(jsonFilePath)) {
            throw new Error(`File not found: ${jsonFilePath}`);
        }

        const rawData = fs.readFileSync(jsonFilePath, 'utf8');
        const extractedKnowledge = JSON.parse(rawData);
        console.log(`📊 Found ${extractedKnowledge.length} knowledge entries\n`);

        // Clear existing knowledge (optional - comment out if you want to keep existing data)
        console.log('🗑️  Clearing existing knowledge base...');
        const deleteResult = await DermatologyKnowledge.deleteMany({});
        console.log(`   Deleted ${deleteResult.deletedCount} existing entries\n`);

        // Import knowledge in batches to avoid memory issues
        const BATCH_SIZE = 100;
        let imported = 0;
        let failed = 0;

        console.log('📥 Importing knowledge entries...');
        for (let i = 0; i < extractedKnowledge.length; i += BATCH_SIZE) {
            const batch = extractedKnowledge.slice(i, i + BATCH_SIZE);
            
            try {
                const result = await DermatologyKnowledge.insertMany(batch, { ordered: false });
                imported += result.length; // Count actual insertions
                
                // Progress indicator
                const progress = Math.round((i + batch.length) / extractedKnowledge.length * 100);
                process.stdout.write(`\r   Progress: ${progress}% (${imported}/${extractedKnowledge.length})`);
            } catch (error) {
                // insertMany with ordered:false can partially succeed
                // Check if error has insertedDocs property
                if (error.insertedDocs) {
                    imported += error.insertedDocs.length;
                    failed += batch.length - error.insertedDocs.length;
                    console.error(`\n   ⚠️  Batch ${i}-${i + batch.length}: ${error.insertedDocs.length} inserted, ${batch.length - error.insertedDocs.length} failed`);
                } else {
                    failed += batch.length;
                    console.error(`\n   ⚠️  Batch ${i}-${i + batch.length} failed:`, error.message);
                }
                
                // Log detailed error info
                if (error.writeErrors && error.writeErrors.length > 0) {
                    console.log(`   📋 First few errors:`);
                    error.writeErrors.slice(0, 3).forEach(err => {
                        console.log(`      - Index ${err.index}: ${err.errmsg}`);
                    });
                }
            }
        }

        console.log(`\n\n✅ Import completed!`);
        console.log(`   Successfully imported: ${imported} entries`);
        if (failed > 0) {
            console.log(`   Failed: ${failed} entries`);
        }

        // Create text indexes for better searching
        console.log('\n📇 Creating search indexes...');
        await DermatologyKnowledge.createIndexes();
        console.log('✅ Search indexes created');

        // Display statistics
        console.log('\n📊 Knowledge Base Statistics:');
        const categories = await DermatologyKnowledge.distinct('category');
        console.log(`   Total categories: ${categories.length}`);
        console.log(`   Categories: ${categories.join(', ')}`);

        const totalEntries = await DermatologyKnowledge.countDocuments();
        console.log(`   Total entries in database: ${totalEntries}`);

        // Sample query to test
        console.log('\n🔍 Testing knowledge retrieval...');
        const sampleQuery = await DermatologyKnowledge.findOne({ 
            keywords: { $in: ['acne', 'skin'] } 
        });
        if (sampleQuery) {
            console.log('✅ Sample entry found:');
            console.log(`   Title: ${sampleQuery.title}`);
            console.log(`   Category: ${sampleQuery.category}`);
            console.log(`   Keywords: ${sampleQuery.keywords.slice(0, 5).join(', ')}...`);
        }

        console.log('\n✨ Knowledge base is ready to use!\n');

        // Close connection
        await mongoose.connection.close();
        console.log('👋 Database connection closed');

    } catch (error) {
        console.error('\n❌ Error seeding knowledge base:', error);
        process.exit(1);
    }
}

// Run the seed function
seedExtractedKnowledge();
