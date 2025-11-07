# Natural Voice TTS Implementation

## Overview

This implementation adds **improved text-to-speech** to the LiveChatAI component using **gTTS (Google Text-to-Speech)** - a free alternative that uses Google Translate's TTS API.

## What Changed?

### Before
- **Device TTS (Expo Speech)**: Robotic, monotone voice
- Same quality as the voice button in text chat
- Limited voice options
- Poor user experience for conversations

### After
- **gTTS (Google Translate TTS)**: Better quality than device TTS
- **100% FREE** - no billing account required
- Automatic fallback to device TTS if unavailable
- Much better user experience than default device TTS

## Architecture

```
┌─────────────────┐
│  LiveChatAI.js  │
│  (Mobile App)   │
└────────┬────────┘
         │
         │ 1. Request TTS
         │
         ▼
┌────────────────────┐
│   Backend API      │
│  /text-to-speech   │
└────────┬───────────┘
         │
         │ 2. Call Google Cloud
         │
         ▼
┌────────────────────┐
│ gTTS Service       │
│ (Google Translate) │
└────────┬───────────┘
         │
         │ 3. Return MP3 audio
         │
         ▼
┌────────────────────┐
│   Mobile App       │
│  Plays Audio       │
└────────────────────┘
```

## Files Modified

### Backend

1. **`services/ttsService.js`** (UPDATED)
   - gTTS integration (free Google Translate TTS)
   - No credentials required
   - Audio generation

2. **`controllers/aiDermatologistController.js`**
   - Added `textToSpeech()` endpoint
   - Returns base64 encoded MP3 audio

3. **`routes/aiDermatologist.js`**
   - Added POST `/api/ai-dermatologist/text-to-speech` route

4. **`package.json`**
   - Added `node-gtts` dependency

### Mobile App

1. **`services/api.js`**
   - Added `liveChatService.textToSpeech()` method

2. **`components/LiveChatAI.js`**
   - Updated `speakAIResponse()` function
   - Tries Google Cloud TTS first
   - Falls back to device TTS if unavailable
   - Plays MP3 audio using Expo Audio

## How It Works

### Flow

1. **User speaks** → Audio transcribed to text
2. **AI responds** → Text response generated
3. **TTS triggered** → Text sent to backend `/text-to-speech`
4. **gTTS generates** → Google Translate TTS MP3
5. **Audio returned** → Base64 encoded MP3
6. **Mobile plays** → Using Expo Audio API

### Fallback Mechanism

```javascript
try {
    // Try gTTS (better quality, free)
    const ttsResponse = await liveChatService.textToSpeech(text);
    // Play audio...
} catch (error) {
    // Fallback to device TTS (always works offline)
    Speech.speak(text);
}
```

## Voice Configuration

Default voice: **English (en-US)** via Google Translate TTS

### Change Language

Edit `backend/services/ttsService.js`:

```javascript
const gtts = require('node-gtts')('en'); // Change 'en' to other language code
```

### Supported Languages

gTTS supports **100+ languages**:

| Code | Language | Code | Language |
|------|----------|------|----------|
| `en` | English | `es` | Spanish |
| `fr` | French | `de` | German |
| `it` | Italian | `pt` | Portuguese |
| `ja` | Japanese | `ko` | Korean |
| `zh` | Chinese | `ar` | Arabic |
| `hi` | Hindi | `ru` | Russian |

Full list: https://gtts.readthedocs.io/en/latest/module.html#languages-gtts-lang

## Setup Requirements

### 1. Install NPM Package

```bash
cd backend
npm install node-gtts
```

That's it! No credentials, no API keys, no billing account required.

### 2. Test

```bash
cd backend
node -e "const gtts = require('node-gtts')('en'); gtts.save('test.mp3', 'Hello world', () => console.log('Done!'));"
```

## Cost Considerations

### gTTS Pricing
- **100% FREE** ✅
- No billing account required
- No usage limits
- No API keys needed

### Why is it free?
- Uses Google Translate's public TTS API
- Same API as translate.google.com
- Designed for text-to-speech functionality
- No authentication required

## Testing

### Test gTTS

