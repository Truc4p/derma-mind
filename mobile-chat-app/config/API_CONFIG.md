# API Configuration

## Backend URL Configuration

The mobile app connects to your backend server. Update the API base URL in:

**File:** `services/api.js`

```javascript
const API_BASE_URL = 'http://localhost:3004/api';
```

### Development Configurations:

#### iOS Simulator
```javascript
const API_BASE_URL = 'http://localhost:3004/api';
```

#### Android Emulator
```javascript
const API_BASE_URL = 'http://10.0.2.2:3004/api';
```

#### Physical Device (Same Network)
Find your computer's IP address:
- macOS: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: `ipconfig`

```javascript
const API_BASE_URL = 'http://YOUR_IP_ADDRESS:3004/api';
// Example: 'http://192.168.1.100:3004/api'
```

### Production Configuration

When deploying to production, update to your deployed backend URL:

```javascript
const API_BASE_URL = 'https://your-backend-domain.com/api';
```

## Testing the Connection

1. Make sure your backend server is running:
   ```bash
   cd backend
   npm start
   ```

2. Test the API endpoint in your browser or Postman:
   ```
   http://localhost:3004/api/ai-dermatology-expert/chat
   ```

3. If you get connection errors in the mobile app:
   - Check if backend is running
   - Verify the API_BASE_URL matches your setup
   - Ensure your device/emulator can reach the backend
   - Check firewall settings

## Environment Variables (Optional)

For better configuration management, you can use environment variables:

1. Install expo-constants:
   ```bash
   npm install expo-constants
   ```

2. Create `app.config.js`:
   ```javascript
   export default {
     expo: {
       // ... your expo config
       extra: {
         apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3004/api'
       }
     }
   };
   ```

3. Update `services/api.js`:
   ```javascript
   import Constants from 'expo-constants';
   const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3004/api';
   ```
