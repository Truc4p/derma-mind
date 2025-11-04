# gTTS Setup Guide

## What is gTTS?

**gTTS (Google Text-to-Speech)** is a free Python/Node.js library that interfaces with Google Translate's text-to-speech API.

### Key Features
- ✅ **100% FREE** - No billing account required
- ✅ **No API keys** - No authentication needed
- ✅ **100+ languages** supported
- ✅ **Better quality** than device TTS
- ✅ **Easy setup** - Just `npm install`

### Limitations
- ❌ Not as natural as Google Cloud Neural2 voices
- ❌ Requires internet connection
- ❌ Limited voice customization (no pitch/speed control)
- ❌ No official SLA or support

## Installation

### 1. Install Package

```bash
cd backend
npm install node-gtts
```

That's it! No other setup required.

### 2. Verify Installation

```bash
npm list node-gtts
```

Should output:
```
skin-study-backend@1.0.0 /path/to/backend
└── node-gtts@2.0.2
```

## Testing

### Quick Test

```bash
cd backend
node -e "const gtts = require('node-gtts')('en'); gtts.save('test.mp3', 'Hello, this is a test of Google Text to Speech', (err) => { if (err) console.error(err); else console.log('✅ Audio saved to test.mp3'); });"
```

This creates `test.mp3` - play it to verify it works!

### Test with Service

Create `backend/test-gtts.js`:

```javascript
const ttsService = require('./services/ttsService');

async function test() {
    try {
        console.log('🔊 Testing gTTS service...');
        
        const text = "Hello! I am your AI dermatologist. How can I help you with your skincare concerns today?";
        const outputPath = './test-output.mp3';
        
        await ttsService.textToSpeech(text, outputPath);
        
        console.log('✅ Success! Audio saved to:', outputPath);
        console.log('🎵 Play the file to hear the voice quality.');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

test();
```

Run it:
```bash
node test-gtts.js
```

## Usage in Code

### Basic Usage

```javascript
const gtts = require('node-gtts')('en'); // 'en' for English

gtts.save('output.mp3', 'Text to convert', function (err) {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Success!');
    }
});
```

### With Promises

```javascript
const gtts = require('node-gtts')('en');
const util = require('util');

const save = util.promisify(gtts.save.bind(gtts));

async function textToSpeech(text, outputPath) {
    await save(outputPath, text);
}
```

### Multiple Languages

```javascript
// English
const gtts_en = require('node-gtts')('en');

// Spanish
const gtts_es = require('node-gtts')('es');

// French
const gtts_fr = require('node-gtts')('fr');
```

## Supported Languages

Common languages:

| Code | Language | Code | Language |
|------|----------|------|----------|
| `en` | English | `es` | Spanish |
| `fr` | French | `de` | German |
| `it` | Italian | `pt` | Portuguese |
| `ja` | Japanese | `ko` | Korean |
| `zh` | Chinese | `ar` | Arabic |
| `hi` | Hindi | `ru` | Russian |
| `nl` | Dutch | `pl` | Polish |
| `tr` | Turkish | `vi` | Vietnamese |

