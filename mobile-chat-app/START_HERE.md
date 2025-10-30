# 🚀 START HERE - Skin Study Mobile App

Welcome! This guide will help you get the AI Dermatologist mobile app running on your device.

## 📋 What You're Building

A React Native Expo mobile app featuring:
- ✅ AI-powered dermatologist chat
- ✅ Real-time skincare advice
- ✅ Markdown-formatted responses
- ✅ Persistent chat history
- ✅ Works on iOS & Android

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
cd mobile-app
npm install
```

**Wait for installation to complete** (~2-3 minutes)

### Step 2: Configure Backend Connection

Open `services/api.js` and check the API URL:

**For iOS Simulator:**
```javascript
const API_BASE_URL = 'http://localhost:3004/api';
```

**For Android Emulator:**
```javascript
const API_BASE_URL = 'http://10.0.2.2:3004/api';
```

**For Physical Device:**
1. Find your computer's IP address:
   - Mac: Open Terminal → `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - Windows: Open CMD → `ipconfig`
2. Update the URL:
   ```javascript
   const API_BASE_URL = 'http://YOUR_IP:3004/api';
   // Example: 'http://192.168.1.100:3004/api'
   ```

### Step 3: Start Backend Server

Open a **new terminal window**:

```bash
cd backend
npm start
```

Keep this running!

### Step 4: Start Mobile App

In your mobile-app terminal:

```bash
npm start
```

### Step 5: Run the App

Choose your platform:

**iOS Simulator** (Mac only):
- Press `i` in terminal

**Android Emulator**:
- Press `a` in terminal

**Physical Device**:
- Install "Expo Go" app from App/Play Store
- Scan the QR code shown in terminal

## 🎉 You're Done!

The app should now open with the AI Dermatologist interface!

## 🧪 Test It Out

1. **Try a sample question** from the welcome screen
2. **Ask your own question** about skincare
3. **Check the chat history** persists when you reopen the app

## ❓ Something Not Working?

### "Cannot connect to backend"

1. ✅ Is backend running? Check the backend terminal
2. ✅ Is the API_BASE_URL correct in `services/api.js`?
3. ✅ Can you access `http://localhost:3004/api` in browser?

**For Android Emulator specifically:**
- Must use `http://10.0.2.2:3004/api` (not localhost)

**For Physical Device:**
- Device must be on same WiFi as your computer
- Check firewall isn't blocking port 3004

### "App won't start"

Clear cache and restart:
```bash
expo start -c
```

### "Missing dependencies"

Reinstall:
```bash
rm -rf node_modules
npm install
```

## 📱 Features to Try

### Welcome Screen
- Interactive sample questions
- Capability showcase
- Clean, modern design

### Chat Interface
- Send skincare questions
- Receive markdown-formatted answers
- Auto-scrolling messages
- Typing indicators

### Chat Management
- "New Chat" - Start fresh conversation
- "Clear Chat" - Delete all history
- Persistent storage across app restarts

## 🎨 Customization

### Change Colors
Edit `components/AIDermatologist.styles.js`:
```javascript
const colors = {
  primary500: '#6366F1',  // Change main color
  primary50: '#EEF2FF',   // Change background
  // ... more colors
};
```

### Change App Name
Edit `app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug"
  }
}
```

## 📚 Next Steps

Once everything works:

1. **Explore the code:**
   - `App.js` - Main app setup
   - `components/AIDermatologist.js` - Chat screen
   - `services/api.js` - Backend communication

2. **Customize the UI:**
   - Adjust colors in styles file
   - Modify welcome message
   - Add your own sample questions

3. **Build for production:**
   - See README.md for build instructions
   - Configure app icons and splash screen
   - Set up proper environment variables

## 🔗 Important Files

- `App.js` - Navigation setup
- `components/AIDermatologist.js` - Main chat screen
- `components/AIDermatologist.styles.js` - All styles
- `services/api.js` - API client
- `config/API_CONFIG.md` - Detailed API setup
- `README.md` - Full documentation

## 💡 Tips

1. **Keep backend running** while testing mobile app
2. **Use Expo Go** on physical device for fastest testing
3. **Check logs** in terminal for debugging
4. **Hot reload** works - save files to see changes instantly

## 🆘 Need Help?

1. Check `README.md` for detailed documentation
2. Review `config/API_CONFIG.md` for API setup
3. Look at backend logs for errors
4. Verify network connectivity

## ✨ What Makes This Special

This mobile app is a **complete recreation** of the web app's AI Dermatologist feature:

- ✅ **Same functionality** - All chat features work identically
- ✅ **Same styling** - Colors, layout, and design match perfectly
- ✅ **Same responses** - Uses the same backend API
- ✅ **Better UX** - Optimized for mobile with native components

The code is clean, well-commented, and easy to understand. Perfect for learning React Native!

---

**Ready to start?** Run `npm install` and follow the steps above! 🚀
