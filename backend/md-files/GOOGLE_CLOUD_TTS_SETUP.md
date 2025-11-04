# Google Cloud Text-to-Speech Setup Guide

This guide will help you set up Google Cloud Text-to-Speech API to enable natural, high-quality voice synthesis in your app.

## Why Google Cloud TTS?

- **Natural Neural Voices**: Same technology used in Google Assistant and Gemini
- **WaveNet & Neural2 Models**: Ultra-realistic speech synthesis
- **Multiple Voice Options**: Various accents, genders, and speaking styles
- **Cost Effective**: $4-16 per 1 million characters (free tier: 1 million/month)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Note your Project ID

## Step 2: Enable Text-to-Speech API

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Cloud Text-to-Speech API"
3. Click **Enable**

## Step 3: Create Service Account

1. Go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Name it: `tts-service-account`
4. Grant role: **Cloud Text-to-Speech User**
5. Click **Done**

## Step 4: Generate Credentials

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** → **Create New Key**
4. Choose **JSON** format
5. Download the key file (e.g., `tts-credentials.json`)

## Step 5: Set Up Credentials in Your Project

### Option A: Environment Variable (Recommended for Production)

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/tts-credentials.json"
```

Add to your `.env` file:
```env
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/tts-credentials.json
```

### Option B: Place in Project Directory (Development)

1. Create a `credentials` folder in backend:
   ```bash
   mkdir -p backend/credentials
   ```

2. Move your credentials file:
   ```bash
   mv ~/Downloads/tts-credentials.json backend/credentials/
   ```

3. Update `.env`:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./credentials/tts-credentials.json
   ```

4. **IMPORTANT**: Add to `.gitignore`:
   ```
   credentials/
   *.json
   !package*.json
   ```

## Step 6: Install NPM Package

```bash
cd backend
npm install @google-cloud/text-to-speech
```

## Step 7: Test the Setup

Create a test file `backend/test-tts.js`:

```javascript
const ttsService = require('./services/ttsService');
const path = require('path');

async function test() {
    try {
        const text = "Hello! I'm using Google Cloud Text-to-Speech with natural neural voices.";
        const outputPath = path.join(__dirname, 'test-output.mp3');
        
        console.log('Testing Google Cloud TTS...');
        await ttsService.textToSpeech(text, outputPath);
        console.log('✅ Success! Check test-output.mp3');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

test();
```

Run the test:
```bash
node backend/test-tts.js
```

## Step 8: Available Voice Options

You can customize the voice in `backend/services/ttsService.js`:

### Neural2 Voices (Best Quality - Recommended)

**Female Voices:**
- `en-US-Neural2-C` - Conversational, friendly
- `en-US-Neural2-E` - Warm, approachable
- `en-US-Neural2-F` - Professional, clear (default)
- `en-US-Neural2-G` - Youthful, energetic
- `en-US-Neural2-H` - Mature, authoritative

**Male Voices:**
- `en-US-Neural2-A` - Conversational, natural
- `en-US-Neural2-D` - Professional, clear
- `en-US-Neural2-I` - Warm, friendly
- `en-US-Neural2-J` - Young, casual

### WaveNet Voices (High Quality)

- `en-US-Wavenet-A` to `en-US-Wavenet-J`

## Step 9: Cost Estimation

**Pricing Tiers:**
- Standard voices: $4 per 1M characters
- WaveNet voices: $16 per 1M characters
- Neural2 voices: $16 per 1M characters

**Free Tier:**
- 1 million characters per month (all voice types)

**Typical Usage:**
- Average response: 500 characters
- Free tier: ~2,000 responses/month
- 10,000 responses: ~$160/month (Neural2)

## Step 10: Optimization Tips

### 1. Cache Common Responses
```javascript
// Cache frequently used responses
const responseCache = new Map();

async function getCachedTTS(text) {
    if (responseCache.has(text)) {
        return responseCache.get(text);
    }
    const audio = await ttsService.textToSpeech(text, outputPath);
    responseCache.set(text, audio);
    return audio;
}
```

### 2. Implement Character Limits
```javascript
const MAX_TTS_LENGTH = 5000; // characters
if (text.length > MAX_TTS_LENGTH) {
    text = text.substring(0, MAX_TTS_LENGTH) + '...';
}
```

### 3. Use Fallback to Device TTS
The current implementation already falls back to device TTS if Google Cloud fails.

## Troubleshooting

### Error: "Could not load the default credentials"
- Check `GOOGLE_APPLICATION_CREDENTIALS` path
- Ensure the JSON file exists and is valid
- Use absolute path, not relative

### Error: "API has not been enabled"
- Enable Cloud Text-to-Speech API in Google Cloud Console
- Wait a few minutes for propagation

### Error: "Permission denied"
- Ensure service account has "Cloud Text-to-Speech User" role
- Regenerate credentials if needed

### Error: "Quota exceeded"
- Check your billing in Google Cloud Console
- Free tier: 1M characters/month
- Enable billing for higher limits

## Alternative Options

If Google Cloud TTS is too expensive or complex:

### 1. **ElevenLabs** (Best Quality)
- Ultra-realistic voices
- $5/month for 30,000 characters
- $22/month for 100,000 characters
- API: https://elevenlabs.io/

### 2. **OpenAI TTS**
- Very natural voices (tts-1, tts-1-hd)
- $15 per 1M characters
- Easy integration
- API: https://platform.openai.com/docs/guides/text-to-speech

### 3. **Azure Cognitive Services**
- Neural voices similar to Google
- $16 per 1M characters
- 500,000 characters/month free

### 4. **Device TTS** (Free, Current Fallback)
- No cost
- Lower quality
- Works offline
- Already implemented

## Next Steps

1. ✅ Set up Google Cloud credentials
2. ✅ Test the TTS service
3. ✅ Configure your preferred voice
4. ✅ Monitor usage and costs
5. ✅ Implement caching if needed

## Resources

- [Google Cloud TTS Documentation](https://cloud.google.com/text-to-speech/docs)
- [Voice Samples](https://cloud.google.com/text-to-speech/docs/voices)
- [Pricing Calculator](https://cloud.google.com/products/calculator)
- [SSML Guide](https://cloud.google.com/text-to-speech/docs/ssml) (Advanced voice control)
