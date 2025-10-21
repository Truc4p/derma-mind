const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('../../knowledge-sources/pdfs/extracted-knowledge.json', 'utf8'));

console.log('Checking all 55 entries for validation issues...\n');

const requiredFields = ['category', 'subcategory', 'title', 'content', 'sourceReference'];
const validCategories = ['skin-conditions', 'ingredients', 'treatments', 'routines', 'cosmetics', 'procedures', 'general-advice'];

let issues = 0;

data.forEach((entry, index) => {
  const problems = [];
  
  // Check required fields
  requiredFields.forEach(field => {
    if (!entry[field] || (typeof entry[field] === 'string' && entry[field].trim() === '')) {
      problems.push(`Missing or empty ${field}`);
    }
  });
  
  // Check category validity
  if (entry.category && !validCategories.includes(entry.category)) {
    problems.push(`Invalid category: ${entry.category}`);
  }
  
  if (problems.length > 0) {
    issues++;
    console.log(`Entry ${index + 1}: ${entry.title || 'NO TITLE'}`);
    problems.forEach(p => console.log(`  ❌ ${p}`));
    console.log('');
  }
});

console.log(`\nTotal entries with issues: ${issues}/55`);
console.log(`Valid entries: ${55 - issues}/55`);
