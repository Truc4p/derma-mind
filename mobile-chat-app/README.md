# Skin Study Mobile App - README

A React Native Expo mobile application featuring an AI-powered dermatologist assistant for skincare advice, cosmetic recommendations, and facial improvement tips.

## 🎯 Features

- **AI Dermatologist Chat**: Real-time conversation with AI dermatologist
- **Markdown Support**: Rich text formatting in responses
- **Chat History**: Persistent chat history using AsyncStorage
- **Offline Fallback**: Context-aware responses when backend is unavailable
- **Beautiful UI**: Modern design matching the web application
- **Cross-Platform**: Works on both iOS and Android

## 📱 Screenshots

The mobile app provides:
- Welcome screen with sample questions
- Interactive chat interface
- Markdown-formatted responses
- Chat management (new chat, clear history)
- Typing indicators and loading states

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Install dependencies:**
   ```bash
   cd mobile-app
   npm install
   ```

2. **Configure API endpoint:**
   - Open `services/api.js`
   - Update `API_BASE_URL` to match your backend:
     ```javascript
     const API_BASE_URL = 'http://localhost:3004/api'; // iOS Simulator
     // or
     const API_BASE_URL = 'http://10.0.2.2:3004/api'; // Android Emulator
     ```
   - See `config/API_CONFIG.md` for detailed configuration

3. **Start the backend server:**
   ```bash
   cd ../backend
   npm start
   ```

4. **Start the mobile app:**
   ```bash
   cd mobile-app
   npm start
   ```

5. **Run on your platform:**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on physical device

## 📁 Project Structure

```
mobile-app/
├── App.js                          # Main app component with navigation
├── components/
│   ├── AIDermatologist.js         # AI Dermatologist chat screen
│   └── AIDermatologist.styles.js  # Styles for the chat screen
├── services/
│   └── api.js                     # API client and chat storage
├── config/
│   └── API_CONFIG.md              # API configuration guide
├── assets/                        # App icons and images
├── package.json
├── app.json                       # Expo configuration
└── babel.config.js
```

## 🎨 Styling

The app uses React Native StyleSheet with a color palette matching the web frontend:

- Primary colors: Indigo shades (#6366F1)
- Background: Light indigo (#EEF2FF)
- Text: Dark gray to white depending on context
- Accent: Red for destructive actions

All styles are centralized in `AIDermatologist.styles.js` for easy customization.

## 🔧 Configuration

### API Configuration

See `config/API_CONFIG.md` for detailed API setup instructions.

### Expo Configuration

Update `app.json` to customize:
- App name and slug
- Icon and splash screen
- Bundle identifiers
- Permissions

## 📦 Dependencies

### Core Dependencies:
- `expo`: ~51.0.0
- `react-native`: 0.74.5
- `@react-navigation/native`: Navigation
- `axios`: API requests
- `react-native-markdown-display`: Markdown rendering
- `@react-native-async-storage/async-storage`: Persistent storage

### UI Components:
- `@expo/vector-icons`: Icons
- `react-native-safe-area-context`: Safe areas
- `react-native-screens`: Native screens

## 🧪 Testing

### Test on iOS Simulator:
```bash
npm run ios
```

### Test on Android Emulator:
```bash
npm run android
```

### Test on Physical Device:
1. Install Expo Go app from App Store/Play Store
2. Scan QR code from terminal
3. Ensure device is on same network as backend

## 🐛 Troubleshooting

### Cannot connect to backend:

**iOS Simulator:**
- Use `http://localhost:3004/api`
- Make sure backend is running

**Android Emulator:**
- Use `http://10.0.2.2:3004/api` (Android emulator's special IP)
- Check backend is running on port 3004

**Physical Device:**
- Use your computer's local IP: `http://192.168.x.x:3004/api`
- Ensure device and computer are on same network
- Check firewall settings

### App crashes or freezes:

1. Clear cache:
   ```bash
   expo start -c
   ```

2. Reinstall dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```

3. Check React Native logs for errors

### Markdown not rendering:

- Check network requests in console
- Verify API response format
- Ensure `react-native-markdown-display` is installed

## 📱 Building for Production

### iOS:

1. Configure in `app.json`:
   ```json
   "ios": {
     "bundleIdentifier": "com.yourcompany.skinstudy"
   }
   ```

2. Build:
   ```bash
   expo build:ios
   ```

### Android:

1. Configure in `app.json`:
   ```json
   "android": {
     "package": "com.yourcompany.skinstudy"
   }
   ```

2. Build:
   ```bash
   expo build:android
   ```

## 🔐 Security Notes

- Never commit API keys or sensitive data
- Use environment variables for production
- Implement proper authentication before deployment
- Enable HTTPS for production API

## 🤝 Contributing

This is part of the Skin Study project. Features implemented:

- ✅ AI Dermatologist chat interface
- ✅ Markdown rendering
- ✅ Persistent chat history
- ✅ Offline fallback responses
- ✅ Modern UI matching web app

## 📄 License

Part of the Skin Study project.

## 🆘 Support

For issues:
1. Check `config/API_CONFIG.md` for configuration help
2. Review troubleshooting section above
3. Check backend logs for API errors
4. Verify network connectivity

## 🔗 Related Documentation

- Backend README: `../backend/README.md`
- Frontend README: `../frontend/README.md`
- API Configuration: `config/API_CONFIG.md`