[Full list of 100+ languages](https://gtts.readthedocs.io/en/latest/module.html#languages-gtts-lang)

## Integration with Your App

### Backend Service

Already implemented in `backend/services/ttsService.js`:

```javascript
const gtts = require('node-gtts')('en');

class TTSService {
    async textToSpeech(text, outputPath) {
        return new Promise((resolve, reject) => {
            gtts.save(outputPath, text, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}
```

### API Endpoint

Already implemented in `backend/controllers/aiDermatologistController.js`:

```javascript
exports.textToSpeech = async (req, res) => {
    const { text } = req.body;
    const outputPath = `./uploads/audio/tts-${Date.now()}.mp3`;
    
    await ttsService.textToSpeech(text, outputPath);
    
    const audioBuffer = await fs.readFile(outputPath);
    const audioBase64 = audioBuffer.toString('base64');
    
    res.json({ audio: audioBase64, format: 'mp3' });
};
```

### Mobile App

Update `mobile-chat-app/components/LiveChatAI.js` to use the endpoint:

```javascript
const speakAIResponse = async (text) => {
    try {
        // Try gTTS from backend
        const response = await fetch('http://YOUR_IP:3004/api/ai-dermatologist/text-to-speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        
        const { audio } = await response.json();
        
        // Play the audio
        const sound = new Audio.Sound();
        await sound.loadAsync({
            uri: `data:audio/mp3;base64,${audio}`
        });
        await sound.playAsync();
    } catch (error) {
        // Fallback to device TTS
        Speech.speak(text);
    }
};
```

## Comparison: gTTS vs Others

| Feature | gTTS | Device TTS | Google Cloud | ElevenLabs |
|---------|------|------------|--------------|------------|
| **Cost** | **FREE** | Free | $16/1M | $5/mo |
| **Setup** | 1 min | 0 min | 30+ min | 10 min |
| **Quality** | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Naturalness** | Good | Poor | Excellent | Best |
| **Billing** | None | None | Required | Required |
| **Offline** | ❌ | ✅ | ❌ | ❌ |

## Troubleshooting

### Issue: Module Not Found

```bash
npm install node-gtts
```

### Issue: Network Error

gTTS requires internet connection. Check:
- Internet connectivity
- Firewall settings
- Proxy configuration

### Issue: Audio Not Generated

Check:
1. Write permissions in output directory
2. Disk space
3. Text is not empty
4. Network is available

### Issue: Poor Audio Quality

gTTS quality is limited by Google Translate's TTS. If you need better quality:
- Upgrade to Google Cloud TTS (requires billing)
- Try ElevenLabs or OpenAI TTS
- Use shorter sentences for better clarity

## Performance Tips

### 1. Keep Text Short
```javascript
// Better: Split long text into sentences
const sentences = text.split('. ');
for (const sentence of sentences) {
    await textToSpeech(sentence, `output-${i}.mp3`);
}
```

### 2. Cache Common Phrases
```javascript
const cache = new Map();

async function cachedTTS(text, outputPath) {
    if (cache.has(text)) {
        return cache.get(text);
    }
    await ttsService.textToSpeech(text, outputPath);
    cache.set(text, outputPath);
}
```

### 3. Handle Errors Gracefully
```javascript
try {
    await ttsService.textToSpeech(text, outputPath);
} catch (error) {
    // Fallback to device TTS
    Speech.speak(text);
}
```

## Upgrading to Premium TTS

If you need better quality later, it's easy to swap:

### Option 1: Google Cloud TTS
```bash
npm install @google-cloud/text-to-speech
```

### Option 2: ElevenLabs
```bash
npm install elevenlabs-node
```

### Option 3: OpenAI TTS
```bash
npm install openai
```

Just update `services/ttsService.js` - the rest of your code stays the same!

## FAQ

### Q: Is gTTS legal to use?
**A:** Yes, it uses Google Translate's public API, same as the website.

### Q: Are there rate limits?
**A:** No official limits, but don't abuse it. For high-volume apps, use Google Cloud TTS.

### Q: Can I use it offline?
**A:** No, it requires internet. The app falls back to device TTS when offline.

### Q: How's the voice quality?
**A:** Better than device TTS, but not as good as premium services. Good enough for most use cases.

### Q: Can I change voice gender?
**A:** No, gTTS uses Google Translate's default voice. For voice control, use Google Cloud TTS.

### Q: Does it support SSML?
**A:** No, only plain text. For SSML (Speech Synthesis Markup Language), use Google Cloud TTS.

## Next Steps

1. ✅ Install: `npm install node-gtts`
2. ✅ Test: `node test-gtts.js`
3. ✅ Run backend: `npm start`
4. ✅ Test in mobile app
5. ✅ Collect user feedback

## Resources

- [node-gtts NPM](https://www.npmjs.com/package/node-gtts)
- [gTTS Python Docs](https://gtts.readthedocs.io/)
- [Implementation Guide](./TTS_IMPLEMENTATION.md)
