# Quick Start: Deploy to Vercel

## 🚀 Fastest Way to Deploy

### 1. Deploy Backend to Railway (5 minutes)

```bash
# Push your code to GitHub first
git add .
git commit -m "Prepare for deployment"
git push origin main
```

Then:
1. Go to [Railway](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `skin-study` repository
4. Railway auto-detects Node.js
5. Set **Root Directory**: `backend`
6. Add environment variables:
   - `MONGODB_URI` - Get from MongoDB Atlas
   - `JWT_SECRET` - Any random string
   - `GEMINI_API_KEY` - From Google AI Studio
   - `QDRANT_URL` - From Qdrant Cloud
   - `NODE_ENV=production`
7. Copy your Railway backend URL (e.g., `https://skin-study-backend-production.railway.app`)

### 2. Deploy Frontend to Vercel (3 minutes)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel --prod
```

Or use the Vercel Dashboard:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import from GitHub
3. Set **Root Directory**: `frontend`
4. Add environment variable:
   - `VITE_API_BASE_URL` = Your Railway backend URL + `/api`
   - Example: `https://skin-study-backend-production.railway.app/api`
5. Click **Deploy**

### 3. Update CORS in Backend

Once frontend is deployed, add its URL to backend CORS:

In `backend/server.js`, update:
```javascript
const allowedOrigins = [
  'https://your-vercel-app.vercel.app', // Add your Vercel URL
  process.env.FRONTEND_URL || 'http://localhost:5175',
];
```

Then redeploy backend (push to GitHub).

### 4. Test Your Deployment

- Frontend: Visit your Vercel URL
- Backend Health: `https://your-backend.railway.app/api/health`
- Try signing up and logging in

---

## 📦 External Services Needed

### MongoDB Atlas (Free):
1. [Create account](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Add to Railway env vars

### Qdrant Cloud (Free):
1. [Create account](https://cloud.qdrant.io/)
2. Create free cluster
3. Get URL and API key
4. Add to Railway env vars

### Google AI Studio (Free):
1. Go to [ai.google.dev](https://ai.google.dev)
2. Get API key for Gemini
3. Add to Railway env vars

---

## ⚡ One-Command Deploy (Alternative)

If you want to deploy only backend to Vercel as serverless:

```bash
# Navigate to backend
cd backend

# Deploy
vercel --prod
```

**Note**: This may have limitations with Qdrant and file uploads. Railway/Render is recommended for backend.

---

## 🎯 What You'll Have

After deployment:
- ✅ Frontend on Vercel (fast, global CDN)
- ✅ Backend on Railway (always running)
- ✅ MongoDB Atlas (managed database)
- ✅ Qdrant Cloud (vector search)
- ✅ Automatic HTTPS
- ✅ Auto-deploy on git push

Total time: **~15 minutes**
Total cost: **$0** (using free tiers)

---

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions and troubleshooting.
