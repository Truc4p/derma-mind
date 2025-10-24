# Image Support in RAG System

## Overview

This implementation adds support for displaying figures and images from the knowledge base in AI Dermatologist responses. When the AI references figures from the textbook (e.g., "Figure 15-1"), the actual images are displayed inline in the chat interface.

## Architecture

### 1. **Static Image Serving**
- Images are stored in: `backend/knowledge-sources/extracted-content/images/`
- Backend serves images via: `http://localhost:3004/api/knowledge-images/{filename}`
- Example: `http://localhost:3004/api/knowledge-images/figure_15_1.png`

### 2. **Vector Database (Qdrant)**
- Contains text chunks from the knowledge base
- Image references are preserved as markdown: `![Figure 15-1](images/figure_15_1.png)`
- RAG retrieves relevant text chunks that may contain image references

### 3. **Image Processing Pipeline**

```
Knowledge Base → Vector DB (with image refs) 
                       ↓
                  RAG Retrieval
                       ↓
              AI Response (with markdown)
                       ↓
              Image Processor (converts to HTML)
                       ↓
              Frontend Display
```

## How It Works

### Backend Processing

1. **Text Chunking** (`vectorService.js`):
   - Knowledge base is split into chunks
   - Image markdown references are preserved in chunks
   - Example chunk: "Treatment involves... ![Figure 15-1](images/figure_15_1.png) ...results"

2. **RAG Retrieval**:
   - User query searches vector database
   - Returns relevant chunks (may include image references)
   - Context passed to Gemini AI

3. **AI Response Generation** (`geminiService.js`):
   - AI is instructed to include figure references in responses
   - Generates response with markdown image syntax

4. **Image URL Conversion** (`imageProcessor.js`):
   - Converts: `![alt](images/figure.png)` 
   - To: `<img src="http://localhost:3004/api/knowledge-images/figure.png" .../>`
   - Adds styling classes for proper display

### Frontend Display

1. **Markdown Rendering** (`AIDermatologist.vue`):
   - Uses `marked` library to parse markdown
   - HTML sanitization disabled to allow img tags
   - Images displayed inline in chat messages

2. **CSS Styling**:
   - Images have responsive sizing
   - Border radius and shadows for better UX
   - Proper spacing around figures

## File Structure

```
backend/
├── server.js                    # Static image route
├── utils/
│   └── imageProcessor.js        # Image processing utilities
├── services/
│   ├── geminiService.js         # AI response with images
│   └── vectorService.js         # RAG with image refs
├── controllers/
│   └── aiDermatologistController.js  # API endpoint
├── knowledge-sources/
│   └── extracted-content/
│       ├── images/              # 240+ figure images
│       │   ├── figure_1_1.png
│       │   ├── figure_15_1.png
│       │   └── ...
│       └── skin-care-beyond-the-basics-4th_figures.md

frontend/
└── src/
    └── views/
        └── AIDermatologist.vue  # Chat UI with image display
```

## API Response Format

```json
{
  "response": "<p>Acne treatment... <img src='http://localhost:3004/api/knowledge-images/figure_15_1.png' class='knowledge-figure' /></p>",
  "sources": [...],
  "images": [
    {
      "altText": "Figure 15-1",
      "filename": "figure_15_1.png",
      "fullReference": "![Figure 15-1](images/figure_15_1.png)"
    }
  ],
  "timestamp": "2025-10-24T..."
}
```

## Testing

### 1. Test Image Serving
```bash
cd backend
node scripts/testImageServing.js
```

### 2. Test in Browser
Start backend:
```bash
cd backend
npm start
```

Visit: `http://localhost:3004/api/knowledge-images/figure_15_1.png`

### 3. Test in Chat Interface
1. Start frontend and backend
2. Ask: "What does acne look like? Show me examples"
3. AI should include relevant figures in response

## Available Figures

The knowledge base includes 240+ figures covering:
- Chapter 1-24 illustrations
- Skin anatomy diagrams
- Condition examples (acne, rosacea, etc.)
- Treatment procedures
- Before/after comparisons
- Product formulations

## Environment Variables

```env
# backend/.env
PORT=3004
BACKEND_URL=http://localhost:3004
```

## Advantages of This Approach

✅ **Efficient**: Images not embedded in vector DB (would be huge)
✅ **Fast**: Static file serving is very fast
✅ **Scalable**: Can add CDN later for production
✅ **Flexible**: Easy to update images without re-embedding
✅ **Cost-effective**: No extra API calls for images
✅ **SEO-friendly**: Proper img tags with alt text

## Production Considerations

For production deployment:

1. **CDN Integration**: Move images to CDN (e.g., Cloudflare, AWS S3)
2. **Image Optimization**: Compress images for faster loading
3. **Lazy Loading**: Implement lazy loading for images
4. **CORS**: Configure proper CORS headers
5. **Caching**: Add cache headers for image responses
6. **HTTPS**: Ensure images served over HTTPS

## Troubleshooting

### Images not displaying?
1. Check backend is running: `http://localhost:3004/api/health`
2. Test direct image URL: `http://localhost:3004/api/knowledge-images/figure_1_1.png`
3. Check browser console for CORS errors
4. Verify image files exist in `knowledge-sources/extracted-content/images/`

### AI not including figures?
1. Check if relevant chunks contain image references
2. Verify AI system prompt includes instruction to use figures
3. Test with specific query: "Show me Figure 15-1"

## Future Enhancements

- [ ] Add image gallery view
- [ ] Implement image zoom/lightbox
- [ ] Add image captions from knowledge base
- [ ] Support for multiple image sizes
- [ ] Image preloading for better UX
- [ ] Alt text generation for accessibility
