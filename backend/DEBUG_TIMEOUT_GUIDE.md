# Debug Guide: 30-Second Timeout Issue

## Problem
The transcription request is timing out after 30 seconds with error:
```
❌ Transcription error: timeout of 30000ms exceeded
```

## Changes Made

### 1. Extended Timeout
- **Frontend** (`mobile-chat-app/services/api.js`): Increased from 30s to **90 seconds**
- **Reason**: AssemblyAI transcription can take longer depending on audio length and network speed

### 2. Added Comprehensive Logging

#### Frontend Logs (`[FRONTEND]` prefix):
```
📤 [FRONTEND] Starting transcription upload at: [timestamp]
📤 [FRONTEND] Audio URI: [file path]
📤 [FRONTEND] API URL: [endpoint]
📦 [FRONTEND] FormData prepared with: [file details]
🚀 [FRONTEND] Sending POST request...
📊 [FRONTEND] Upload progress: X%
✅ [FRONTEND] Transcription received in Xms
```

#### Backend Route Logs (`[MULTER]` prefix):
```
📋 [MULTER] Incoming file: [file details]
✅ [MULTER] File accepted
```

#### Backend Controller Logs (`[BACKEND]` prefix):
```
=== 📥 [BACKEND] TRANSCRIPTION REQUEST RECEIVED ===
⏰ [BACKEND] Request time: [timestamp]
📁 [BACKEND] File details: [size, mimetype, path]
🎤 [BACKEND] Calling geminiService.transcribeAudio...
✅ [BACKEND] Transcription completed in Xms
🗑️ [BACKEND] Cleaning up temp file
✅ [BACKEND] Request completed in Xms
=== ✅ [BACKEND] TRANSCRIPTION SUCCESS ===
```

#### Gemini Service Logs (`[GEMINI SERVICE]` prefix):
```
=== 🎙️ [GEMINI SERVICE] TRANSCRIPTION REQUEST ===
⏰ [GEMINI SERVICE] Start time: [timestamp]
🚀 [GEMINI SERVICE] Calling speechService.transcribeAudio...
✅ [GEMINI SERVICE] Transcription completed in Xms
=== ✅ [GEMINI SERVICE] SUCCESS ===
```

#### Speech Service Logs (`[SPEECH SERVICE]` prefix):
```
=== 🎤 [SPEECH SERVICE] TRANSCRIPTION START ===
⏰ [SPEECH SERVICE] Start time: [timestamp]
📁 [SPEECH SERVICE] File path: [path]
📊 [SPEECH SERVICE] File stats: [size, created date]
🚀 [SPEECH SERVICE] Starting AssemblyAI upload...
✅ [SPEECH SERVICE] Upload & transcription completed in Xms
📋 [SPEECH SERVICE] Transcript status: [status]
📋 [SPEECH SERVICE] Transcript ID: [id]
✅ [SPEECH SERVICE] Total time: Xms
📝 [SPEECH SERVICE] Transcription result: [text]
=== ✅ [SPEECH SERVICE] TRANSCRIPTION SUCCESS ===
```

## How to Debug

### Step 1: Test the Setup
1. **Restart your backend server**:
   ```bash
   cd /Users/phamthanhtruc/Downloads/uni/FYP-c1682/skin-study/backend
   npm start
   ```

2. **Look for initialization message**:
   ```
   ✅ AssemblyAI client initialized
   ```
   - If you see `⚠️ ASSEMBLYAI_API_KEY not found`, check your `.env` file

### Step 2: Test Recording
1. Open the mobile app
2. Go to "Go Live with AI"
3. Record a short message (5-10 seconds)
4. Stop recording
5. **Watch the logs carefully**

### Step 3: Identify Where It Stops

#### Scenario A: Stops at Frontend Upload
**Logs show**:
```
📤 [FRONTEND] Starting transcription upload...
📦 [FRONTEND] FormData prepared...
🚀 [FRONTEND] Sending POST request...
[30+ seconds pass]
❌ Transcription error: timeout of 30000ms exceeded
```

**No backend logs appear**

**Problem**: Request not reaching backend
**Causes**:
- Wrong API URL (check iOS vs Android URL in `api.js`)
- Network connectivity issue
- Backend server not running
- Firewall blocking connection

**Solutions**:
1. Verify backend is running on port 3004
2. For iOS Simulator: should use `http://localhost:3004`
3. For Android Physical Device: check IP address in `api.js`
4. Test backend directly: `curl http://localhost:3004/api/ai-dermatologist/chat -X POST`

---

