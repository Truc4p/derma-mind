# Skin Study - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.1.0] - 2025-11-12

### 🌍 Added - Multilingual Support with Automatic Translation

**Feature:** AI Dermatology Expert now supports queries in any language while maintaining high-quality RAG retrieval.

#### What Changed:
- Added automatic language detection for user queries
- Implemented query translation to English for vector search
- AI responses now generated in user's original language
- Enhanced RAG accuracy for non-English queries

#### Technical Details:

**Files Modified:**
- `backend/services/geminiService.js` - Added translation capabilities
  - New `translationModel` configuration
  - New `detectAndTranslate()` method
  - Updated `generateResponseWithContext()` for language awareness
  
- `backend/controllers/aiDermatologyExpertController.js` - Updated chat endpoint
  - Added translation step before RAG search
  - Improved performance logging with language info

**New Methods:**
```javascript
// geminiService.js
async detectAndTranslate(text) {
  // Detects language and translates to English if needed
  // Returns: { isEnglish, originalText, translatedText, detectedLanguage, languageName }
}
```

#### Performance Improvements:

**Before:**
- Vietnamese query "Mụn là gì": 48% similarity score
- Retrieved: Copyright text and metadata
- Response: Generic fallback message

**After:**
- Vietnamese query "Mụn là gì": 73% similarity score
- Retrieved: Relevant acne treatment content
- Response: Detailed Vietnamese answer with citations
- Added latency: ~500-800ms (acceptable)

#### Supported Languages:
- ✅ Vietnamese (vi)
- ✅ Chinese (zh)
- ✅ Japanese (ja)
- ✅ Korean (ko)
- ✅ Spanish (es)
- ✅ French (fr)
- ✅ German (de)
- ✅ Thai (th)
- ✅ Indonesian (id)
- ✅ Any language supported by Gemini

#### Benefits:
- **Universal Access**: Users can interact in their native language
- **Better RAG Results**: English translation yields 25-50% higher similarity scores
- **Preserved Quality**: Citations and formatting maintained across languages
- **Graceful Fallback**: Falls back to original text if translation fails
- **No Database Changes**: Works with existing English knowledge base

#### Example Usage:

**Vietnamese Query:**
```
User: "Mụn là gì"

System Processing:
🌐 Language detected: Vietnamese
🔄 Translation: "What is acne"
📚 RAG Search: 3 chunks retrieved (73-74% similarity)
💬 Response: Generated in Vietnamese with citations
```

**Response:**
```markdown
Mụn là một tình trạng da phổ biến có thể biểu hiện dưới nhiều hình thức khác nhau...

**Các loại mụn khác nhau:**
- Mụn đầu đen
- Mụn đầu trắng
- Mụn sần
- Mụn mủ

**Nguyên nhân gây mụn:**
- Sản xuất bã nhờn dư thừa
- Lỗ chân lông bị tắc nghẽn
- Vi khuẩn
- Viêm

### References
[1] Fitzpatrick's Dermatology in General Medicine (8th Edition)
[2,3] Cosmetics and Dermatological Problems and Solutions
```

#### Code Changes Summary:

1. **Translation Model** (geminiService.js):
   - Temperature: 0.1 (high accuracy)
   - Max tokens: 500
   - Purpose: Language detection and translation

2. **Language Detection** (geminiService.js):
   - Non-ASCII character ratio check
   - JSON-based language identification
   - Fallback to original text on failure

3. **RAG Pipeline** (aiDermatologyExpertController.js):
   - Translates query to English
   - Performs vector search with translation
   - Passes original message to AI for language context
   - Returns debug info in development mode

4. **Response Generation** (geminiService.js):
   - Detects user's language
   - Adds language instruction to prompt
   - Ensures response matches user's language
   - Maintains citation formatting

#### Testing Notes:
- ✅ Tested with Vietnamese queries
- ✅ Tested with English queries (no regression)
- ✅ Verified citation preservation
- ✅ Confirmed graceful fallback
- ⏳ Pending: Comprehensive testing with other languages

#### Breaking Changes:
- None - Backward compatible with existing functionality

#### Dependencies:
- No new dependencies added
- Uses existing `@google/generative-ai` package

---

## [1.0.0] - 2025-11-10

### Initial Release

#### Core Features:
- ✅ Intelligent Skin Analysis System
- ✅ AI Dermatology Expert with RAG
- ✅ Education Hub
- ✅ Ingredient Database
- ✅ Skincare Routine Generator
- ✅ Web Frontend (Vue.js)
- ✅ Mobile App (React Native)
- ✅ User Authentication
- ✅ Image Analysis (Gemini Vision)
- ✅ Voice Chat (Speech-to-text, Text-to-speech)

#### Technologies:
- Backend: Node.js + Express.js
- Frontend: Vue.js 3 + Vite
- Mobile: React Native + Expo
- Database: MongoDB + Qdrant (Vector DB)
- AI: Google Gemini 2.0 Flash + Text-Embedding-004

#### Knowledge Base:
- 10 dermatology textbooks
- ~3,000-5,000 knowledge chunks
- 768-dimensional embeddings
- Cosine similarity search

---

## Future Improvements

### Planned:
- [ ] WebSocket support for real-time chat
- [ ] Offline mode for mobile app
- [ ] Custom trained ML models
- [ ] Video consultation feature
- [ ] Multi-language knowledge base (native translations)
- [ ] Enhanced image analysis with custom models

### Under Consideration:
- [ ] GraphQL API
- [ ] Progressive Web App (PWA)
- [ ] Voice-only mode
- [ ] Skin tracking over time
- [ ] Community features

---

**Last Updated:** November 12, 2025  
**Repository:** [github.com/Truc4p/skin-study](https://github.com/Truc4p/skin-study)
