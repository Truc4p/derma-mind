# AssemblyAI Setup Guide

This guide will help you set up **AssemblyAI** for automatic speech-to-text transcription in the Live Chat feature.

## ✅ Why AssemblyAI?

- **100% FREE**: 5 hours of transcription per month
- **No Credit Card Required**: Sign up with just an email
- **No Billing Account Needed**: Unlike Google Cloud Speech-to-Text
- **High Accuracy**: Industry-leading speech recognition
- **Easy Setup**: Just add one API key to your `.env` file

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Your Free API Key

1. Go to **[AssemblyAI.com](https://www.assemblyai.com/)**
2. Click **"Start building for free"** or **"Sign Up"**
3. Sign up with your email (no credit card needed)
4. After signing in, you'll see your **API Key** on the dashboard
5. Copy your API key (it starts with something like `axxxx...`)

### Step 2: Add API Key to Your Project

1. Open `/Users/phamthanhtruc/Downloads/uni/FYP-c1682/skin-study/backend/.env`
2. Find this line:
   ```
   ASSEMBLYAI_API_KEY=your-assemblyai-api-key-here
   ```
3. Replace `your-assemblyai-api-key-here` with your actual API key:
   ```
   ASSEMBLYAI_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```
4. Save the file

### Step 3: Restart Your Backend Server

1. Stop your backend server (press `Ctrl+C` in the terminal)
2. Start it again:
   ```bash
   cd /Users/phamthanhtruc/Downloads/uni/FYP-c1682/skin-study/backend
   npm start
   ```
3. You should see: `✅ AssemblyAI client initialized`

---

## 🧪 Testing

1. Open your mobile app
2. Navigate to **"Go Live with AI"**
3. Tap the microphone button to start recording
4. Speak something (e.g., "What's a good skincare routine?")
5. Tap stop recording
6. The app will automatically transcribe your speech and send it to the AI!

---

## 📊 Usage Limits

### Free Tier (No Credit Card Required)
- **5 hours/month** of transcription
- Perfect for testing and personal projects
- Resets every month automatically

### How Long Is 5 Hours?
- **30-second recordings**: ~600 recordings/month
- **1-minute recordings**: ~300 recordings/month
- **2-minute recordings**: ~150 recordings/month

For a dermatology chat app, this is **more than enough** for development and personal use!

---

## 🔍 Checking Your Usage

1. Go to [AssemblyAI Dashboard](https://www.assemblyai.com/app)
2. Sign in
3. Click on **"Usage"** in the sidebar
4. You'll see:
   - Total transcription time used this month
   - How much time remaining
   - Usage history

---

## ❓ Troubleshooting

### "⚠️ ASSEMBLYAI_API_KEY not found"

**Problem**: The backend can't find your API key.

**Solution**:
1. Check that your `.env` file has the line:
   ```
   ASSEMBLYAI_API_KEY=your-actual-api-key
   ```
2. Make sure there are no spaces around the `=` sign
3. Make sure the API key doesn't have quotes around it
4. Restart your backend server

### "❌ AssemblyAI transcription error"

**Problem**: Your API key might be invalid or you've exceeded the free tier.

**Solution**:
1. Go to [AssemblyAI Dashboard](https://www.assemblyai.com/app)
2. Check if your API key is correct
3. Check your usage - make sure you haven't exceeded 5 hours this month
4. Try regenerating a new API key if needed

### Backend still using manual input?

**Problem**: The backend falls back to manual input if transcription fails.

**Solution**:
1. Check backend logs for error messages
2. Make sure you see: `✅ AssemblyAI client initialized` when starting
3. If you see `⚠️ ASSEMBLYAI_API_KEY not found`, follow Step 2 above
4. Make sure your internet connection is stable

---

## 🆚 Comparison with Google Cloud

| Feature | AssemblyAI (FREE) | Google Cloud |
|---------|-------------------|--------------|
| **Free Tier** | 5 hours/month | 60 minutes/month |
| **Credit Card** | ❌ Not Required | ✅ Required |
| **Billing Account** | ❌ Not Required | ✅ Required |
| **Setup Complexity** | Simple (1 API key) | Complex (service account, JSON key) |
| **Accuracy** | High | High |
| **Best For** | Students, personal projects | Enterprise, production apps |

---

## 🎓 For Production Use

If you need more than 5 hours/month:

### Option 1: Upgrade AssemblyAI (Pay As You Go)
- **$0.00025 per second** = ~$0.015 per minute
- **No monthly fees**, only pay for what you use
- Add credit card to upgrade

### Option 2: Keep Manual Input
- Current fallback system works perfectly
- No API limits
- User types what they said
- 100% reliable

---

## 📚 Documentation

- [AssemblyAI Official Docs](https://www.assemblyai.com/docs)
- [Node.js SDK Documentation](https://www.assemblyai.com/docs/getting-started/transcribe-an-audio-file)
- [Supported Audio Formats](https://www.assemblyai.com/docs/concepts/supported-audio-formats)

---

## ✨ Summary

1. **Sign up** at [AssemblyAI.com](https://www.assemblyai.com/) (free, no credit card)
2. **Copy** your API key from the dashboard
3. **Add** it to `backend/.env`:
   ```
   ASSEMBLYAI_API_KEY=your-actual-api-key
   ```
4. **Restart** your backend server
5. **Test** the Live Chat feature - speech should now transcribe automatically!

---

**Need help?** Check the troubleshooting section above or review the backend logs for detailed error messages.
