/**
 * Script to retrieve full text from Qdrant vector database
 * Usage: node getChunkText.js <chunk_index>
 * Example: node getChunkText.js 733
 */

const axios = require('axios');

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const COLLECTION_NAME = 'dermatology_knowledge';

async function getChunkText(chunkIndex) {
    try {
        console.log(`🔍 Searching for chunk index: ${chunkIndex} in collection: ${COLLECTION_NAME}`);
        console.log('');

        const response = await axios.post(
            `${QDRANT_URL}/collections/${COLLECTION_NAME}/points/scroll`,
            {
                limit: 1000,
                with_payload: true,
                with_vector: false
            }
        );

        const points = response.data.result.points;
        const matchingPoint = points.find(
            point => point.payload.metadata.chunkIndex === parseInt(chunkIndex)
        );

        if (!matchingPoint) {
            console.log(`❌ Chunk ${chunkIndex} not found`);
            return null;
        }

        const result = {
            id: matchingPoint.id,
            chunkIndex: matchingPoint.payload.metadata.chunkIndex,
            source: matchingPoint.payload.metadata.source,
            text: matchingPoint.payload.text
        };

        console.log('✅ Found chunk:');
        console.log('');
        console.log(JSON.stringify(result, null, 2));
        console.log('');
        console.log('📄 Full Text:');
        console.log('─'.repeat(80));
        console.log(result.text);
        console.log('─'.repeat(80));

        return result;

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
        process.exit(1);
    }
}

// Command line usage
if (require.main === module) {
    const chunkIndex = process.argv[2];

    if (!chunkIndex) {
        console.log('Usage: node getChunkText.js <chunk_index>');
        console.log('Example: node getChunkText.js 733');
        process.exit(1);
    }

    getChunkText(chunkIndex);
}

module.exports = { getChunkText };
