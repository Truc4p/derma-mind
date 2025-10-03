require('dotenv').config()
const mongoose = require('mongoose')
const Ingredient = require('./models/Ingredient')

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
      { skinType: "normal", benefit: "Prevents premature aging", effectivenessRating: 4 },
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
    description: "A beta hydroxy acid that penetrates deep into pores to remove dead skin cells and excess oil. Excellent for acne-prone skin.",
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
      { skinType: "normal", benefit: "Prevents premature aging", effectivenessRating: 3 }
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