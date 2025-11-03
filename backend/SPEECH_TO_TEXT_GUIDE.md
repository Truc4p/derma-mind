# Speech-to-Text Integration Guide

## Current Status
✅ Live voice chat UI is working
✅ Audio recording is working  
✅ AI response and text-to-speech is working
⚠️ Audio transcription currently uses fallback (manual input)

## Why Manual Fallback?
Gemini API's audio transcription support is limited and may not be available in all API tiers. For production-grade speech-to-text, we recommend using Google Cloud Speech-to-Text API.

## Option 1: Google Cloud Speech-to-Text (Recommended)

### Step 1: Enable the API
```bash
# Install Google Cloud Speech client
npm install @google-cloud/speech
```

### Step 2: Set up credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Cloud Speech-to-Text API"
3. Create a service account key
4. Download the JSON key file
5. Add to `.env`:
```
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

### Step 3: Create Speech Service
Create `backend/services/speechService.js`:

```javascript
const speech = require('@google-cloud/speech');
const fs = require('fs').promises;

class SpeechService {
    constructor() {
        this.client = new speech.SpeechClient();
    }

    async transcribeAudio(audioFilePath) {
        try {
            const audioBytes = await fs.readFile(audioFilePath);
            
            const audio = {
                content: audioBytes.toString('base64'),
            };
            
            const config = {
                encoding: 'MP4',
                sampleRateHertz: 16000,
                languageCode: 'en-US',
                model: 'default',
                useEnhanced: true,
            };
            
            const request = {
                audio: audio,
                config: config,
            };
            
            const [response] = await this.client.recognize(request);
            const transcription = response.results
                .map(result => result.alternatives[0].transcript)
                .join(' ');
            
            return transcription;
        } catch (error) {
            console.error('Speech-to-Text error:', error);
            throw error;
        }
    }
}

module.exports = new SpeechService();
```

### Step 4: Update geminiService.js
```javascript
const speechService = require('./speechService');

async transcribeAudio(audioFilePath) {
    try {
        // Use Google Cloud Speech-to-Text
        const transcription = await speechService.transcribeAudio(audioFilePath);
        console.log('✅ Transcription:', transcription);
        return transcription;
    } catch (error) {
        console.error('❌ Transcription failed:', error);
        throw new Error('TRANSCRIPTION_NOT_AVAILABLE');
    }
}
```

## Option 2: Alternative APIs

### Assembly AI (Simple & Good)
```bash
npm install assemblyai
```

```javascript
const { AssemblyAI } = require('assemblyai');

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY
});

const transcript = await client.transcripts.transcribe({
  audio_url: audioFileUrl
});
```

### Whisper API (OpenAI)
```bash
npm install openai
```

```javascript
const OpenAI = require('openai');
const openai = new OpenAI();

const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream(audioFilePath),
  model: "whisper-1",
});
```

## Option 3: Wait for Gemini Audio Support
Gemini's audio transcription is in development. Check:
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- Current model: `gemini-1.5-pro-latest` or `gemini-1.5-flash-latest`

## Testing Current Implementation

1. **Start backend**: `npm start` in `backend/`
2. **Start mobile app**: `npm start` in `mobile-chat-app/`
3. **Test Live Chat**:
   - Tap "Go Live with AI"
   - Tap mic button to record
   - Release to stop
   - Type your question in the prompt
   - AI responds with voice

## Cost Comparison

| Service | Free Tier | Paid Pricing |
|---------|-----------|--------------|
| Google Cloud Speech-to-Text | 60 min/month | $0.006/15 sec |
| AssemblyAI | 5 hours | $0.00025/sec |
| Whisper (OpenAI) | None | $0.006/min |
| Gemini Audio | TBD | Included in API |

## Next Steps

1. Choose a speech-to-text provider
2. Install the SDK
3. Add API credentials
4. Update `geminiService.transcribeAudio()`
5. Remove the manual input fallback
6. Test end-to-end

## Current Behavior

- ✅ Records audio successfully
- ✅ Uploads to backend
- ⚠️ Falls back to manual text input
- ✅ AI processes and responds
- ✅ Response is spoken back

The app is fully functional with manual transcription as a temporary workaround!
