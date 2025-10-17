/**
 * DermNet NZ Knowledge Scraper
 * 
 * IMPORTANT: This is a template for educational purposes.
 * Always check robots.txt and terms of service before scraping.
 * DermNet NZ: https://dermnetnz.org/robots.txt
 * 
 * Alternative: Contact DermNet NZ for API access or data partnership
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { addKnowledge } = require('./addKnowledge');
require('dotenv').config();

// Rate limiting to be respectful
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Scrape a single DermNet NZ article
 */
async function scrapeDermNetArticle(url) {
    try {
        // Respect rate limits - wait 2 seconds between requests
        await delay(2000);

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Educational Scraper (Contact: your@email.com)'
            }
        });

        const $ = cheerio.load(response.data);

        // Extract content (adjust selectors based on actual page structure)
        const title = $('h1.page-title').text().trim();
        const content = $('article .content').text().trim();
        
        // Extract keywords from meta tags or content
        const keywords = $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim()) || [];

        return {
            title,
            content,
            keywords,
            sourceReference: `DermNet NZ: ${url}`,
            sourceUrl: url
        };
    } catch (error) {
        console.error(`Error scraping ${url}:`, error.message);
        return null;
    }
}

/**
 * Map scraped content to knowledge base format
 */
function mapToKnowledgeFormat(scrapedData, category, subcategory) {
    return {
        category,
        subcategory,
        title: scrapedData.title,
        content: scrapedData.content,
        keywords: scrapedData.keywords,
        sourceReference: scrapedData.sourceReference,
        verified: false // Always false for scraped content - needs manual review
    };
}

/**
 * Example: Scrape specific condition pages
 */
async function scrapeConditions() {
    // Example URLs (check robots.txt first!)
    const conditionUrls = [
        'https://dermnetnz.org/topics/acne',
        'https://dermnetnz.org/topics/rosacea',
        'https://dermnetnz.org/topics/eczema',
        // Add more URLs
    ];

    const results = [];

    for (const url of conditionUrls) {
        console.log(`Scraping: ${url}`);
        const data = await scrapeDermNetArticle(url);
        
        if (data) {
            const knowledge = mapToKnowledgeFormat(data, 'skin-conditions', 'general');
            results.push(knowledge);
        }
    }

    return results;
}

/**
 * Better Alternative: Manual Content Addition
 * 
 * Instead of scraping, manually curate high-quality content from:
 * 1. Read article on DermNet NZ
 * 2. Summarize key points
 * 3. Add proper attribution
 * 4. Mark as verified after review
 */
const manuallyCreatedContent = [
    {
        category: 'skin-conditions',
        subcategory: 'pigmentation',
        title: 'Melasma: Causes and Treatment',
        content: `Melasma is a common pigmentation disorder causing brown to gray-brown patches on the face.

Causes:
- Hormonal factors (pregnancy, birth control)
- Sun exposure
- Genetics
- Heat exposure

Affected areas:
- Cheeks
- Forehead
- Bridge of nose
- Upper lip
- Chin

Types:
1. Epidermal: Light brown, responds well to treatment
2. Dermal: Bluish-gray, harder to treat
3. Mixed: Most common

Treatment approach:
1. Sun protection (essential!)
   - Broad spectrum SPF 50+
   - Reapply every 2 hours
   - Physical barriers (hat, sunglasses)

2. Topical treatments:
   - Hydroquinone 2-4%
   - Triple combination cream
   - Azelaic acid 15-20%
   - Kojic acid
   - Vitamin C
   - Retinoids

3. Professional treatments:
   - Chemical peels (glycolic, salicylic)
   - Laser therapy (cautiously - can worsen)
   - Microneedling with tranexamic acid

4. Oral treatments:
   - Tranexamic acid (in some countries)
   - For resistant cases

Important notes:
- Treatment takes 3-6 months minimum
- Maintenance required indefinitely
- Sun protection is critical
- May recur with triggers`,
        keywords: ['melasma', 'hyperpigmentation', 'dark patches', 'pregnancy mask', 'chloasma', 'brown spots'],
        sourceReference: 'Based on DermNet NZ melasma information and dermatological guidelines',
        verified: true
    }
];

/**
 * Main function
 */
async function main() {
    console.log('🚨 IMPORTANT NOTICE:');
    console.log('Before scraping any website:');
    console.log('1. Check robots.txt');
    console.log('2. Review terms of service');
    console.log('3. Consider contacting for API access');
    console.log('4. Respect rate limits');
    console.log('5. Provide proper attribution\n');

    console.log('💡 RECOMMENDED APPROACH:');
    console.log('Manually curate content from sources with proper attribution.');
    console.log('This ensures quality and legal compliance.\n');

    // Example: Add manually created content
    console.log('📚 Adding manually created content...');
    
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI);
    
    for (const content of manuallyCreatedContent) {
        await addKnowledge(content);
    }

    await mongoose.connection.close();
    console.log('✅ Done!');
}

// Uncomment to run
// main();

module.exports = {
    scrapeDermNetArticle,
    mapToKnowledgeFormat,
    manuallyCreatedContent
};
