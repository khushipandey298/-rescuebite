# Railway Deployment Guide - Rescue Bite

## 🚀 Method 1: Railway Web (Easiest)

### Step 1: Connect GitHub to Railway
1. Go to: https://railway.app
2. Click "Login" → "Continue with GitHub"
3. Authorize Railway to access your GitHub
4. Select repository: `khushipandey298/rescuebite`

### Step 2: Configure Deployment
1. **Project Name**: `rescuebite-api`
2. **Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://rescuebite:YOUR_PASSWORD@rescuebite-cluster.xxxxx.mongodb.net/rescuebite
   JWT_SECRET=your_jwt_secret_here
   PORT=5000
   ```
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`

### Step 3: Deploy
1. Click "Deploy Now"
2. Railway will build and deploy automatically
3. Wait for deployment (2-3 minutes)

## 🔧 Method 2: Railway CLI (Advanced)

### Install and Login
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login
```

### Deploy Commands
```bash
# Initialize project
cd "C:\Users\Khushi Pandey\OneDrive\Desktop\resurcebite"
railway init --name rescuebite-api

# Deploy
railway up
```

## 📊 Deployment Configuration

### Build Settings
- **Node Version**: 18.x
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Port**: 5000

### Environment Variables Required
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://rescuebite:password@cluster.mongodb.net/rescuebite
JWT_SECRET=rescuebite_jwt_secret_key_2024
PORT=5000
```

## ✅ Success Indicators

### After Deployment Success:
- ✅ Railway shows "Deployed successfully"
- ✅ URL format: `https://rescuebite-api.up.railway.app`
- ✅ Health check: `https://rescuebite-api.up.railway.app/api/health`
- ✅ Logs show "Server started on port 5000"

## 🔧 Troubleshooting

### Common Issues:
1. **Build failed** → Check package.json dependencies
2. **Port error** → Ensure PORT=5000 in env
3. **Database connection** → Verify MONGODB_URI
4. **JWT error** → Check JWT_SECRET

### Debug Commands:
```bash
# View logs
railway logs

# View environment
railway variables

# Restart deployment
railway up
```

## 🌐 Production URLs

### Backend URL:
```
https://rescuebite-api.up.railway.app
```

### API Endpoints:
```
Health: https://rescuebite-api.up.railway.app/api/health
Auth: https://rescuebite-api.up.railway.app/api/auth
Donations: https://rescuebite-api.up.railway.app/api/donations
```

## 📱 Frontend Integration

After Railway deployment, update frontend API URL:

### In index.html, change:
```javascript
const API_BASE = 'https://rescuebite-api.up.railway.app/api';
```

## 🎯 Next Steps After Railway Deploy

1. **Update frontend** with Railway URL
2. **Deploy frontend** to Netlify
3. **Set up MongoDB Atlas** with connection string
4. **Test complete application**

## 📋 Deployment Checklist

- [ ] GitHub connected to Railway
- [ ] Environment variables set
- [ ] Build successful
- [ ] Health check passing
- [ ] Frontend URL updated
- [ ] Full application tested

## 🎉 Production Ready

Once deployed, your Rescue Bite application will be:
- ✅ Live on Railway (backend)
- ✅ Live on Netlify (frontend)
- ✅ Connected to MongoDB Atlas
- ✅ Accessible via custom domain
- ✅ Ready for Jamshedpur users
