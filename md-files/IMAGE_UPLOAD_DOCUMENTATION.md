# Image Upload System Documentation

## Overview
The AI Dermatologist feature includes an image upload system that allows users to upload skin images for AI analysis. This document explains how images are stored, processed, and cleaned up throughout the application lifecycle.

---

## Architecture

### 1. Frontend Storage (Temporary - In Memory)

#### When User Selects an Image

```javascript
handleImageSelect(event) {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
        this.selectedImage = file  // Raw File object stored in memory
        this.imagePreviewUrl = URL.createObjectURL(file)  // Blob URL created for preview
    }
}
```

**Storage Details:**
- **`selectedImage`**: Stores the actual File object in browser memory (not saved to disk)
- **`imagePreviewUrl`**: Creates a temporary blob URL like `blob:http://localhost:5175/444857f7-86e2-4232-8696-2678336cd931`
  - This is a temporary URL pointing to memory
  - NOT a real file path
  - Only valid in current browser session
  - Becomes invalid after page refresh or browser close

---

### 2. Backend Storage (Temporary - On Disk)

#### When Message is Sent

**Frontend:**
```javascript
// Sends file via FormData
const formData = new FormData()
formData.append('image', imageFile)  // Sends the File object
formData.append('message', userMessage)
formData.append('conversationHistory', JSON.stringify(history))
```

**Backend (Multer Configuration):**
```javascript
// In routes/aiDermatologist.js
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/images/') // Saved to this directory
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'skin-image-' + uniqueSuffix + path.extname(file.originalname))
        // Example: skin-image-1762519762426-699717623.webp
    }
});
```

**Storage Location:**
```
/backend/uploads/images/skin-image-[timestamp]-[random].[ext]
```

**File Lifecycle:**
1. Image uploaded via multipart/form-data
2. Multer saves to `uploads/images/` directory
3. Gemini Vision API analyzes the image
4. File is **DELETED** after analysis completes
5. Analysis results returned to frontend

**Backend Cleanup:**
```javascript
// In controllers/aiDermatologistController.js
try {
    // Analyze image with Gemini
    const result = await geminiService.analyzeSkinImage(...)
    
    // Clean up the temporary file
    await fs.unlink(tempFilePath)  // ✅ Deletes file from disk
} catch (error) {
    // Clean up even on error
    if (tempFilePath) {
        await fs.unlink(tempFilePath)
    }
}
```

---

### 3. Chat History Storage (localStorage)

#### Problem with Blob URLs

Blob URLs cannot be saved to localStorage because they:
- Are temporary memory references
- Become invalid after page refresh
- Cannot be serialized properly
- Only work in the browser session that created them

#### Solution - Filter Out Blob URLs

```javascript
// In saveCurrentSession()
const messagesToSave = this.messages.map(msg => {
    if (msg.image && msg.image.startsWith('blob:')) {
        // Don't save blob URLs - they won't work after reload
        return {
            ...msg,
            image: null,  // Remove blob URL
            content: msg.content + ' [Image was uploaded]'  // Add note
        }
    }
    return msg
})

// Save to localStorage
localStorage.setItem('aiDermatologistSessions', JSON.stringify({
    messages: messagesToSave
}))
```

**Result:**
- Text conversations are preserved
- Image previews are NOT saved
- User sees "[Image was uploaded]" note in chat history after reload

---

## Image Removal & Cleanup

### 4.1 Manual Removal (Before Sending)

```javascript
removeImage() {
    this.selectedImage = null  // Clear File object from memory
    if (this.imagePreviewUrl) {
        URL.revokeObjectURL(this.imagePreviewUrl)  // ✅ Free memory
        this.imagePreviewUrl = null
    }
    // Reset file input
    this.$refs.imageInput.value = ''
}
```

**When:** User clicks the "✕" button on image preview  
**Effect:** Image removed, memory freed, no upload occurs

---

### 4.2 After Sending Message

```javascript
async sendMessage() {
    // Keep a copy of blob URL for display in current session
    const imagePreview = this.imagePreviewUrl
    
    const userMessage = {
        role: 'user',
        content: this.userInput.trim(),
        image: imagePreview  // Store for current session
    }
    
    this.messages.push(userMessage)
    
    // Clear input preview (but DON'T revoke blob yet - message still needs it!)
    this.selectedImage = null
    this.imagePreviewUrl = null
    this.$refs.imageInput.value = ''
    
    // Send to backend
    await this.getAIResponse(messageToSend, imageToSend)
}
```

**When:** User sends message with image  
**Effect:** 
- Image uploaded to backend
- Blob URL kept alive for current session display
- Input cleared for next message

