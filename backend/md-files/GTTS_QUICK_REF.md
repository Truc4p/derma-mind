# gTTS Quick Reference

## Installation
```bash
npm install node-gtts --legacy-peer-deps
```

## Test
```bash
node test-gtts.js
```

## What Changed?

### Before
- Voice: Robotic device TTS (Expo Speech)
- Cost: Free
- Quality: ⭐⭐ Poor

### After
- Voice: Google Translate TTS (gTTS)
- Cost: **Still FREE!** 🎉
- Quality: ⭐⭐⭐⭐ Good

## Why Better?

✅ No billing account needed (unlike Google Cloud TTS)
✅ Better voice quality than device TTS
✅ Works with existing code
✅ Automatic fallback

## How to Use

### Already working! Just restart backend:
```bash
cd backend
npm start
```

### Your mobile app will automatically use better voice!

## Code Location

- **Service:** `backend/services/ttsService.js`
- **Endpoint:** `POST /api/ai-dermatologist/text-to-speech`
- **Test:** `backend/test-gtts.js`

## Voice Quality Comparison

| Method | Quality | Cost | Setup |
|--------|---------|------|-------|
| Device TTS | Poor ⭐⭐ | Free | 0 min |
| **gTTS** | **Good ⭐⭐⭐⭐** | **FREE** | **1 min** |
| Google Cloud | Excellent ⭐⭐⭐⭐⭐ | $16/1M | 30+ min |
| Gemini Live | Best ⭐⭐⭐⭐⭐ | ? | Complex |

## Docs

- 📘 Full Setup: `GTTS_SETUP.md`
- 📗 Implementation: `TTS_IMPLEMENTATION.md`
- 📙 Summary: `GTTS_IMPLEMENTATION_SUMMARY.md`

## Quick Test

```bash
node -e "const gtts = require('node-gtts')('en'); gtts.save('hi.mp3', 'Hello world', () => console.log('Done'));"
afplay hi.mp3
```

## Next Steps

1. ✅ Installed - `node-gtts` is ready
2. ✅ Tested - Works perfectly
3. 🚀 **Just restart backend and test in mobile app!**

---

**TL;DR:** You now have free, better TTS. Just restart backend!
