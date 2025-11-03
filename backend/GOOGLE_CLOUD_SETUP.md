# Google Cloud Speech-to-Text Setup

## Quick Setup (5 minutes)

### Step 1: Enable the API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Go to "APIs & Services" → "Library"
4. Search for "Cloud Speech-to-Text API"
5. Click "Enable"

### Step 2: Create Service Account

1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Name: `speech-to-text-service`
4. Click "Create and Continue"
5. Role: Select "Cloud Speech-to-Text → Speech-to-Text Client"
6. Click "Continue" → "Done"

### Step 3: Generate Key

1. Find your new service account in the list
2. Click the three dots (⋮) → "Manage keys"
3. Click "Add Key" → "Create new key"
4. Select "JSON" → Click "Create"
5. **Save the downloaded JSON file** (e.g., `speech-key.json`)

### Step 4: Configure Backend

1. Move the JSON key file to your backend folder:
   ```bash
   mv ~/Downloads/speech-key.json /Users/phamthanhtruc/Downloads/uni/FYP-c1682/skin-study/backend/
   ```

2. Add to `.env`:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./speech-key.json
   ```

3. Or set environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/speech-key.json"
   ```

### Step 5: Add to .gitignore

Make sure your key file is NOT committed to git:
```bash
echo "speech-key.json" >> .gitignore
echo "*.json" >> .gitignore
```

### Step 6: Restart Backend

```bash
cd backend
npm start
```

## Testing

1. Start your mobile app
2. Go to "Go Live with AI"
3. Tap mic and speak
4. Release mic
5. ✅ Speech should be automatically transcribed!

## Pricing

- **Free Tier**: 60 minutes/month
- **Paid**: $0.006 per 15 seconds ($0.024/minute)
- Standard model is sufficient for most use cases

## Troubleshooting

### Error: "Could not load the default credentials"

**Solution**: Make sure `GOOGLE_APPLICATION_CREDENTIALS` is set correctly:
```bash
# Check if env variable is set
echo $GOOGLE_APPLICATION_CREDENTIALS

# Set it manually
export GOOGLE_APPLICATION_CREDENTIALS="/full/path/to/speech-key.json"
```

### Error: "GOOGLE_CLOUD_AUTH_MISSING"

**Solution**: The credentials file is not found or invalid. Check:
1. File exists at the specified path
2. File is valid JSON
3. Service account has correct permissions

### Still getting manual input prompt?

**Solution**: Check backend logs for errors:
```bash
# Look for these messages:
🎤 Starting audio transcription
✅ Google Cloud transcription: [your text]
```

If you see:
```
⚠️ Google Cloud error: ...
```

Then check the error message for details.

## What's Installed

- `@google-cloud/speech` - Google Cloud Speech-to-Text SDK
- `speechService.js` - Speech transcription service
- Updated `geminiService.js` - Now uses Google Cloud Speech

## Alternative: Use Existing Google Cloud Project

If you already have a Google Cloud project with billing enabled:

1. Enable Speech-to-Text API (Step 1 above)
2. Use existing service account or create new one
3. Download key and configure as above

That's it! 🎉
