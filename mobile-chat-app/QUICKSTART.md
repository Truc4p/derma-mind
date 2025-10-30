# 📱 Skin Study Mobile App - Quick Start Guide

## What You Need to Know

This is a React Native Expo mobile app that brings the **AI Dermatologist** feature from the web app to iOS and Android devices.

## ✅ What's Included

- **AI Dermatologist Chat** - Full-featured chat interface with AI responses
- **Markdown Rendering** - Rich text formatting in messages
- **Chat History** - Persistent storage of conversations
- **Offline Fallback** - Context-aware responses when backend is unavailable
- **Modern UI** - Beautiful design matching the web application
- **Cross-Platform** - Works on both iOS and Android

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd mobile-app
npm install
```

### 2. Configure Backend URL

Edit `services/api.js` and update the API URL:

```javascript
// For iOS Simulator
const API_BASE_URL = 'http://localhost:3004/api';

// For Android Emulator
const API_BASE_URL = 'http://10.0.2.2:3004/api';

// For Physical Device (replace with your computer's IP)
const API_BASE_URL = 'http://192.168.1.100:3004/api';
```

See `config/API_CONFIG.md` for detailed configuration.

### 3. Start Backend Server

In a separate terminal:

```bash
cd backend
npm start
```

### 4. Start Mobile App

```bash
npm start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app for physical device

## 📱 Features Comparison

| Feature | Web (Vue) | Mobile (React Native) |
|---------|-----------|----------------------|
| AI Chat Interface | ✅ | ✅ |
| Markdown Support | ✅ | ✅ |
| Chat History | ✅ (localStorage) | ✅ (AsyncStorage) |
| Sample Questions | ✅ | ✅ |
| Typing Indicator | ✅ | ✅ |
| Message Timestamps | ✅ | ✅ |
| New Chat / Clear | ✅ | ✅ |
| Offline Fallback | ✅ | ✅ |
| Responsive Design | ✅ | ✅ (Native) |

## 📁 Project Structure

```
mobile-app/
├── App.js                          # Main app with navigation
├── components/
│   ├── AIDermatologist.js         # Chat screen component
│   └── AIDermatologist.styles.js  # All styling
├── services/
│   └── api.js                     # API client & storage
├── config/
│   └── API_CONFIG.md              # Configuration guide
├── assets/                        # Icons & images
├── package.json                   # Dependencies
├── app.json                       # Expo configuration
└── START_HERE.md                  # This file
```

## 🎨 Styling

The app uses the same color palette as the web app:

- **Primary**: #6366F1 (Indigo)
- **Background**: #EEF2FF (Light Indigo)
- **Accent**: #4F46E5 (Dark Indigo)

All styles are in `components/AIDermatologist.styles.js` for easy customization.

## 🔧 Configuration

### API Endpoint

Update in `services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:3004/api';
```

### App Metadata

Update in `app.json`:
```json
{
  "expo": {
    "name": "Skin Study",
    "slug": "skin-study-mobile",
    "version": "1.0.0"
  }
}
```

## 🐛 Troubleshooting

### Cannot Connect to Backend

**iOS Simulator:**
- Use `http://localhost:3004/api`

**Android Emulator:**
- Use `http://10.0.2.2:3004/api` (special Android IP)

**Physical Device:**
- Use your computer's local IP
- Ensure device is on same WiFi network
- Check firewall settings

### App Won't Start

```bash
# Clear cache
expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Chat Not Working

1. Verify backend is running on port 3004
2. Test API in browser: `http://localhost:3004/api`
3. Check API_BASE_URL in `services/api.js`
4. Review console logs for errors

## 📚 Documentation

- **START_HERE.md** - This file (quick start)
- **README.md** - Complete documentation
- **config/API_CONFIG.md** - API configuration details
- **assets/README.md** - Asset guidelines

## 🎯 Key Components

### AIDermatologist.js
Main chat screen with:
- Welcome message with sample questions
- Message list with markdown rendering
- Text input with send button
- Chat management (new/clear)
- Loading states and error handling

### api.js
Backend communication:
- Axios instance with interceptors
- Chat API calls
- AsyncStorage for chat history
- Error handling

### AIDermatologist.styles.js
Complete styling:
- Component styles
- Markdown styles (assistant & user)
- Color palette
- Responsive layouts

## 💡 Development Tips

1. **Hot Reload**: Save files to see changes instantly
2. **Console Logs**: Check terminal for API requests/responses
3. **Network Tab**: Use React Native Debugger to inspect network
4. **Keep Backend Running**: Mobile app needs backend for AI responses

## 🚀 Next Steps

After getting it running:

1. **Test all features**:
   - Send messages
   - Try sample questions
   - Clear and restart chat
   - Close and reopen app (history persists)

2. **Customize**:
   - Change colors in styles file
   - Update welcome message
   - Add your own sample questions

3. **Build for production**:
   - See README.md for build instructions
   - Configure app icons and splash screen
   - Set up environment variables

## 📦 Scripts

```bash
npm start       # Start Expo dev server
npm run ios     # Run on iOS simulator
npm run android # Run on Android emulator
npm run web     # Run in web browser
```

## 🔗 Related Files

- Frontend AI Dermatologist: `../frontend/src/views/AIDermatologist.vue`
- Backend Controller: `../backend/controllers/aiDermatologistController.js`
- Backend Route: `../backend/routes/aiDermatologist.js`

## ✨ Implementation Highlights

This mobile app is a **faithful recreation** of the web app:

1. **Same Functionality**: All features from Vue component ported to React Native
2. **Same API**: Uses identical backend endpoints
3. **Same Design**: Colors, spacing, and layout match perfectly
4. **Better Performance**: Native components for smooth mobile experience
5. **Offline Support**: Fallback responses when backend unavailable

## 🆘 Need Help?

1. Check `README.md` for detailed documentation
2. Review `config/API_CONFIG.md` for API setup
3. See troubleshooting section above
4. Check backend logs for errors

---

**Ready to start?** Follow the getting started steps above! 🚀