#### Scenario B: Stops at Multer File Upload
**Logs show**:
```
📤 [FRONTEND] Sending POST request...
[No MULTER logs]
[30+ seconds timeout]
```

**Problem**: File upload failing
**Causes**:
- File too large (>10MB limit)
- Invalid file format
- Multer storage directory missing

**Solutions**:
1. Check file size in frontend logs
2. Create directory: `mkdir -p uploads/audio`
3. Check file permissions

---

#### Scenario C: Stops at Backend Controller
**Logs show**:
```
📋 [MULTER] File accepted
=== 📥 [BACKEND] TRANSCRIPTION REQUEST RECEIVED ===
📁 [BACKEND] File details: {...}
🎤 [BACKEND] Calling geminiService.transcribeAudio...
[Stops here - timeout after 30-90s]
```

**Problem**: Transcription taking too long or hanging
**Causes**:
- AssemblyAI API slow response
- Network latency to AssemblyAI servers
- Audio file too long
- AssemblyAI API key invalid

**Solutions**:
1. Check audio duration - keep under 1 minute for testing
2. Check internet connection speed
3. Verify AssemblyAI API key in `.env`
4. Check AssemblyAI dashboard for API status

---

#### Scenario D: Stops at Speech Service
**Logs show**:
```
=== 🎤 [SPEECH SERVICE] TRANSCRIPTION START ===
📁 [SPEECH SERVICE] File path: uploads/audio/xxx.m4a
📊 [SPEECH SERVICE] File stats: {...}
🚀 [SPEECH SERVICE] Starting AssemblyAI upload...
[Hangs here - no completion message]
```

**Problem**: AssemblyAI API call hanging
**Causes**:
- AssemblyAI API unavailable
- Network timeout to AssemblyAI
- API key invalid/expired
- Rate limit exceeded

**Solutions**:
1. Test API key manually:
   ```bash
   curl -H "Authorization: YOUR_API_KEY" https://api.assemblyai.com/v2/transcript
   ```
2. Check AssemblyAI status page
3. Verify API key is correct in `.env`
4. Check usage limits on AssemblyAI dashboard

---

#### Scenario E: API Key Missing
**Logs show**:
```
⚠️ ASSEMBLYAI_API_KEY not found in environment variables
⚠️ Speech transcription will not be available
...
❌ [SPEECH SERVICE] Client not initialized - API key missing
⚠️ [GEMINI SERVICE] AssemblyAI error: ASSEMBLYAI_API_KEY_MISSING
📖 [GEMINI SERVICE] Please add ASSEMBLYAI_API_KEY to your .env file
```

**Problem**: API key not configured
**Solution**:
1. Check `.env` file has:
   ```
   ASSEMBLYAI_API_KEY=cf4154bbe4f8433dabd792e10c4e67ee
   ```
2. Restart backend server
3. Verify you see: `✅ AssemblyAI client initialized`

---

## Expected Timing (Normal Operation)

For a **10-second audio recording**:
- Frontend upload: ~1-2 seconds
- File save to disk: <1 second
- AssemblyAI upload: ~2-3 seconds
- AssemblyAI transcription: ~3-5 seconds
- **Total: 7-11 seconds**

For a **30-second audio recording**:
- Frontend upload: ~2-4 seconds
- File save to disk: <1 second
- AssemblyAI upload: ~3-5 seconds
- AssemblyAI transcription: ~8-15 seconds
- **Total: 14-25 seconds**

If it takes **longer than these estimates**:
- Check network speed
- Check audio file size
- Check AssemblyAI API status

---

## Testing Checklist

Before reporting the issue, verify:

- [ ] Backend server is running (`npm start`)
- [ ] You see `✅ AssemblyAI client initialized` on startup
- [ ] `.env` has valid `ASSEMBLYAI_API_KEY`
- [ ] Directory `uploads/audio/` exists
- [ ] API URL in `api.js` matches your setup (localhost for iOS, IP for Android)
- [ ] Network connection is stable
- [ ] AssemblyAI usage is under 5 hours/month free tier

---

## Quick Fix: Increase Timeout Further

If AssemblyAI is just slow but working, increase timeout even more:

**File**: `mobile-chat-app/services/api.js`
**Line**: `timeout: 90000`
**Change to**: `timeout: 120000` (2 minutes)

---

## What to Share When Reporting

Copy the **full log output** from your terminal, including:
1. Backend startup logs
2. All logs with `[FRONTEND]`, `[BACKEND]`, `[MULTER]`, `[GEMINI SERVICE]`, `[SPEECH SERVICE]` prefixes
3. The exact point where logs stop appearing
4. Any error messages

This will help identify exactly where the timeout is occurring.