---

### 4.3 Cleanup on Chat Clear/New Chat

```javascript
cleanupBlobUrls() {
    // Revoke blob URLs to prevent memory leaks
    this.messages.forEach(message => {
        if (message.image && message.image.startsWith('blob:')) {
            URL.revokeObjectURL(message.image)  // ✅ Free memory
        }
    })
}

startNewChat() {
    if (confirm('Start a new chat?')) {
        this.saveCurrentSession()
        this.cleanupBlobUrls()  // ✅ Clean up all blob URLs
        this.messages = []
    }
}

clearChat() {
    if (confirm('Clear this chat?')) {
        this.cleanupBlobUrls()  // ✅ Clean up all blob URLs
        this.messages = []
    }
}
```

**When:** User starts new chat or clears current chat  
**Effect:** All blob URLs revoked, memory freed

---

### 4.4 Cleanup on Component Destroy

```javascript
beforeUnmount() {
    // Clean up any blob URLs when component is destroyed
    this.cleanupBlobUrls()  // Clean all message images
    if (this.imagePreviewUrl) {
        URL.revokeObjectURL(this.imagePreviewUrl)  // Clean input preview
    }
}
```

**When:** User navigates away from AI Dermatologist page  
**Effect:** All blob URLs revoked, prevents memory leaks

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER SELECTS IMAGE                                       │
├─────────────────────────────────────────────────────────────┤
│ • File stored in memory (selectedImage)                     │
│ • Blob URL created for preview (imagePreviewUrl)            │
│   Example: blob:http://localhost:5175/abc-123               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. USER SENDS MESSAGE                                       │
├─────────────────────────────────────────────────────────────┤
│ • File sent to backend via FormData                         │
│ • Backend saves to /uploads/images/                         │
│   Example: skin-image-1762519762426-699717623.webp          │
│ • Gemini Vision API analyzes the image                      │
│ • Backend DELETES file after analysis ✅                    │
│ • Frontend keeps blob URL for display in current session    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. CHAT SAVED TO LOCALSTORAGE                               │
├─────────────────────────────────────────────────────────────┤
│ • Blob URLs replaced with null + text note                  │
│   "[Image was uploaded]"                                    │
│ • Only text data saved (blob URLs can't be saved)           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. CLEANUP (New Chat / Clear / Page Leave)                  │
├─────────────────────────────────────────────────────────────┤
│ • All blob URLs revoked (memory freed) ✅                   │
│ • Prevents memory leaks                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Points & Best Practices

### ✅ Images are NOT permanently stored
- Backend deletes images after AI analysis
- This saves disk space
- Privacy-friendly (images not retained)

### ✅ Blob URLs are temporary
- Only work in current browser session
- Invalid after page refresh
- Cannot be saved to localStorage
- Must be revoked to prevent memory leaks

### ✅ localStorage limitations
- Can only store text data (JSON)
- Cannot store binary data (images)
- Cannot store blob URLs (they're temporary references)
- Chat history preserved without images

### ✅ Memory management
- Blob URLs must be manually revoked
- Cleanup on component unmount prevents leaks
- Cleanup on chat clear/new chat prevents leaks
- File input reset after use

### ✅ Error handling
- Files deleted even if AI analysis fails
- Cleanup in catch blocks
- Graceful degradation if upload fails

---

## To Implement Permanent Image Storage

If you need to **permanently save images**, you would need:

### Backend Changes:
1. **Don't delete files** after analysis:
```javascript
// Remove this line:
// await fs.unlink(tempFilePath)
```

2. **Serve images via Express static middleware**:
```javascript
// In server.js
app.use('/uploads', express.static('uploads'));
```

3. **Return image URL** from backend:
```javascript
// In controller
res.json({
    response: result.response,
    imageUrl: `/uploads/images/${filename}`,  // Add this
    sources: ragResult.sources
});
```

### Frontend Changes:
1. **Save real URLs** (not blob URLs) to localStorage:
```javascript
const userMessage = {
    role: 'user',
    content: this.userInput,
    image: response.data.imageUrl  // Use backend URL
}
```

2. **No need to revoke** these URLs (they're real HTTP URLs)

### Database Storage:
For production, consider:
- Cloud storage (AWS S3, Azure Blob Storage, Cloudinary)
- Database records with image URLs
- Proper access control and permissions
- Image optimization and thumbnails

---

## Security Considerations

### File Validation:
```javascript
// Multer file filter
fileFilter: function (req, file, cb) {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);  // Accept file
    } else {
        cb(new Error('Only image files are allowed'));  // Reject file
    }
}
```

### File Size Limits:
```javascript
// Multer configuration
limits: {
    fileSize: 10 * 1024 * 1024  // 10MB limit
}
```

### Accepted Formats:
- JPEG/JPG
- PNG
- GIF
- WebP

### Best Practices:
- ✅ Validate file type on client and server
- ✅ Limit file size (10MB max)
- ✅ Use unique filenames (timestamp + random)
- ✅ Store in dedicated uploads directory
- ✅ Clean up temporary files after use
- ✅ Don't expose full server paths to client
- ✅ Sanitize filenames to prevent path traversal

---

## Troubleshooting

### Issue: "ERR_FILE_NOT_FOUND" for blob URLs
**Cause:** Blob URL was revoked or page was refreshed  
**Solution:** Don't save blob URLs to localStorage (already implemented)

### Issue: Backend 500 error "ENOENT: no such file or directory"
**Cause:** `uploads/images` directory doesn't exist  
**Solution:** Directory is automatically created during setup

### Issue: Image preview not showing
**Cause:** Blob URL not created or file input not working  
**Solution:** Check `handleImageSelect()` is triggered and file type is valid

### Issue: Memory leaks with many images
**Cause:** Blob URLs not being revoked  
**Solution:** Use `cleanupBlobUrls()` method (already implemented)

### Issue: Rate limit errors (429)
**Cause:** Too many requests to Gemini API  
**Solution:** Retry logic with exponential backoff (already implemented)

---

## Related Files

### Frontend:
- `/frontend/src/views/AIDermatologist.vue` - Main component with image upload
- `/frontend/src/services/api.js` - API service for backend communication

### Backend:
- `/backend/routes/aiDermatologist.js` - Routes with multer configuration
- `/backend/controllers/aiDermatologistController.js` - Image analysis logic
- `/backend/services/geminiService.js` - Gemini Vision API integration
- `/backend/uploads/images/` - Temporary image storage directory

---

## API Endpoints

### POST `/api/ai-dermatologist/analyze-skin`
**Purpose:** Analyze skin image with AI  
**Method:** POST  
**Content-Type:** multipart/form-data  
**Parameters:**
- `image` (file) - The skin image to analyze
- `message` (string) - User's question about the image
- `conversationHistory` (JSON string) - Previous chat messages

**Response:**
```json
{
    "response": "Detailed AI analysis...",
    "sources": [...],
    "timestamp": "2025-11-07T...",
    "_performance": {
        "totalTime": 10725,
        "contextSize": 4533,
        "chunks": 3
    }
}
```

---

## Testing Checklist

- [ ] Upload image successfully
- [ ] Image preview displays correctly
- [ ] Remove image before sending
- [ ] Send image with message
- [ ] AI analysis completes successfully
- [ ] Image displays in chat message
- [ ] Start new chat (blob URLs cleaned)
- [ ] Clear chat (blob URLs cleaned)
- [ ] Navigate away from page (cleanup on unmount)
- [ ] Refresh page (blob URLs not saved, text preserved)
- [ ] Upload multiple images in sequence
- [ ] Upload different file formats (JPEG, PNG, WebP)
- [ ] Upload large file (should fail with file size error)
- [ ] Upload non-image file (should fail with file type error)
- [ ] Backend 429 error handling and retry
- [ ] Offline fallback response

---

## Performance Considerations

### Frontend:
- Blob URLs are lightweight (just memory references)
- No impact on localStorage size (images not saved)
- Cleanup prevents memory leaks
- File input reset prevents state issues

### Backend:
- Files deleted immediately after analysis
- No long-term storage required
- Minimal disk space usage
- Fast cleanup with `fs.unlink()`

### Network:
- Images compressed before upload (browser default)
- 10MB file size limit prevents huge uploads
- FormData efficiently handles binary data
- Retry logic handles transient failures

---

## Future Enhancements

### Possible Improvements:
1. **Image compression** before upload (client-side)
2. **Drag & drop** image upload
3. **Camera capture** for mobile devices
4. **Multiple image upload** at once
5. **Image cropping/editing** before analysis
6. **Progress indicator** during upload
7. **Cloud storage integration** (S3, Cloudinary)
8. **Thumbnail generation** for chat history
9. **Image metadata extraction** (EXIF data)
10. **Before/after comparison** feature

---

## License & Credits

This image upload system is part of the Skin Study application.  
Developed for FYP-c1682 project.

**Technologies Used:**
- Vue.js 3 (Frontend)
- Multer (File upload middleware)
- Gemini Vision API (Image analysis)
- Express.js (Backend server)
- Node.js File System (File operations)
