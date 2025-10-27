/**
 * Test script to verify image serving and processing
 */

const { convertImagesToHtml, extractImageReferences, containsImageReferences } = require('../utils/imageProcessor');

// Test text with image references
const testText = `
# CO2 laser resurfacing and full face lift. She had an important engagement in only a few weeks and was very concerned about having a natural appearance for this event. Again, this patient was given the same hydrating cream, lipid serum, and gentle cleanser and was instructed in the use of camoufl age makeup to cover the redness. F, The patient had tremendous improvement in only five days. Within a short period of time, she was able to discontinue the heavier camoufl age makeup and return to the use of a lighter-weight liquid makeup.

E F

Courtesy Mark Lees Skin Care, Inc.



![Figure 22-8](images/figure_22_8.png)
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
console.log('http://localhost:3004/api/knowledge-images/figure_22_8.png');
