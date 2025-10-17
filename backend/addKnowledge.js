/**
 * Knowledge Base Expansion Helper
 * 
 * This script helps you add more dermatology knowledge from various sources
 */

const DermatologyKnowledge = require('./models/DermatologyKnowledge');
const mongoose = require('mongoose');
require('dotenv').config();

// Helper function to add single knowledge entry
async function addKnowledge(entry) {
    try {
        const knowledge = new DermatologyKnowledge(entry);
        await knowledge.save();
        console.log(`✅ Added: ${entry.title}`);
        return knowledge;
    } catch (error) {
        console.error(`❌ Error adding ${entry.title}:`, error.message);
        return null;
    }
}

// Helper function to add multiple entries
async function addMultipleKnowledge(entries) {
    const results = {
        success: 0,
        failed: 0,
        total: entries.length
    };

    for (const entry of entries) {
        const result = await addKnowledge(entry);
        if (result) {
            results.success++;
        } else {
            results.failed++;
        }
    }

    return results;
}

// Example: Add new knowledge entries
const newKnowledgeEntries = [
    {
        category: 'skin-conditions',
        subcategory: 'rosacea',
        title: 'Understanding Rosacea',
        content: `Rosacea is a chronic inflammatory skin condition primarily affecting the central face.

Types:
1. Erythematotelangiectatic: Persistent redness, visible blood vessels
2. Papulopustular: Redness with acne-like breakouts
3. Phymatous: Thickened skin, enlarged pores (rhinophyma)
4. Ocular: Eye irritation, redness

Common Triggers:
- Sun exposure
- Hot beverages
- Spicy foods
- Alcohol
- Temperature extremes
- Stress
- Certain skincare products

Management:
- Gentle skincare (fragrance-free)
- Mineral sunscreen daily (SPF 30+)
- Avoid triggers
- Prescription treatments: Metronidazole, Azelaic acid, Ivermectin
- Oral antibiotics for moderate-severe cases
- Laser therapy for blood vessels

Key ingredients:
✅ Good: Niacinamide, azelaic acid, ceramides, centella asiatica
❌ Avoid: Alcohol, fragrance, menthol, witch hazel`,
        keywords: ['rosacea', 'redness', 'flushing', 'sensitive skin', 'broken capillaries', 'facial redness'],
        sourceReference: 'Based on: Gallo RL, et al. Standard classification and pathophysiology of rosacea. J Am Acad Dermatol. 2018',
        verified: true
    },
    {
        category: 'skin-conditions',
        subcategory: 'eczema',
        title: 'Atopic Dermatitis (Eczema) Management',
        content: `Atopic dermatitis is a chronic inflammatory condition causing dry, itchy skin.

Characteristics:
- Intense itching
- Dry, scaly patches
- Thickened skin from scratching
- Common in skin folds (elbows, knees)

Pathophysiology:
- Impaired skin barrier
- Immune system dysfunction
- Genetic predisposition
- Environmental triggers

Management Strategy:
1. **Repair barrier:**
   - Thick moisturizers with ceramides
   - Apply to damp skin (3 minutes after bathing)
   - Reapply multiple times daily

2. **Reduce inflammation:**
   - Topical corticosteroids (as prescribed)
   - Calcineurin inhibitors (Tacrolimus, Pimecrolimus)
   - Crisaborole (newer non-steroid option)

3. **Prevent flares:**
   - Identify and avoid triggers
   - Use gentle, fragrance-free products
   - Cool compress for itch
   - Keep nails short

4. **Bath routine:**
   - Lukewarm water (not hot)
   - Short showers (5-10 minutes)
   - Gentle cleanser (Cetaphil, CeraVe)
   - Pat dry, don't rub
   - Immediately moisturize

Key ingredients:
- Ceramides
- Colloidal oatmeal
- Shea butter
- Petrolatum
- Dimethicone`,
        keywords: ['eczema', 'atopic dermatitis', 'itchy skin', 'dry patches', 'dermatitis', 'inflammation'],
        sourceReference: 'Based on: Eichenfield LF, et al. Guidelines of care for atopic dermatitis. J Am Acad Dermatol. 2014',
        verified: true
    },
    {
        category: 'ingredients',
        subcategory: 'peptides',
        title: 'Peptides in Anti-Aging Skincare',
        content: `Peptides are short chains of amino acids that act as building blocks for proteins like collagen and elastin.

How They Work:
- Signal cells to produce more collagen
- Reduce appearance of wrinkles
- Improve skin firmness
- Support skin barrier

Common Types:

1. **Signal Peptides:**
   - Palmitoyl Pentapeptide-4 (Matrixyl)
   - Palmitoyl Oligopeptide
   - Stimulate collagen production

2. **Carrier Peptides:**
   - Copper peptides (GHK-Cu)
   - Deliver minerals to skin
   - Wound healing properties

3. **Neurotransmitter Peptides:**
   - Acetyl Hexapeptide-8 (Argireline)
   - "Botox-like" effect
   - Reduce expression lines

4. **Enzyme Inhibitor Peptides:**
   - Soybean peptides
   - Prevent collagen breakdown

Benefits:
- Reduce fine lines and wrinkles
- Improve skin texture
- Enhance firmness
- Support barrier function
- Generally well-tolerated

Usage:
- Apply to clean skin
- Can be used AM and PM
- Layer under moisturizer
- Compatible with most ingredients
- Stable in formulations

Concentration: Look for 3-5% in serums

Note: Results take 8-12 weeks of consistent use.`,
        keywords: ['peptides', 'matrixyl', 'argireline', 'collagen', 'anti-aging', 'wrinkles', 'firmness'],
        sourceReference: 'Gorouhi F, Maibach HI. Role of topical peptides in preventing or treating aged skin. Int J Cosmet Sci. 2009',
        verified: true
    },
    {
        category: 'treatments',
        subcategory: 'professional',
        title: 'Chemical Peels: Types and Benefits',
        content: `Chemical peels use acids to exfoliate and improve skin texture.

Depths:

1. **Superficial Peels:**
   - Acids: Glycolic (20-30%), Lactic, Salicylic
   - Targets: Epidermis only
   - Downtime: None to minimal
   - Frequency: Every 2-4 weeks
   - Results: Brighter, smoother skin

2. **Medium Peels:**
   - Acids: TCA (25-35%), Jessner's
   - Targets: Epidermis + upper dermis
   - Downtime: 7-14 days
   - Frequency: Every 6-12 months
   - Results: Significant texture improvement, hyperpigmentation reduction

3. **Deep Peels:**
   - Acids: Phenol, high-concentration TCA
   - Targets: Deep dermis
   - Downtime: 14-21 days
   - Frequency: Once (rarely repeated)
   - Results: Dramatic wrinkle reduction

Indications:
- Acne and acne scars
- Hyperpigmentation
- Fine lines and wrinkles
- Sun damage
- Uneven texture
- Dull skin

Contraindications:
- Active infections
- Recent isotretinoin use (wait 6-12 months)
- Pregnancy/breastfeeding
- Keloid tendency

Pre-treatment (2-4 weeks):
- Retinoids (prepare skin)
- Hydroquinone (for pigmentation)
- Antiviral medication (if history of cold sores)

Post-treatment Care:
- Gentle cleanser
- Heavy moisturizer
- Strict sun avoidance
- SPF 50+ daily
- No actives for 1-2 weeks

Expected Results Timeline:
- Immediate: Redness, possible swelling
- Days 2-5: Peeling/flaking
- Week 1-2: Healing complete
- Weeks 4-8: See full results`,
        keywords: ['chemical peel', 'glycolic peel', 'tca peel', 'exfoliation', 'professional treatment', 'resurfacing'],
        sourceReference: 'Brody HJ. Chemical Peeling and Resurfacing. Mosby, 1997',
        verified: true
    }
];

// Main execution
async function main() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skin-study');
        console.log('✅ Connected to MongoDB\n');

        // Add new knowledge
        console.log('📚 Adding new knowledge entries...\n');
        const results = await addMultipleKnowledge(newKnowledgeEntries);

        console.log('\n📊 Results:');
        console.log(`✅ Successfully added: ${results.success}`);
        console.log(`❌ Failed: ${results.failed}`);
        console.log(`📝 Total: ${results.total}`);

        // Show current knowledge count
        const totalKnowledge = await DermatologyKnowledge.countDocuments();
        console.log(`\n📚 Total knowledge articles in database: ${totalKnowledge}`);

        mongoose.connection.close();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Export functions for use in other scripts
module.exports = {
    addKnowledge,
    addMultipleKnowledge
};

// Run if executed directly
if (require.main === module) {
    main();
}
