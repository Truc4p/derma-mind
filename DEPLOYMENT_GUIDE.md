# Deploying Skin Study to Vercel

This guide walks you through deploying your Skin Study application to Vercel.

## 🚀 Deployment Overview

Your project structure allows for two deployment strategies:

### Option 1: Separate Deployments (Recommended)
- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to a service that supports long-running Node.js servers (Railway, Render, etc.)

### Option 2: Monorepo Deployment
- Deploy both frontend and backend together on Vercel using serverless functions

This guide covers **Option 1** as it's more suitable for your backend requirements (Qdrant, file uploads).

---

## 📋 Prerequisites

Before deploying, you need:

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Your MongoDB should be accessible from the internet
   - Get connection string from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
3. **Qdrant Cloud** (or self-hosted): 
   - Sign up at [Qdrant Cloud](https://cloud.qdrant.io/)
   - Or deploy Qdrant on Railway/Render
4. **Environment Variables**: Prepare all your env vars

---

## 🎯 Step 1: Deploy Backend (Recommended: Railway or Render)

Since your backend uses:
- Persistent connections (MongoDB, Qdrant)
- Docker containers (Qdrant)
- File uploads
- Long-running processes

**Use Railway, Render, or similar services** instead of Vercel serverless functions.

### Deploy Backend to Railway:

1. Push your code to GitHub
2. Go to [Railway](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Set root directory to `/backend`
6. Add environment variables (see below)
7. Railway will auto-detect Node.js and deploy

### Deploy Backend to Render:

1. Go to [Render](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables
6. Click "Create Web Service"

### Backend Environment Variables:

```env
# Database
MONGODB_URI=mongodb+srv://your-atlas-connection-string

# JWT
JWT_SECRET=your-jwt-secret-key

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Qdrant Vector Database
QDRANT_URL=https://your-qdrant-cloud-url
QDRANT_API_KEY=your-qdrant-api-key

# CORS
FRONTEND_URL=https://your-vercel-app.vercel.app

# Server
PORT=3004
NODE_ENV=production
```

---

## 🎨 Step 2: Deploy Frontend to Vercel

### Via Vercel Dashboard:

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. Add environment variables:
   ```env
   VITE_API_BASE_URL=https://your-backend-url.railway.app/api
   ```

5. Click "Deploy"

### Via Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? skin-study-frontend
# - Directory? ./
# - Override settings? Yes
#   - Build Command: npm run build
#   - Output Directory: dist
```

---

## 🔧 Step 3: Configure Environment Variables

### Frontend Environment Variables (Vercel):

Go to your Vercel project → Settings → Environment Variables:

```env
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

### Backend Environment Variables (Railway/Render):

Add all the variables listed in Step 1.

---

## 📦 Step 4: Database Setup

### MongoDB Atlas:

1. Create cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user
3. Whitelist all IPs (0.0.0.0/0) for production
4. Get connection string
5. Add to backend env vars

### Qdrant Setup:

**Option A: Qdrant Cloud (Easiest)**
1. Sign up at [Qdrant Cloud](https://cloud.qdrant.io/)
2. Create a cluster
3. Get API URL and API Key
4. Add to backend env vars

**Option B: Self-hosted on Railway**
1. Deploy Qdrant using Docker on Railway
2. Use internal URL for connection

---

## 🔄 Step 5: Update CORS Settings

Update your backend `server.js` CORS configuration to include your Vercel domain:

```javascript
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://your-app.vercel.app',
  'http://localhost:5175', // Keep for local development
];
```

---

## ✅ Step 6: Verify Deployment

1. **Frontend Health Check**:
   - Visit: `https://your-app.vercel.app`
   - Check browser console for errors

2. **Backend Health Check**:
   - Visit: `https://your-backend.railway.app/api/health`
   - Should return: `{"status": "OK", ...}`

3. **API Connection**:
   - Test login/signup from frontend
   - Check network tab for API calls

---

## 🐛 Troubleshooting

### CORS Errors:
- Verify `FRONTEND_URL` env var in backend
- Check backend CORS configuration
- Ensure backend is deployed and running

### API Connection Failed:
- Verify `VITE_API_BASE_URL` in Vercel
- Check backend logs on Railway/Render
- Test backend health endpoint directly

### MongoDB Connection Failed:
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check connection string format
- Ensure database user has proper permissions

### Qdrant Connection Failed:
- Verify Qdrant URL and API Key
- Check if Qdrant service is running
- Test connection with Qdrant dashboard

### Build Failures:
- Check build logs in Vercel dashboard
- Verify all dependencies in package.json
- Ensure Node.js version compatibility

---

## 🔄 Continuous Deployment

Both Vercel and Railway/Render support automatic deployments:

1. **Push to GitHub** → Automatically deploys
2. **Configure branches**:
   - `main` → Production
   - `develop` → Preview/Staging

---

## 📱 Mobile App Configuration

Update your mobile app API configuration:

**File**: `mobile-chat-app/services/api.js`

```javascript
const API_BASE_URL = 'https://your-backend.railway.app/api';
```

---

## 🔐 Security Checklist

Before going live:

- [ ] All environment variables are set
- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB has authentication enabled
- [ ] API keys are not exposed in frontend
- [ ] CORS is properly configured
- [ ] HTTPS is enabled (automatic with Vercel/Railway)
- [ ] Rate limiting is configured (add middleware)
- [ ] File upload limits are set
- [ ] Input validation is in place

---

## 📊 Monitoring

### Vercel:
- Analytics: Built-in on Vercel dashboard
- Logs: Real-time in deployment logs

### Railway/Render:
- Logs: Available in dashboard
- Metrics: CPU, Memory, Network usage

---

## 💰 Cost Estimation

### Free Tier Limits:

**Vercel** (Hobby):
- 100 GB bandwidth/month
- Unlimited requests
- Free for personal projects

**Railway**:
- $5 free credit/month
- Pay for usage after

**Render**:
- Free tier: 750 hours/month
- Auto-sleep after 15 min inactivity

**MongoDB Atlas**:
- Free tier: 512 MB storage
- Shared cluster

**Qdrant Cloud**:
- Free tier: 1 GB storage
- 100 API calls/sec

---

## 🚀 Quick Deploy Command Summary

```bash
# 1. Deploy Frontend to Vercel
cd frontend
vercel --prod

# 2. Update API endpoint in mobile app
# Edit mobile-chat-app/services/api.js with production URL

# 3. Test deployment
curl https://your-backend.railway.app/api/health
```

---

## 📞 Support

If you encounter issues:

1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Railway docs: [docs.railway.app](https://docs.railway.app)
3. Check deployment logs for errors
4. Verify all environment variables are set correctly

---

## 🎉 Success!

Once deployed:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.railway.app`
- Health check: `https://your-backend.railway.app/api/health`

Your Skin Study application is now live! 🌟
