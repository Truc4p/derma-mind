const mongoose = require('mongoose');

const dermatologyKnowledgeSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: [
            'skin-conditions',
            'ingredients',
            'treatments',
            'routines',
            'cosmetics',
            'procedures',
            'general-advice'
        ]
    },
    subcategory: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    keywords: [{
        type: String
    }],
    sourceReference: {
        type: String,
        required: true
    },
    // Optional: More detailed source tracking
    chapterNumber: {
        type: String,
        required: false
    },
    chapterTitle: {
        type: String,
        required: false
    },
    pageReference: {
        type: String,
        required: false
    },
    verified: {
        type: Boolean,
        default: false
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient searching
dermatologyKnowledgeSchema.index({ keywords: 1 });
dermatologyKnowledgeSchema.index({ category: 1, subcategory: 1 });
dermatologyKnowledgeSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('DermatologyKnowledge', dermatologyKnowledgeSchema);
