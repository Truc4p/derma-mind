#!/bin/bash

# Script to retrieve full text from Qdrant vector database
# Usage: ./get_chunk_text.sh <chunk_index>
# Example: ./get_chunk_text.sh 733

if [ -z "$1" ]; then
    echo "Usage: $0 <chunk_index>"
    echo "Example: $0 733"
    exit 1
fi

CHUNK_INDEX=$1
COLLECTION_NAME="dermatology_knowledge"
QDRANT_URL="http://localhost:6333"

echo "🔍 Searching for chunk index: $CHUNK_INDEX in collection: $COLLECTION_NAME"
echo ""

curl -X POST "${QDRANT_URL}/collections/${COLLECTION_NAME}/points/scroll" \
  -H "Content-Type: application/json" \
  -d "{
        \"limit\": 5000,
        \"with_payload\": true,
        \"with_vector\": false
      }" | jq ".result.points[] | select(.payload.metadata.chunkIndex == ${CHUNK_INDEX}) | {
        id: .id,
        chunkIndex: .payload.metadata.chunkIndex,
        source: .payload.metadata.source,
        text: .payload.text
      }"

echo ""
echo "✅ Done!"
