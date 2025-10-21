require('dotenv').config()
const mongoose = require('mongoose')
const Ingredient = require('../../models/Ingredient')

// Sample ingredients data
const ingredientsData = [
  {
    name: "Retinol",
    alternativeNames: ["Vitamin A", "Retinyl Palmitate"],
    category: "anti-aging",
    description: "A powerful anti-aging ingredient that stimulates cell turnover and collagen production. Helps reduce fine lines, wrinkles, and improves skin texture.",
    benefits: [
      { skinType: "all", benefit: "Reduces fine lines and wrinkles", effectivenessRating: 5 },
      { skinType: "oily", benefit: "Improves acne and texture", effectivenessRating: 4 },
      { skinType: "normal", benefit: "Prevents signs of aging", effectivenessRating: 5 }
    ],
    concerns: [
      { concern: "aging", effectiveness: "very_high" },
      { concern: "acne", effectiveness: "high" },
      { concern: "uneven_tone", effectiveness: "high" }
    ],
    safetyInfo: {
      pregnancySafe: false,
      photosensitizing: true,
      comedogenicRating: 1,
      phLevel: { min: 5.5, max: 6.5 },
      concentration: { min: 0.25, max: 1.0 },
      warnings: ["Start with low concentration", "Use sunscreen", "Avoid during pregnancy"]
    },
    usage: {
      timeOfDay: "evening",
      frequency: {
        beginner: "2-3 times per week",
        experienced: "Every other night"
      },
      application: "Apply to clean, dry skin",
      waitTime: "20-30 minutes before moisturizer"
    },
    researchLevel: "gold_standard",
    rating: { average: 4.5, count: 1250 },
    tags: ["vitamin-a", "anti-aging", "prescription-strength"]
  },
  {
    name: "Hyaluronic Acid",
    alternativeNames: ["Sodium Hyaluronate", "HA"],
    category: "moisturizer",
    description: "A powerful humectant that can hold up to 1000 times its weight in water. Provides intense hydration and plumps the skin.",
    benefits: [
      { skinType: "all", benefit: "Intense hydration", effectivenessRating: 5 },
      { skinType: "dry", benefit: "Restores moisture barrier", effectivenessRating: 5 },
      { skinType: "sensitive", benefit: "Gentle and non-irritating", effectivenessRating: 5 }
    ],
    concerns: [
      { concern: "dryness", effectiveness: "very_high" },
      { concern: "aging", effectiveness: "moderate" }
    ],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: false,
      comedogenicRating: 0,
      phLevel: { min: 6.0, max: 7.0 },
      concentration: { min: 0.1, max: 2.0 },
      warnings: []
    },
    usage: {
      timeOfDay: "both",
      frequency: {
        beginner: "Twice daily",
        experienced: "Twice daily"
      },
      application: "Apply to damp skin",
      waitTime: "No wait time needed"
    },
    researchLevel: "extensive",
    rating: { average: 4.7, count: 890 },
    tags: ["hydrating", "plumping", "all-skin-types"]
  },
  {
    name: "Niacinamide",
    alternativeNames: ["Vitamin B3", "Nicotinamide"],
    category: "active",
    description: "A versatile ingredient that regulates oil production, minimizes pores, and improves skin barrier function.",
    benefits: [
      { skinType: "oily", benefit: "Controls oil production", effectivenessRating: 5 },
      { skinType: "combination", benefit: "Balances skin", effectivenessRating: 4 },
      { skinType: "sensitive", benefit: "Strengthens barrier", effectivenessRating: 4 }
    ],
    concerns: [
      { concern: "large_pores", effectiveness: "high" },
      { concern: "acne", effectiveness: "high" },
      { concern: "uneven_tone", effectiveness: "moderate" }
    ],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: false,
      comedogenicRating: 0,
      phLevel: { min: 5.0, max: 7.0 },
      concentration: { min: 2.0, max: 10.0 },
      warnings: ["May cause flushing at high concentrations"]
    },
    usage: {
      timeOfDay: "both",
      frequency: {
        beginner: "Once daily",
        experienced: "Twice daily"
      },
      application: "Apply after cleansing",
      waitTime: "5-10 minutes"
    },
    researchLevel: "extensive",
    rating: { average: 4.4, count: 720 },
    tags: ["oil-control", "pore-minimizing", "barrier-repair"]
  },
  {
    name: "Vitamin C",
    alternativeNames: ["L-Ascorbic Acid", "Magnesium Ascorbyl Phosphate", "Sodium Ascorbyl Phosphate"],
    category: "antioxidant",
    description: "A powerful antioxidant that brightens skin, stimulates collagen production, and protects against environmental damage.",
    benefits: [
      { skinType: "all", benefit: "Brightens and evens skin tone", effectivenessRating: 5 },
      { skinType: "normal", benefit: "Prevents prenormal aging", effectivenessRating: 4 },
      { skinType: "dry", benefit: "Stimulates collagen production", effectivenessRating: 4 }
    ],
    concerns: [
      { concern: "dark_spots", effectiveness: "very_high" },
      { concern: "aging", effectiveness: "high" },
      { concern: "uneven_tone", effectiveness: "very_high" }
    ],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: false,
      comedogenicRating: 0,
      phLevel: { min: 3.0, max: 4.0 },
      concentration: { min: 5.0, max: 20.0 },
      warnings: ["Can be irritating", "Use sunscreen", "Store in cool, dark place"]
    },
    usage: {
      timeOfDay: "morning",
      frequency: {
        beginner: "Every other day",
        experienced: "Daily"
      },
      application: "Apply on clean skin before moisturizer",
      waitTime: "10-15 minutes"
    },
    researchLevel: "gold_standard",
    rating: { average: 4.3, count: 650 },
    tags: ["brightening", "antioxidant", "collagen-boosting"]
  },
  {
    name: "Salicylic Acid",
    alternativeNames: ["BHA", "Beta Hydroxy Acid"],
    category: "exfoliant",
    description: "A beta hydroxy acid that penetrates deep into pores to remove dead skin cells and excess oil. Excellent for oily skin.",
    benefits: [
      { skinType: "oily", benefit: "Unclogs pores and reduces blackheads", effectivenessRating: 5 },
      { skinType: "combination", benefit: "Balances oily T-zone", effectivenessRating: 4 },
      { skinType: "normal", benefit: "Reduces acne breakouts", effectivenessRating: 5 }
    ],
    concerns: [
      { concern: "acne", effectiveness: "very_high" },
      { concern: "large_pores", effectiveness: "high" },
      { concern: "uneven_tone", effectiveness: "moderate" }
    ],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: true,
      comedogenicRating: 0,
      phLevel: { min: 3.0, max: 4.0 },
      concentration: { min: 0.5, max: 2.0 },
      warnings: ["Start slowly", "Use sunscreen", "May cause dryness"]
    },
    usage: {
      timeOfDay: "evening",
      frequency: {
        beginner: "2-3 times per week",
        experienced: "Daily"
      },
      application: "Apply to clean, dry skin",
      waitTime: "15-20 minutes"
    },
    researchLevel: "extensive",
    rating: { average: 4.2, count: 580 },
    tags: ["exfoliating", "pore-clearing", "acne-fighting"]
  },
  {
    name: "Glycolic Acid",
    alternativeNames: ["AHA", "Alpha Hydroxy Acid"],
    category: "exfoliant",
    description: "The smallest alpha hydroxy acid that penetrates skin easily to exfoliate dead skin cells and improve texture.",
    benefits: [
      { skinType: "normal", benefit: "Improves skin texture and radiance", effectivenessRating: 5 },
      { skinType: "dry", benefit: "Removes dead skin buildup", effectivenessRating: 4 },
      { skinType: "combination", benefit: "Reduces signs of aging", effectivenessRating: 4 }
    ],
    concerns: [
      { concern: "uneven_tone", effectiveness: "high" },
      { concern: "aging", effectiveness: "high" },
      { concern: "dark_spots", effectiveness: "moderate" }
    ],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: true,
      comedogenicRating: 0,
      phLevel: { min: 3.0, max: 4.0 },
      concentration: { min: 5.0, max: 10.0 },
      warnings: ["Increases sun sensitivity", "Start with low concentration", "Use sunscreen"]
    },
    usage: {
      timeOfDay: "evening",
      frequency: {
        beginner: "Once or twice per week",
        experienced: "Every other night"
      },
      application: "Apply to clean skin",
      waitTime: "20-30 minutes"
    },
    researchLevel: "extensive",
    rating: { average: 4.1, count: 420 },
    tags: ["exfoliating", "brightening", "texture-improving"]
  },
  {
    name: "Ceramides",
    alternativeNames: ["Ceramide NP", "Ceramide AP", "Ceramide EOP"],
    category: "moisturizer",
    description: "Essential lipids that help restore and maintain the skin's natural barrier, preventing moisture loss.",
    benefits: [
      { skinType: "dry", benefit: "Restores moisture barrier", effectivenessRating: 5 },
      { skinType: "sensitive", benefit: "Strengthens skin barrier", effectivenessRating: 5 },
      { skinType: "all", benefit: "Prevents trans-epidermal water loss", effectivenessRating: 4 }
    ],
    concerns: [
      { concern: "dryness", effectiveness: "very_high" },
      { concern: "sensitivity", effectiveness: "high" }
    ],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: false,
      comedogenicRating: 1,
      phLevel: { min: 5.5, max: 7.0 },
      concentration: { min: 0.1, max: 5.0 },
      warnings: []
    },
    usage: {
      timeOfDay: "both",
      frequency: {
        beginner: "Twice daily",
        experienced: "Twice daily"
      },
      application: "Apply to clean or slightly damp skin",
      waitTime: "No wait time needed"
    },
    researchLevel: "extensive",
    rating: { average: 4.6, count: 380 },
    tags: ["barrier-repair", "moisturizing", "gentle"]
  },
  {
    name: "Peptides",
    alternativeNames: ["Palmitoyl Pentapeptide-4", "Acetyl Hexapeptide-8", "Copper Peptides"],
    category: "anti-aging",
    description: "Small proteins that signal skin cells to produce more collagen, helping to reduce signs of aging.",
    benefits: [
      { skinType: "all", benefit: "Stimulates collagen production", effectivenessRating: 4 },
      { skinType: "all", benefit: "Improves skin firmness", effectivenessRating: 4 },
      { skinType: "normal", benefit: "Prevents prenormal aging", effectivenessRating: 3 }
    ],
    concerns: [
      { concern: "aging", effectiveness: "high" }
    ],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: false,
      comedogenicRating: 1,
      phLevel: { min: 5.0, max: 7.0 },
      concentration: { min: 0.01, max: 10.0 },
      warnings: []
    },
    usage: {
      timeOfDay: "both",
      frequency: {
        beginner: "Once daily",
        experienced: "Twice daily"
      },
      application: "Apply after cleansing, before moisturizer",
      waitTime: "5-10 minutes"
    },
    researchLevel: "moderate",
    rating: { average: 4.0, count: 290 },
    tags: ["anti-aging", "collagen-boosting", "firming"]
  },
  {
    name: "Zinc Oxide",
    alternativeNames: ["ZnO"],
    category: "sunscreen",
    description: "A physical sunscreen ingredient that provides broad-spectrum protection against UVA and UVB rays.",
    benefits: [
      { skinType: "sensitive", benefit: "Gentle sun protection", effectivenessRating: 5 },
      { skinType: "all", benefit: "Broad-spectrum UV protection", effectivenessRating: 5 },
      { skinType: "oily", benefit: "Non-comedogenic protection", effectivenessRating: 4 }
    ],
    concerns: [
      { concern: "sensitivity", effectiveness: "high" }
    ],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: false,
      comedogenicRating: 0,
      phLevel: { min: 6.0, max: 8.0 },
      concentration: { min: 10.0, max: 25.0 },
      warnings: ["May leave white cast"]
    },
    usage: {
      timeOfDay: "morning",
      frequency: {
        beginner: "Daily",
        experienced: "Daily"
      },
      application: "Apply as last step in morning routine",
      waitTime: "Allow to set before makeup"
    },
    researchLevel: "gold_standard",
    rating: { average: 4.3, count: 510 },
    tags: ["physical-sunscreen", "broad-spectrum", "gentle"]
  },
  {
    name: "Azelaic Acid",
    alternativeNames: ["AzA"],
    category: "active",
    description: "A gentle acid that helps with acne, rosacea, and hyperpigmentation while being suitable for sensitive skin.",
    benefits: [
      { skinType: "sensitive", benefit: "Gentle exfoliation", effectivenessRating: 4 },
      { skinType: "oily", benefit: "Reduces acne and inflammation", effectivenessRating: 4 },
      { skinType: "combination", benefit: "Evens skin tone", effectivenessRating: 4 }
    ],
    concerns: [
      { concern: "acne", effectiveness: "high" },
      { concern: "dark_spots", effectiveness: "moderate" },
      { concern: "sensitivity", effectiveness: "high" }
    ],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: false,
      comedogenicRating: 0,
      phLevel: { min: 4.0, max: 5.0 },
      concentration: { min: 10.0, max: 20.0 },
      warnings: ["May cause mild tingling initially"]
    },
    usage: {
      timeOfDay: "both",
      frequency: {
        beginner: "Once daily",
        experienced: "Twice daily"
      },
      application: "Apply to clean skin",
      waitTime: "10-15 minutes"
    },
    researchLevel: "extensive",
    rating: { average: 4.2, count: 340 },
    tags: ["gentle-exfoliant", "anti-inflammatory", "acne-treatment"]
  },
  {
    name: "Tranexamic Acid",
    alternativeNames: ["Trans-4-aminomethylcyclohexanecarboxylic acid"],
    category: "brightening",
    description: "A powerful brightening agent that inhibits melanin production and reduces dark spots. Originally used to control bleeding, it's now proven effective for treating hyperpigmentation.",
    benefits: [
      { skinType: "all", benefit: "Reduces dark spots and hyperpigmentation", effectivenessRating: 5 },
      { skinType: "all", benefit: "Evens skin tone", effectivenessRating: 4 },
      { skinType: "sensitive", benefit: "Gentle alternative to hydroquinone", effectivenessRating: 4 }
    ],
    concerns: [
      { concern: "dark_spots", effectiveness: "very_high" },
      { concern: "uneven_tone", effectiveness: "high" }
    ],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: false,
      comedogenicRating: 0,
      concentration: { min: 2, max: 5 }
    },
    usage: {
      timeOfDay: "both",
      frequency: { beginner: "Daily", experienced: "Twice daily" },
      application: "Apply to clean skin before moisturizer"
    },
    researchLevel: "moderate",
    rating: { average: 4.4, count: 285 },
    tags: ["brightening", "dark-spots", "gentle"]
  },
  {
    name: "Arbutin",
    alternativeNames: ["Alpha Arbutin", "Beta Arbutin", "Hydroquinone-beta-D-glucopyranoside"],
    category: "brightening",
    description: "A natural skin lightening agent derived from bearberry plants. Works by inhibiting tyrosinase activity to reduce melanin production safely.",
    benefits: [
      { skinType: "all", benefit: "Lightens dark spots", effectivenessRating: 4 },
      { skinType: "all", benefit: "Prevents new pigmentation", effectivenessRating: 4 },
      { skinType: "sensitive", benefit: "Gentle brightening", effectivenessRating: 4 }
    ],
    concerns: [
      { concern: "dark_spots", effectiveness: "high" },
      { concern: "uneven_tone", effectiveness: "moderate" }
    ],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: false,
      comedogenicRating: 0
    },
    usage: {
      timeOfDay: "both",
      frequency: { beginner: "Daily", experienced: "Twice daily" }
    },
    researchLevel: "moderate",
    rating: { average: 4.1, count: 195 },
    tags: ["natural", "brightening", "gentle"]
  },
  {
    name: "Bakuchiol",
    alternativeNames: ["Psoralea Corylifolia Extract"],
    category: "anti-aging",
    description: "A natural retinol alternative derived from the Psoralea corylifolia plant. Provides anti-aging benefits without the irritation associated with retinoids.",
    benefits: [
      { skinType: "all", benefit: "Stimulates collagen production", effectivenessRating: 4 },
      { skinType: "sensitive", benefit: "Gentle anti-aging", effectivenessRating: 4 },
      { skinType: "all", benefit: "Reduces fine lines", effectivenessRating: 3 }
    ],
    concerns: [
      { concern: "aging", effectiveness: "moderate" }
    ],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: false,
      comedogenicRating: 1
    },
    usage: {
      timeOfDay: "both",
      frequency: { beginner: "Daily", experienced: "Twice daily" }
    },
    researchLevel: "limited",
    rating: { average: 3.9, count: 150 },
    tags: ["natural", "retinol-alternative", "gentle"]
  },
  {
    name: "Centella Asiatica Extract",
    alternativeNames: ["Gotu Kola", "Cica", "Asiaticoside"],
    category: "soothing",
    description: "A healing herb with anti-inflammatory and wound-healing properties. Ideal for sensitive, irritated, or oily skin.",
    benefits: [
      { skinType: "sensitive", benefit: "Reduces inflammation", effectivenessRating: 5 },
      { skinType: "oily", benefit: "Calms breakouts", effectivenessRating: 4 },
      { skinType: "all", benefit: "Promotes wound healing", effectivenessRating: 4 }
    ],
    concerns: [
      { concern: "sensitivity", effectiveness: "very_high" },
      { concern: "acne", effectiveness: "moderate" }
    ],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: false,
      comedogenicRating: 0
    },
    usage: {
      timeOfDay: "both",
      frequency: { beginner: "Daily", experienced: "Twice daily" }
    },
    researchLevel: "extensive",
    rating: { average: 4.6, count: 420 },
    tags: ["soothing", "anti-inflammatory", "healing"]
  },
  {
    name: "Panthenol",
    alternativeNames: ["Pro-Vitamin B5", "Dexpanthenol"],
    category: "moisturizer",
    description: "A provitamin of B5 that acts as a humectant and anti-inflammatory agent. Helps maintain skin hydration and barrier function.",
    benefits: [
      { skinType: "all", benefit: "Moisturizes and hydrates", effectivenessRating: 4 },
      { skinType: "sensitive", benefit: "Reduces irritation", effectivenessRating: 4 },
      { skinType: "dry", benefit: "Repairs skin barrier", effectivenessRating: 4 }
    ],
    concerns: [
      { concern: "dryness", effectiveness: "high" },
      { concern: "sensitivity", effectiveness: "moderate" }
    ],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: false,
      comedogenicRating: 0
    },
    usage: {
      timeOfDay: "both",
      frequency: { beginner: "Daily", experienced: "Twice daily" }
    },
    researchLevel: "extensive",
    rating: { average: 4.3, count: 310 },
    tags: ["moisturizing", "gentle", "barrier-repair"]
  },
  {
    name: "Allantoin",
    alternativeNames: ["5-ureidohydantoin"],
    category: "soothing",
    description: "A gentle anti-inflammatory compound that promotes cell regeneration and wound healing. Excellent for sensitive and irritated skin.",
    benefits: [
      { skinType: "sensitive", benefit: "Reduces irritation and redness", effectivenessRating: 4 },
      { skinType: "all", benefit: "Promotes cell renewal", effectivenessRating: 3 },
      { skinType: "dry", benefit: "Softens and smooths skin", effectivenessRating: 4 }
    ],
    concerns: [
      { concern: "sensitivity", effectiveness: "high" },
      { concern: "dryness", effectiveness: "moderate" }
    ],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: false,
      comedogenicRating: 0
    },
    usage: {
      timeOfDay: "both",
      frequency: { beginner: "Daily", experienced: "Twice daily" }
    },
    researchLevel: "moderate",
    rating: { average: 4.0, count: 180 },
    tags: ["soothing", "healing", "gentle"]
  },
  {
    name: "Adenosine",
    alternativeNames: ["Adenosin"],
    category: "anti-aging",
    description: "A naturally occurring nucleoside that helps smooth wrinkles and improve skin elasticity. Works by increasing collagen production.",
    benefits: [
      { skinType: "all", benefit: "Reduces wrinkles", effectivenessRating: 4 },
      { skinType: "normal", benefit: "Improves skin elasticity", effectivenessRating: 4 },
      { skinType: "all", benefit: "Firms skin", effectivenessRating: 3 }
    ],
    concerns: [
      { concern: "aging", effectiveness: "high" }
    ],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: false,
      comedogenicRating: 0
    },
    usage: {
      timeOfDay: "both",
      frequency: { beginner: "Daily", experienced: "Twice daily" }
    },
    researchLevel: "moderate",
    rating: { average: 4.2, count: 220 },
    tags: ["anti-aging", "firming", "wrinkle-reducing"]
  },
  {
    name: "Butylene Glycol",
    alternativeNames: ["1,3-Butanediol"],
    category: "moisturizer",
    description: "A versatile humectant and solvent that helps other ingredients penetrate the skin while providing hydration.",
    benefits: [
      { skinType: "all", benefit: "Hydrates skin", effectivenessRating: 3 },
      { skinType: "all", benefit: "Enhances product absorption", effectivenessRating: 4 }
    ],
    concerns: [
      { concern: "dryness", effectiveness: "moderate" }
    ],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: false,
      comedogenicRating: 1
    },
    usage: {
      timeOfDay: "both",
      frequency: { beginner: "Daily", experienced: "Twice daily" }
    },
    researchLevel: "extensive",
    rating: { average: 3.8, count: 95 },
    tags: ["humectant", "penetration-enhancer", "gentle"]
  },
  {
    name: "Phenoxyethanol",
    alternativeNames: ["2-Phenoxyethanol"],
    category: "preservative",
    description: "A widely used preservative that prevents bacterial and fungal growth in cosmetic products. Generally well-tolerated by most skin types.",
    benefits: [
      { skinType: "all", benefit: "Preserves product safety", effectivenessRating: 5 }
    ],
    concerns: [],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: false,
      comedogenicRating: 0,
      concentration: { max: 1.0 }
    },
    usage: {
      timeOfDay: "both",
      frequency: { beginner: "Daily", experienced: "Daily" }
    },
    researchLevel: "extensive",
    rating: { average: 3.5, count: 75 },
    tags: ["preservative", "antimicrobial", "stabilizer"]
  },
  {
    name: "Aqua",
    alternativeNames: ["Water", "H2O"],
    category: "moisturizer",
    description: "The most common base ingredient in skincare products. Provides hydration and serves as a solvent for other active ingredients.",
    benefits: [
      { skinType: "all", benefit: "Basic hydration", effectivenessRating: 3 },
      { skinType: "all", benefit: "Serves as delivery system for actives", effectivenessRating: 4 }
    ],
    concerns: [
      { concern: "dryness", effectiveness: "moderate" }
    ],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: false,
      comedogenicRating: 0
    },
    usage: {
      timeOfDay: "both",
      frequency: { beginner: "Daily", experienced: "Daily" }
    },
    researchLevel: "extensive",
    rating: { average: 3.0, count: 50 },
    tags: ["base", "hydrating", "universal"]
  },
  {
    name: "Glycerin",
    alternativeNames: ["Glycerol", "Glycerine"],
    category: "moisturizer",
    description: "A powerful humectant that draws moisture from the environment and deeper layers of skin to the surface. One of the most effective and gentle moisturizing ingredients.",
    benefits: [
      { skinType: "all", benefit: "Attracts and retains moisture", effectivenessRating: 5 },
      { skinType: "dry", benefit: "Prevents moisture loss", effectivenessRating: 5 },
      { skinType: "sensitive", benefit: "Gentle and non-irritating", effectivenessRating: 4 }
    ],
    concerns: [
      { concern: "dryness", effectiveness: "very_high" }
    ],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: false,
      comedogenicRating: 0
    },
    usage: {
      timeOfDay: "both",
      frequency: { beginner: "Daily", experienced: "Twice daily" }
    },
    researchLevel: "extensive",
    rating: { average: 4.5, count: 450 },
    tags: ["humectant", "moisturizing", "gentle"]
  },
  {
    name: "Snail Secretion Filtrate",
    alternativeNames: ["Snail Mucin", "Helix Aspersa Secretion Filtrate"],
    category: "moisturizer",
    description: "A natural ingredient rich in hyaluronic acid, glycoproteins, and enzymes. Known for its healing, moisturizing, and anti-aging properties.",
    benefits: [
      { skinType: "all", benefit: "Promotes wound healing and regeneration", effectivenessRating: 4 },
      { skinType: "dry", benefit: "Intense hydration", effectivenessRating: 4 },
      { skinType: "sensitive", benefit: "Soothes irritated skin", effectivenessRating: 4 }
    ],
    concerns: [
      { concern: "dryness", effectiveness: "high" },
      { concern: "sensitivity", effectiveness: "moderate" },
      { concern: "aging", effectiveness: "moderate" }
    ],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: false,
      comedogenicRating: 0
    },
    usage: {
      timeOfDay: "both",
      frequency: { beginner: "Daily", experienced: "Twice daily" }
    },
    researchLevel: "moderate",
    rating: { average: 4.2, count: 320 },
    tags: ["natural", "healing", "moisturizing"]
  },
  {
    name: "Hydroxyethylcellulose",
    alternativeNames: ["HEC"],
    category: "emulsifier",
    description: "A plant-derived thickening agent and stabilizer that helps create the desired texture and consistency in skincare products.",
    benefits: [
      { skinType: "all", benefit: "Improves product texture", effectivenessRating: 3 },
      { skinType: "all", benefit: "Stabilizes formulation", effectivenessRating: 4 }
    ],
    concerns: [],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: false,
      comedogenicRating: 0
    },
    usage: {
      timeOfDay: "both",
      frequency: { beginner: "Daily", experienced: "Daily" }
    },
    researchLevel: "extensive",
    rating: { average: 3.2, count: 45 },
    tags: ["thickener", "stabilizer", "texture-enhancer"]
  },
  {
    name: "Propanediol",
    alternativeNames: ["1,3-Propanediol"],
    category: "moisturizer",
    description: "A natural, sustainable humectant derived from corn that helps retain moisture and enhances the penetration of other ingredients.",
    benefits: [
      { skinType: "all", benefit: "Hydrates skin", effectivenessRating: 3 },
      { skinType: "all", benefit: "Enhances ingredient absorption", effectivenessRating: 4 },
      { skinType: "sensitive", benefit: "Gentle alternative to propylene glycol", effectivenessRating: 4 }
    ],
    concerns: [
      { concern: "dryness", effectiveness: "moderate" }
    ],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: false,
      comedogenicRating: 0
    },
    usage: {
      timeOfDay: "both",
      frequency: { beginner: "Daily", experienced: "Daily" }
    },
    researchLevel: "extensive",
    rating: { average: 3.8, count: 85 },
    tags: ["humectant", "natural", "penetration-enhancer"]
  },
  {
    name: "Disodium EDTA",
    alternativeNames: ["EDTA", "Ethylenediaminetetraacetic acid disodium salt"],
    category: "preservative",
    description: "A chelating agent that binds metal ions to prevent them from destabilizing the product. Helps preserve product integrity and effectiveness.",
    benefits: [
      { skinType: "all", benefit: "Maintains product stability", effectivenessRating: 4 },
      { skinType: "all", benefit: "Prevents metal-catalyzed degradation", effectivenessRating: 5 }
    ],
    concerns: [],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: false,
      comedogenicRating: 0,
      concentration: { max: 0.1 }
    },
    usage: {
      timeOfDay: "both",
      frequency: { beginner: "Daily", experienced: "Daily" }
    },
    researchLevel: "extensive",
    rating: { average: 3.3, count: 40 },
    tags: ["chelating-agent", "stabilizer", "preservative-booster"]
  },
  {
    name: "Ethylhexylglycerin",
    alternativeNames: ["Octoxyglycerin"],
    category: "preservative",
    description: "A multifunctional ingredient that acts as a preservative booster, deodorant agent, and skin conditioning agent. Helps extend product shelf life.",
    benefits: [
      { skinType: "all", benefit: "Enhances preservative effectiveness", effectivenessRating: 4 },
      { skinType: "all", benefit: "Conditions and softens skin", effectivenessRating: 3 },
      { skinType: "sensitive", benefit: "Gentle preservative alternative", effectivenessRating: 3 }
    ],
    concerns: [],
    safetyInfo: {
      pregnancySafe: true,
      photosensitizing: false,
      comedogenicRating: 0,
      concentration: { max: 1.0 }
    },
    usage: {
      timeOfDay: "both",
      frequency: { beginner: "Daily", experienced: "Daily" }
    },
    researchLevel: "extensive",
    rating: { average: 3.6, count: 65 },
    tags: ["preservative", "skin-conditioning", "antimicrobial"]
  }
]

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mongo-api:7TZYsdhwiXhiKRp9@cluster0.18pi3.mongodb.net/skinStudyWeb?retryWrites=true&w=majority')
    console.log('✅ Connected to MongoDB')

    // Clear existing ingredients
    await Ingredient.deleteMany({})
    console.log('🗑️  Cleared existing ingredients')

    // Insert sample ingredients
    const insertedIngredients = await Ingredient.insertMany(ingredientsData)
    console.log(`✅ Inserted ${insertedIngredients.length} ingredients`)

    // Create text index for search functionality
    try {
      await Ingredient.collection.createIndex({ 
        name: "text", 
        alternativeNames: "text", 
        description: "text",
        "benefits.benefit": "text"
      })
      console.log('✅ Created text search index')
    } catch (indexError) {
      if (indexError.code === 85) {
        console.log('ℹ️  Text search index already exists (skipping)')
      } else {
        throw indexError
      }
    }

    console.log('🎉 Database seeding completed successfully!')
    
    // List all ingredients to verify
    const ingredients = await Ingredient.find({}, 'name category rating.average')
    console.log('\n📋 Seeded ingredients:')
    ingredients.forEach(ing => {
      console.log(`   • ${ing.name} (${ing.category}) - Rating: ${ing.rating.average}`)
    })

  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    // Close connection
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
    process.exit(0)
  }
}

// Run the seeding function
seedDatabase()