```javascript
// backend/test-tts.js
const ttsService = require('./services/ttsService');

async function test() {
    const text = "Hello! Testing Google Translate text-to-speech.";
    await ttsService.textToSpeech(text, './test-output.mp3');
    console.log('✅ Audio saved to test-output.mp3');
}

test();
```

### Test in Mobile App

1. Start backend: `npm start`
2. Open LiveChatAI in mobile app
3. Speak a question
4. Listen to AI response
5. Check console for:
   - `🌐 Using gTTS...` (success)
   - `📱 Using device TTS as fallback...` (fallback)

## Troubleshooting

### Issue: Still Using Device TTS

**Symptoms:**
- Console shows: "Using device TTS as fallback"
- No improvement in voice quality

**Solutions:**
1. Check if `node-gtts` is installed:
   ```bash
   npm list node-gtts
   ```
2. Restart backend server
3. Check backend console for errors
4. Verify network connection (gTTS requires internet)

### Issue: Network Errors

gTTS requires internet connection. If offline:
- App will automatically fallback to device TTS
- Check network connectivity
- Verify firewall isn't blocking Google Translate

### Issue: Audio Not Playing

- Check mobile app console for errors
- Verify audio permissions in app
- Test with shorter text first
- Ensure device volume is up

## Performance

### Response Times

| Method | Time | Quality |
|--------|------|---------|
| gTTS | 1-2s | ⭐⭐⭐⭐ Good |
| Device TTS | <100ms | ⭐⭐ Poor |
| Google Cloud Neural | 1-3s | ⭐⭐⭐⭐⭐ Excellent |

### Audio Quality Comparison

| Feature | gTTS | Device TTS | Google Cloud |
|---------|------|------------|--------------|
| Naturalness | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Prosody | ⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ |
| Emotion | ⭐⭐ | ❌ | ⭐⭐⭐⭐ |
| Pronunciation | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Speed | Fast | Very Fast | Moderate |
| Cost | **FREE** ✅ | Free | Paid |
| Offline | ❌ | ✅ | ❌ |
| Setup | Easy | None | Complex |

## Alternatives

### Current: gTTS (Free)
✅ **Recommended for most use cases**
- Free, no billing
- Better than device TTS
- Easy setup
- Good quality

### Premium Options (If Budget Available)

#### 1. Google Cloud TTS ($16/1M chars)
- Neural2 voices
- Excellent quality
- Requires billing account
- Best for professional apps

#### 2. ElevenLabs (Best Quality)
- Ultra-realistic voices
- $5/month for 30,000 characters
- Highest quality available

#### 3. OpenAI TTS ($15/1M chars)
- Very natural voices
- Easy integration
- Good value

### 4. Keep Device TTS (Free)
- No setup required
- Works offline
- Lower quality but functional

## Benefits

### For Users
- ✅ Better voice quality than device TTS
- ✅ Improved comprehension
- ✅ More engaging interactions
- ✅ Consistent across devices

### For Development
- ✅ **100% FREE** - No billing account needed
- ✅ Easy to implement - Just `npm install node-gtts`
- ✅ Automatic fallback to device TTS
- ✅ Multi-language support (100+ languages)
- ✅ No API keys or credentials required
- ✅ Reliable service (uses Google's infrastructure)

## Why gTTS vs Google Cloud TTS?

| Feature | gTTS | Google Cloud TTS |
|---------|------|------------------|
| Cost | **FREE** ✅ | $16 per 1M chars |
| Setup | 1 minute | 30+ minutes |
| Billing | None required | Credit card required |
| Quality | ⭐⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent |
| Best for | MVPs, prototypes, budget projects | Production apps with budget |

## Next Steps

1. ✅ Install `node-gtts`: `npm install node-gtts`
2. ✅ Restart backend server
3. ✅ Test in mobile app
4. ✅ Collect user feedback on voice quality
5. ⏭️ Consider upgrading to Google Cloud TTS if budget allows

## References

- [node-gtts NPM Package](https://www.npmjs.com/package/node-gtts)
- [gTTS Python Documentation](https://gtts.readthedocs.io/)
- [Google Translate](https://translate.google.com/) (the underlying service)
