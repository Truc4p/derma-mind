/**
 * Test script to verify image serving and processing
 */

const { convertImagesToHtml, extractImageReferences, containsImageReferences } = require('../utils/imageProcessor');

// Test text with image references
const testText = `
# Acne Treatment

Acne is a common skin condition that affects many people.

![Figure 15-1](images/figure_15_1.png)

Here are some treatment options:

1. Topical treatments
2. Oral medications
3. Light therapy

![Figure 15-2](images/figure_15_2.png)

For more information, consult a dermatologist.
`;

console.log('🧪 Testing Image Processing Utilities\n');
console.log('='.repeat(50));

// Test 1: Check if text contains images
console.log('\n✅ Test 1: Contains Image References');
console.log('Result:', containsImageReferences(testText));

// Test 2: Extract image references
console.log('\n✅ Test 2: Extract Image References');
const images = extractImageReferences(testText);
console.log('Found images:', JSON.stringify(images, null, 2));

// Test 3: Convert to HTML
console.log('\n✅ Test 3: Convert to HTML');
const htmlText = convertImagesToHtml(testText, 'http://localhost:3004');
console.log('Converted text:\n', htmlText);

console.log('\n' + '='.repeat(50));
console.log('✅ All tests completed!');
console.log('\nTo test image serving, start the backend server and visit:');
console.log('http://localhost:3004/api/knowledge-images/figure_15_1.png');
