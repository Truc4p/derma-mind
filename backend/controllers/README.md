# Controllers Documentation

This directory contains all the controller logic for the Skin Study application. Controllers handle the business logic and act as an intermediary between routes and services/models.

## Architecture Overview

The application now follows the **MVC (Model-View-Controller)** pattern with clear separation of concerns:

```
routes/ → controllers/ → services/models/
  ↓           ↓              ↓
Define     Handle         Business
endpoints  requests       logic &
           & responses    data access
```

## Controllers

### 1. authController.js
Handles user authentication and profile management.

**Functions:**
- `register(req, res)` - Register a new user
- `login(req, res)` - Authenticate user and return JWT token
- `getMe(req, res)` - Get current user profile
- `updateProfile(req, res)` - Update user profile information
- `changePassword(req, res)` - Change user password

**Routes:** `/api/auth/*`

---

### 2. educationController.js
Manages educational content for skincare learning.

**Functions:**
- `getAllContent(req, res)` - Get all published education content with filtering
- `getCategories(req, res)` - Get all categories and their counts
- `getPopularContent(req, res)` - Get most viewed/popular content
- `getFeaturedContent(req, res)` - Get featured content
- `getRecommendations(req, res)` - Get personalized recommendations
- `getContentBySlug(req, res)` - Get single content by slug
- `rateContent(req, res)` - Submit rating for content
- `likeContent(req, res)` - Like content

**Routes:** `/api/education/*`

---

### 3. ingredientController.js
Handles skincare ingredient information and analysis.

**Functions:**
- `getAllIngredients(req, res)` - Get all ingredients with filtering
- `getCategories(req, res)` - Get ingredient categories
- `searchIngredients(req, res)` - Search ingredients by name
- `batchSearchIngredients(req, res)` - Search multiple ingredients at once
- `getTopRatedIngredients(req, res)` - Get highest rated ingredients
- `getIngredientsByConcern(req, res)` - Get ingredients for specific concerns
- `getSearchSuggestions(req, res)` - Get autocomplete suggestions
- `getIngredientByName(req, res)` - Get detailed ingredient information
- `rateIngredient(req, res)` - Rate an ingredient
- `getIngredientInteractions(req, res)` - Get ingredient compatibility info

**Routes:** `/api/ingredients/*`

---

### 4. aiDermatologistController.js
Manages AI-powered skincare consultation.

**Functions:**
- `chat(req, res)` - Handle chat messages with AI dermatologist
- `analyzeQuery(req, res)` - Analyze skin concerns or queries
- `generateRoutine(req, res)` - Generate personalized skincare routine

**Routes:** `/api/ai-dermatologist/*`

**Note:** This controller delegates to `geminiService` for AI processing.

---

### 5. skinAnalysisController.js
Handles skin type analysis and recommendations.

**Functions:**
- `analyzeSkin(req, res)` - Perform comprehensive skin analysis
- `getAnalysisHistory(req, res)` - Get user's analysis history (private)
- `getAnalysisById(req, res)` - Get specific analysis by session ID
- `getAnalysisStats(req, res)` - Get analysis statistics (admin only)

**Routes:** `/api/skin-analysis/*`

**Helper Functions:**
- `analyzeSkin(responses)` - Internal algorithm for skin type determination
- `generateRecommendations(skinType, concerns, responses)` - Generate custom recommendations

---

### 6. routineController.js
Manages skincare routine templates and customization.

**Functions:**
- `getRoutines(req, res)` - Get routine templates by skin type
- `customizeRoutine(req, res)` - Create customized routine based on user profile
- `getProductSuggestions(req, res)` - Get product suggestions for routine steps

**Routes:** `/api/routines/*`

**Helper Functions:**
- `calculateRoutineTime(steps)` - Calculate total routine time
- `getSkinTypeDescription(skinType)` - Get description for skin type
- `simplifyRoutine(routine)` - Simplify routine for beginners
- `enhanceRoutine(routine)` - Add advanced steps
- And more utility functions for routine customization

---

## Benefits of Controller Pattern

### ✅ Separation of Concerns
- Routes only define endpoints
- Controllers handle request/response logic
- Services/Models handle business logic and data access

### ✅ Reusability
- Controllers can be reused across different routes
- Easier to create API versions (v1, v2)

### ✅ Testability
- Controllers can be unit tested independently
- Easier to mock dependencies

### ✅ Maintainability
- Changes to business logic are isolated
- Easier to locate and fix bugs
- Better code organization

### ✅ Scalability
- Easy to add new endpoints
- Simple to refactor without affecting routes

---

## Usage Example

### Before (Route with inline logic):
```javascript
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    // ... 50 lines of logic ...
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### After (Route with controller):
```javascript
// Route file (routes/auth.js)
router.post('/login', authController.login);

// Controller file (controllers/authController.js)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    // ... business logic ...
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

---

## Best Practices

1. **Keep controllers thin** - Delegate complex logic to services
2. **Handle errors properly** - Use try-catch blocks consistently
3. **Validate input** - Check required parameters before processing
4. **Return consistent responses** - Use standard response format
5. **Document functions** - Use JSDoc comments for all exports
6. **Avoid business logic** - Move complex calculations to services
7. **Use middleware** - For authentication, validation, etc.

---

## Error Handling Pattern

All controllers follow this error handling pattern:

```javascript
exports.controllerFunction = async (req, res) => {
  try {
    // Extract parameters
    const { param1, param2 } = req.body;
    
    // Validate
    if (!param1) {
      return res.status(400).json({
        success: false,
        message: 'param1 is required'
      });
    }
    
    // Process
    const result = await someService.process(param1, param2);
    
    // Respond
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Function error:', error);
    res.status(500).json({
      success: false,
      message: 'Error message',
      error: error.message
    });
  }
};
```

---

## Future Enhancements

- Add request validation middleware (e.g., express-validator)
- Implement response formatter utility
- Add more comprehensive error handling
- Create base controller class for common functionality
- Add request logging middleware
- Implement rate limiting per controller
- Add caching layer for frequently accessed data

---

## Related Documentation

- [Routes README](../routes/README.md)
- [Services README](../services/README.md)
- [Models README](../models/README.md)
- [API Documentation](../../md-files/API_DOCUMENTATION.md)
