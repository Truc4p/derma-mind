/**
 * Utility functions for processing images in AI responses
 */

/**
 * Convert markdown image references to full URLs
 * @param {string} text - Text containing markdown image references
 * @param {string} baseUrl - Base URL for the backend (e.g., http://localhost:5000)
 * @returns {string} Text with converted image URLs
 */
function convertImageReferencesToUrls(text, baseUrl = 'http://localhost:5000') {
    if (!text) return text;
    
    // Match markdown image syntax: ![alt text](images/figure_x_y.png)
    const imageRegex = /!\[([^\]]*)\]\(images\/([^)]+)\)/g;
    
    // Replace relative paths with full URLs
    const processedText = text.replace(imageRegex, (match, altText, imagePath) => {
        const fullUrl = `${baseUrl}/api/knowledge-images/${imagePath}`;
        return `![${altText}](${fullUrl})`;
    });
    
    return processedText;
}

/**
 * Extract image references from text
 * @param {string} text - Text containing markdown image references
 * @returns {Array} Array of image objects with alt text and filename
 */
function extractImageReferences(text) {
    if (!text) return [];
    
    const imageRegex = /!\[([^\]]*)\]\(images\/([^)]+)\)/g;
    const images = [];
    let match;
    
    while ((match = imageRegex.exec(text)) !== null) {
        images.push({
            altText: match[1],
            filename: match[2],
            fullReference: match[0]
        });
    }
    
    return images;
}

/**
 * Check if text contains figure references
 * @param {string} text - Text to check
 * @returns {boolean} True if text contains figure references
 */
function containsImageReferences(text) {
    if (!text) return false;
    return /!\[([^\]]*)\]\(images\/([^)]+)\)/g.test(text);
}

/**
 * Convert image references to HTML img tags for better frontend rendering
 * @param {string} text - Text containing markdown image references
 * @param {string} baseUrl - Base URL for the backend
 * @returns {string} Text with HTML img tags
 */
function convertImagesToHtml(text, baseUrl = 'http://localhost:5000') {
    if (!text) return text;
    
    const imageRegex = /!\[([^\]]*)\]\(images\/([^)]+)\)/g;
    
    const processedText = text.replace(imageRegex, (match, altText, imagePath) => {
        const fullUrl = `${baseUrl}/api/knowledge-images/${imagePath}`;
        return `<img src="${fullUrl}" alt="${altText}" class="knowledge-figure" style="max-width: 100%; height: auto; margin: 1rem 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />`;
    });
    
    return processedText;
}

module.exports = {
    convertImageReferencesToUrls,
    extractImageReferences,
    containsImageReferences,
    convertImagesToHtml
};
