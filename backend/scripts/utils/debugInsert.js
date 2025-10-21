require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const DermatologyKnowledge = require('../../models/DermatologyKnowledge');

async function debugInsert() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Read data
        const data = JSON.parse(fs.readFileSync('../../knowledge-sources/pdfs/extracted-knowledge.json', 'utf8'));
        console.log(`📊 JSON file has ${data.length} entries\n`);

        // Clear existing
        await DermatologyKnowledge.deleteMany({});
        console.log('🗑️  Cleared database\n');

        // Try inserting one by one to see which fail
        let succeeded = 0;
        let failed = 0;
        const failedEntries = [];

        for (let i = 0; i < data.length; i++) {
            try {
                await DermatologyKnowledge.create(data[i]);
                succeeded++;
            } catch (error) {
                failed++;
                failedEntries.push({
                    index: i + 1,
                    title: data[i].title,
                    error: error.message
                });
            }
        }

        console.log(`✅ Successfully inserted: ${succeeded}`);
        console.log(`❌ Failed to insert: ${failed}\n`);

        if (failedEntries.length > 0) {
            console.log('Failed entries:');
            failedEntries.forEach(e => {
                console.log(`  ${e.index}. ${e.title}`);
                console.log(`     Error: ${e.error}\n`);
            });
        }

        const dbCount = await DermatologyKnowledge.countDocuments();
        console.log(`\n📊 Total in database: ${dbCount}`);

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

debugInsert();
