const DermatologyKnowledge = require('./models/DermatologyKnowledge');
const mongoose = require('mongoose');

// Comprehensive dermatology knowledge base
const knowledgeData = [
    // SKIN CONDITIONS
    {
        category: 'skin-conditions',
        subcategory: 'acne',
        title: 'Understanding Acne Vulgaris',
        content: `Acne vulgaris is a chronic inflammatory condition affecting the pilosebaceous unit. It occurs when hair follicles become clogged with oil and dead skin cells, leading to comedones, papules, pustules, and in severe cases, nodules and cysts.

Key factors:
- Excess sebum production
- Follicular hyperkeratinization
- Propionibacterium acnes (P. acnes) colonization
- Inflammation

Treatment approaches:
1. Mild acne: Topical retinoids + benzoyl peroxide
2. Moderate acne: Topical combinations + oral antibiotics if needed
3. Severe acne: Oral isotretinoin consideration

Prevention: Gentle cleansing, non-comedogenic products, consistent treatment adherence.`,
        keywords: ['acne', 'pimples', 'breakouts', 'comedones', 'papules', 'pustules', 'cystic acne', 'blackheads', 'whiteheads'],
        sourceReference: 'Based on: Zaenglein AL, et al. Guidelines of care for acne vulgaris management. J Am Acad Dermatol. 2016',
        verified: true
    },
    {
        category: 'skin-conditions',
        subcategory: 'hyperpigmentation',
        title: 'Post-Inflammatory Hyperpigmentation (PIH)',
        content: `PIH is a common condition where dark spots develop after inflammation or injury to the skin. Common in all skin types but more pronounced in darker skin tones (Fitzpatrick types IV-VI).

Causes:
- Acne lesions
- Eczema or psoriasis
- Burns or injuries
- Cosmetic procedures
- Friction

Treatment options:
1. Topical agents: Hydroquinone (2-4%), kojic acid, azelaic acid, retinoids
2. Chemical peels: Glycolic acid, salicylic acid
3. Laser therapy: For resistant cases
4. Essential: Broad-spectrum SPF 30+ daily

Timeline: 6-12 months for improvement with consistent treatment.`,
        keywords: ['dark spots', 'hyperpigmentation', 'PIH', 'discoloration', 'melasma', 'age spots', 'sun spots'],
        sourceReference: 'Davis EC, Callender VD. Postinflammatory hyperpigmentation: a review. J Clin Aesthet Dermatol. 2010',
        verified: true
    },

    // INGREDIENTS
    {
        category: 'ingredients',
        subcategory: 'retinoids',
        title: 'Retinoids: The Gold Standard Anti-Aging Ingredient',
        content: `Retinoids are vitamin A derivatives and the most researched anti-aging ingredients in dermatology.

Types:
1. Prescription: Tretinoin (Retin-A), Tazarotene, Adapalene (Differin - now OTC)
2. Over-the-counter: Retinol, Retinaldehyde, Retinyl palmitate

Mechanisms:
- Increases cell turnover
- Stimulates collagen production
- Reduces fine lines and wrinkles
- Improves skin texture
- Unclogs pores
- Fades hyperpigmentation

Usage guidelines:
- Start with low concentration (0.025% - 0.05%)
- Apply pea-sized amount to entire face
- Use at night only
- Begin 2-3x per week, gradually increase
- Always use SPF during the day
- Expect "retinization" period: dryness, peeling, redness for 2-4 weeks

Contraindications: Pregnancy, breastfeeding`,
        keywords: ['retinol', 'retinoids', 'tretinoin', 'retin-a', 'adapalene', 'anti-aging', 'wrinkles', 'vitamin a'],
        sourceReference: 'Kligman AM, Grove GL, Hirose R, Leyden JJ. Topical tretinoin for photoaged skin. J Am Acad Dermatol. 1986',
        verified: true
    },
    {
        category: 'ingredients',
        subcategory: 'antioxidants',
        title: 'Vitamin C (L-Ascorbic Acid) in Skincare',
        content: `Vitamin C is a potent antioxidant essential for skin health and collagen synthesis.

Benefits:
- Neutralizes free radicals
- Brightens skin tone
- Reduces hyperpigmentation
- Stimulates collagen production
- Enhances sun protection when used with SPF
- Reduces inflammation

Effective forms:
- L-Ascorbic Acid: Most potent but unstable (10-20%)
- Magnesium Ascorbyl Phosphate: More stable, gentler
- Sodium Ascorbyl Phosphate: Good for acne-prone skin
- Ascorbyl Glucoside: Very stable

Formulation matters:
- pH 2.5-3.5 for L-Ascorbic Acid
- Concentration: 10-20% for efficacy
- Packaging: Air-tight, opaque bottles
- Storage: Cool, dark place

Usage: Apply to clean skin in the morning before SPF. Use within 3-6 months of opening.`,
        keywords: ['vitamin c', 'ascorbic acid', 'antioxidant', 'brightening', 'collagen', 'hyperpigmentation', 'dark spots'],
        sourceReference: 'Pullar JM, et al. The Roles of Vitamin C in Skin Health. Nutrients. 2017',
        verified: true
    },
    {
        category: 'ingredients',
        subcategory: 'hydroxy-acids',
        title: 'Alpha Hydroxy Acids (AHAs) for Exfoliation',
        content: `AHAs are water-soluble chemical exfoliants derived from fruits and milk.

Common types:
1. Glycolic Acid: Smallest molecule, most penetrative (from sugar cane)
2. Lactic Acid: Gentler, hydrating (from milk)
3. Mandelic Acid: Largest molecule, best for sensitive/darker skin
4. Citric Acid: From citrus fruits, antioxidant properties

Benefits:
- Exfoliates dead skin cells
- Improves skin texture
- Reduces fine lines
- Brightens complexion
- Increases product absorption
- Hydrates skin (especially lactic acid)

Concentrations:
- Daily use: 5-10%
- Weekly treatments: 10-15%
- Professional peels: 20-70%

Important notes:
- Increases sun sensitivity - use SPF
- Start with lower concentrations
- Don't combine with retinoids initially
- pH matters: 3-4 for effectiveness`,
        keywords: ['aha', 'glycolic acid', 'lactic acid', 'exfoliation', 'chemical exfoliant', 'peel', 'texture'],
        sourceReference: 'Tang SC, Yang JH. Dual Effects of Alpha-Hydroxy Acids on Skin. Molecules. 2018',
        verified: true
    },
    {
        category: 'ingredients',
        subcategory: 'hydroxy-acids',
        title: 'Beta Hydroxy Acids (BHAs) for Oily and Acne-Prone Skin',
        content: `BHAs are oil-soluble exfoliants that penetrate into pores, making them ideal for oily and acne-prone skin.

Primary BHA: Salicylic Acid

Benefits:
- Unclogs pores
- Reduces blackheads and whiteheads
- Decreases inflammation
- Reduces sebum production
- Antimicrobial properties
- Reduces redness

Concentrations:
- Daily use: 0.5-2%
- Spot treatment: 2%
- Professional peels: 20-30%

Best for:
- Oily skin
- Acne-prone skin
- Large pores
- Blackheads
- Seborrheic dermatitis

Usage tips:
- Can be used AM or PM
- Less sun-sensitizing than AHAs (but still use SPF)
- Safe for most skin types
- Avoid if allergic to aspirin (structurally similar)

Gentler than AHAs on the surface but works deeper in pores.`,
        keywords: ['bha', 'salicylic acid', 'acne', 'oily skin', 'blackheads', 'pores', 'exfoliation'],
        sourceReference: 'Kornhauser A, et al. Applications of hydroxy acids. Clin Cosmet Investig Dermatol. 2010',
        verified: true
    },
    {
        category: 'ingredients',
        subcategory: 'hydrators',
        title: 'Hyaluronic Acid: The Ultimate Hydrator',
        content: `Hyaluronic Acid (HA) is a naturally occurring glycosaminoglycan that can hold up to 1000x its weight in water.

Types and molecular weights:
1. High molecular weight (1000-1400 kDa): Forms protective film on surface
2. Medium molecular weight (100-300 kDa): Penetrates epidermis
3. Low molecular weight (<50 kDa): Reaches deeper layers

Benefits:
- Intense hydration
- Plumps fine lines
- Improves skin elasticity
- Enhances skin barrier
- Suitable for all skin types
- Non-comedogenic

Application tips:
- Apply to damp skin for best results
- Layer under moisturizer
- Can be used AM and PM
- Safe to use with all other ingredients

Forms:
- Serums: Highest concentration
- Toners: Lightweight hydration
- Moisturizers: Combined with occlusives

Note: In very dry climates, use with an occlusive moisturizer to prevent transepidermal water loss.`,
        keywords: ['hyaluronic acid', 'hydration', 'moisture', 'plump', 'hydrator', 'serum', 'dry skin'],
        sourceReference: 'Papakonstantinou E, et al. Hyaluronic acid: A key molecule in skin aging. Dermatoendocrinol. 2012',
        verified: true
    },
    {
        category: 'ingredients',
        subcategory: 'barrier-support',
        title: 'Niacinamide (Vitamin B3): Multi-Functional Powerhouse',
        content: `Niacinamide is a water-soluble form of vitamin B3 with multiple skin benefits and excellent tolerability.

Evidence-based benefits:
- Reduces sebum production (4-5%)
- Minimizes pore appearance
- Improves skin barrier function
- Reduces inflammation
- Fades hyperpigmentation
- Reduces fine lines and wrinkles
- Improves redness and blotchiness
- Antioxidant properties

Effective concentration: 2-10%
(Most studies show 5% is optimal)

Advantages:
- Suitable for all skin types
- Well-tolerated, minimal irritation
- Can be used with most ingredients
- Stable in formulations
- Can be used AM and PM

Myth busting: Can be used with vitamin C despite old claims of incompatibility (modern formulations are stable).

Ideal for: Oily skin, acne-prone, sensitive skin, anti-aging, hyperpigmentation.`,
        keywords: ['niacinamide', 'vitamin b3', 'pores', 'oil control', 'brightening', 'redness', 'barrier'],
        sourceReference: 'Gehring W. Nicotinic acid/niacinamide and the skin. J Cosmet Dermatol. 2004',
        verified: true
    },

    // TREATMENTS & ROUTINES
    {
        category: 'routines',
        subcategory: 'oily-skin',
        title: 'Complete Routine for Oily and Acne-Prone Skin',
        content: `Comprehensive approach to managing oily, acne-prone skin:

MORNING ROUTINE:
1. Gentle foaming cleanser (salicylic acid or benzoyl peroxide)
2. Toner with niacinamide or witch hazel
3. Lightweight serum (niacinamide, vitamin C)
4. Oil-free moisturizer with hyaluronic acid
5. SPF 30+ oil-free or gel-based sunscreen

EVENING ROUTINE:
1. Oil-based cleanser (if wearing makeup/SPF)
2. Foaming cleanser (double cleanse)
3. Chemical exfoliant (BHA 2% or AHA) - alternate nights initially
4. Treatment serum (retinoid, niacinamide)
5. Lightweight moisturizer
6. Spot treatment if needed (benzoyl peroxide)

WEEKLY:
- Clay mask 1-2x per week
- Gentle exfoliation if not using chemical exfoliants daily

KEY PRINCIPLES:
- Don't over-cleanse (strips skin, increases oil)
- Hydration is still essential
- Non-comedogenic products only
- Consistency is key
- Avoid touching face

Avoid: Heavy oils, thick creams, coconut oil, physical scrubs`,
        keywords: ['oily skin', 'acne', 'routine', 'skincare routine', 'breakouts', 'sebum'],
        sourceReference: 'Based on AAD guidelines and dermatological best practices',
        verified: true
    },
    {
        category: 'routines',
        subcategory: 'dry-skin',
        title: 'Hydrating Routine for Dry and Dehydrated Skin',
        content: `Comprehensive routine to restore and maintain skin hydration:

MORNING ROUTINE:
1. Cream or oil-based cleanser (or just water if very dry)
2. Hydrating toner/essence (hyaluronic acid, glycerin)
3. Hydrating serum (hyaluronic acid, ceramides)
4. Rich moisturizer with ceramides and fatty acids
5. Facial oil (optional, for extra dry skin)
6. SPF 30+ (mineral or moisturizing chemical)

EVENING ROUTINE:
1. Oil-based cleanser (to remove sunscreen/makeup)
2. Gentle cream cleanser
3. Hydrating toner/essence
4. Treatment (retinol 2-3x week when skin is adjusted)
5. Hydrating serum
6. Rich night cream or sleeping mask
7. Facial oil (squalane, rosehip, marula)

WEEKLY:
- Hydrating sheet masks 2-3x
- Gentle enzyme exfoliation 1x (avoid harsh scrubs)
- Overnight sleeping masks

KEY INGREDIENTS:
- Hyaluronic acid
- Ceramides
- Glycerin
- Squalane
- Niacinamide
- Peptides

Avoid: Alcohol-based products, harsh sulfates, over-exfoliation, hot water`,
        keywords: ['dry skin', 'dehydrated', 'hydration', 'routine', 'moisturize', 'ceramides'],
        sourceReference: 'Based on dermatological principles of barrier repair and hydration',
        verified: true
    },
    {
        category: 'routines',
        subcategory: 'sensitive-skin',
        title: 'Gentle Routine for Sensitive and Reactive Skin',
        content: `Minimalist approach for sensitive, easily irritated skin:

MORNING ROUTINE:
1. Gentle, fragrance-free cleanser or micellar water
2. Soothing toner (centella asiatica, allantoin)
3. Calming serum (niacinamide 3-5%, azelaic acid)
4. Fragrance-free moisturizer with ceramides
5. Mineral SPF 30+ (zinc oxide/titanium dioxide)

EVENING ROUTINE:
1. Micellar water or gentle cleansing oil
2. Gentle cream cleanser
3. Soothing toner
4. Treatment (introduce very slowly): low % retinol or azelaic acid
5. Rich, barrier-repair moisturizer
6. Occlusive layer if needed (cicaplast, aquaphor on dry areas)

INTRODUCTION PROTOCOL:
- Add only ONE new product every 2-3 weeks
- Patch test everything
- Start treatments 1x per week for 2 weeks, then 2x per week
- Stop immediately if irritation occurs

CALMING INGREDIENTS:
- Centella Asiatica (Cica)
- Colloidal oatmeal
- Ceramides
- Panthenol (Vitamin B5)
- Allantoin
- Azelaic acid (gentle, anti-inflammatory)

AVOID:
- Fragrance and essential oils
- Denatured alcohol
- High % acids
- Harsh exfoliants
- Hot water
- Over-layering products`,
        keywords: ['sensitive skin', 'reactive skin', 'irritation', 'gentle', 'soothing', 'calming'],
        sourceReference: 'Based on sensitive skin management protocols and barrier science',
        verified: true
    },
    {
        category: 'routines',
        subcategory: 'anti-aging',
        title: 'Evidence-Based Anti-Aging Skincare Routine',
        content: `Comprehensive anti-aging routine based on dermatological research:

MORNING ROUTINE:
1. Gentle cleanser
2. Antioxidant serum (Vitamin C 10-20%)
3. Eye cream with peptides and caffeine
4. Moisturizer with peptides and ceramides
5. Broad-spectrum SPF 50+ (MOST IMPORTANT)

EVENING ROUTINE:
1. Double cleanse (oil-based, then water-based)
2. Toner (hydrating or gentle acid)
3. Retinoid (tretinoin 0.025-0.1% or retinol 0.5-1%)
4. Eye cream with retinol
5. Rich moisturizer or night cream
6. Facial oil or occlusive if dry

ALTERNATING NIGHTS:
Night 1: Retinoid + moisturizer
Night 2: AHA/BHA + hydrating serum + moisturizer

THE CORE FOUR (evidence-based):
1. Sunscreen (prevents 80% of visible aging)
2. Retinoids (strongest evidence for anti-aging)
3. Vitamin C (antioxidant, collagen production)
4. Moisturizer with peptides (supports barrier)

ADVANCED OPTIONS:
- Growth factors
- Peptides (Matrixyl, Argireline)
- Niacinamide
- Bakuchiol (retinol alternative)

PROFESSIONAL TREATMENTS:
- Chemical peels (quarterly)
- Microneedling (every 4-6 weeks)
- Laser resurfacing (annual)
- Botox/fillers (as desired)

LIFESTYLE:
- Sleep 7-9 hours
- Hydrate well
- Antioxidant-rich diet
- No smoking
- Limit alcohol`,
        keywords: ['anti-aging', 'wrinkles', 'fine lines', 'aging', 'retinol', 'mature skin', 'prevention'],
        sourceReference: 'Based on gold-standard anti-aging research and dermatological consensus',
        verified: true
    },

    // COSMETICS & PROCEDURES
    {
        category: 'cosmetics',
        subcategory: 'sunscreen',
        title: 'Comprehensive Guide to Sunscreen',
        content: `Sunscreen is the single most important anti-aging and skin cancer prevention product.

TYPES:
1. Physical/Mineral: Zinc oxide, Titanium dioxide
   - Sits on skin surface
   - Reflects UV rays
   - Better for sensitive skin
   - Can leave white cast

2. Chemical/Organic: Avobenzone, Octinoxate, Oxybenzone, etc.
   - Absorbs into skin
   - Absorbs UV rays and converts to heat
   - More elegant formulations
   - Potential for irritation

CHOOSING SUNSCREEN:
- SPF: Minimum 30, ideally 50+
- Broad spectrum (UVA + UVB protection)
- Water resistant if swimming/sweating
- PA++++ rating (Asian sunscreens)

APPLICATION:
- Amount: 1/4 teaspoon for face, 1 oz (shot glass) for body
- Apply 15-30 minutes before sun exposure
- Reapply every 2 hours
- Reapply after swimming or sweating

MYTHS DEBUNKED:
- Dark skin needs sunscreen (yes!)
- Cloudy days need sunscreen (yes!)
- Winter needs sunscreen (yes!)
- Makeup with SPF is enough (no! Not enough quantity)

BEST PRACTICES:
- Apply as last step of AM routine
- Use daily, even indoors (UVA passes through windows)
- Don't forget: neck, chest, hands, ears

RECOMMENDED FILTERS:
- Zinc oxide (safe, broad spectrum)
- Titanium dioxide (safe, broad spectrum)
- Avobenzone (UVA protection)
- Tinosorb S/M (excellent, stable, available in Europe/Asia)`,
        keywords: ['sunscreen', 'spf', 'sun protection', 'uva', 'uvb', 'photoaging', 'skin cancer prevention'],
        sourceReference: 'AAD sunscreen guidelines and photoprotection research',
        verified: true
    },

    // GENERAL ADVICE
    {
        category: 'general-advice',
        subcategory: 'skin-basics',
        title: 'Understanding the Skin Barrier',
        content: `The skin barrier (stratum corneum) is your skin's first line of defense.

STRUCTURE:
"Brick and mortar" model:
- Bricks: Corneocytes (dead skin cells)
- Mortar: Lipids (ceramides, cholesterol, fatty acids)

FUNCTIONS:
- Prevents water loss (TEWL - transepidermal water loss)
- Protects from external irritants
- Maintains pH balance
- Houses microbiome

SIGNS OF DAMAGED BARRIER:
- Dryness and flaking
- Redness and sensitivity
- Increased breakouts
- Stinging/burning with products
- Rough texture

CAUSES OF DAMAGE:
- Over-exfoliation
- Harsh cleansers (high pH, sulfates)
- Environmental factors (cold, wind, low humidity)
- Irritating ingredients
- Not moisturizing
- Hot water

REPAIR STRATEGY:
1. Stop all actives temporarily
2. Gentle, pH-balanced cleanser
3. Hydrating toner
4. Barrier-repair serum (ceramides, cholesterol, fatty acids in 1:1:1 ratio)
5. Rich moisturizer
6. Occlusive layer at night (vaseline, cicaplast)
7. SPF during day

RECOVERY TIME: 2-4 weeks with proper care

PREVENTION:
- Don't over-exfoliate (2-3x per week max)
- Use lukewarm water
- Pat dry, don't rub
- Moisturize while skin is damp
- Protect from elements`,
        keywords: ['skin barrier', 'damaged barrier', 'dehydrated', 'sensitive', 'irritation', 'ceramides'],
        sourceReference: 'Proksch E, et al. The skin: an indispensable barrier. Exp Dermatol. 2008',
        verified: true
    },
    {
        category: 'general-advice',
        subcategory: 'product-layering',
        title: 'Proper Order for Applying Skincare Products',
        content: `The correct order maximizes efficacy and minimizes irritation.

BASIC RULE: Thinnest to thickest consistency

CORRECT ORDER:

MORNING:
1. Cleanser
2. Toner/Essence
3. Serums (thinnest to thickest):
   - Vitamin C serum
   - Hyaluronic acid
   - Niacinamide
4. Eye cream
5. Moisturizer
6. Sunscreen (always last!)

EVENING:
1. Oil cleanser (first cleanse)
2. Water-based cleanser (second cleanse)
3. Toner/Essence
4. Treatment (acids, retinoids)
5. Serums
6. Eye cream
7. Moisturizer
8. Face oil (optional)
9. Occlusive (if needed)

WAIT TIMES:
- Between pH-dependent products (acids, vitamin C): 1-2 minutes
- After retinoids: 5-10 minutes before moisturizer (if tolerating)
- Sunscreen: 15 minutes before sun exposure

SPECIAL CONSIDERATIONS:
- Water-based before oil-based
- pH-dependent products on clean, dry skin
- Treatments on bare skin for maximum penetration
- Sunscreen always last in AM
- Eye cream before or after moisturizer (both work)

NEVER MIX:
- Retinol + Vitamin C (use at different times)
- Retinol + AHA/BHA (alternate nights when starting)
- Vitamin C + Niacinamide (myth, but some formulas may pill)
- Multiple strong actives (over-exfoliation risk)

LESS IS MORE:
- 3-5 products per routine is ideal
- Not every product is necessary
- Quality over quantity`,
        keywords: ['layering', 'order', 'routine', 'how to apply', 'sequence', 'skincare order'],
        sourceReference: 'Based on dermatological formulation science and ingredient compatibility',
        verified: true
    }
];

async function seedKnowledge() {
    try {
        // Load environment variables
        require('dotenv').config();
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skin-study');
        console.log('Connected to MongoDB');

        // Clear existing knowledge
        await DermatologyKnowledge.deleteMany({});
        console.log('Cleared existing knowledge base');

        // Insert new knowledge
        await DermatologyKnowledge.insertMany(knowledgeData);
        console.log(`Successfully seeded ${knowledgeData.length} knowledge articles`);

        // Create text indexes for searching
        await DermatologyKnowledge.createIndexes();
        console.log('Created search indexes');

        mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error seeding knowledge base:', error);
        process.exit(1);
    }
}

seedKnowledge();
