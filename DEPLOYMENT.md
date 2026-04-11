# Production Deployment Guide

## 🚀 Deployment Options

### Option 1: Railway (Recommended - Easy & Free)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy Backend**
   ```bash
   railway init
   railway up
   ```

3. **Configure Environment Variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set MONGODB_URI=your_mongodb_atlas_string
   railway variables set JWT_SECRET=your_production_secret
   ```

4. **Deploy Frontend**
   ```bash
   # Create a new project for frontend
   railway init --name rescuebite-frontend
   # Copy index.html to public/index.html
   # Add a simple package.json for frontend
   railway up
   ```

### Option 2: Vercel (Frontend) + Railway (Backend)

**Backend on Railway:**
```bash
railway login
railway init
railway up
```

**Frontend on Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel
vercel login

# Deploy
vercel --prod
```

### Option 3: Heroku (Backend) + Netlify (Frontend)

**Backend on Heroku:**
```bash
# Install Heroku CLI
heroku login
heroku create rescuebite-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_atlas_string
heroku config:set JWT_SECRET=your_production_secret

# Deploy
git add .
git commit -m "Deploy to production"
git push heroku main
```

**Frontend on Netlify:**
1. Create `netlify.toml` file
2. Drag and drop the folder to Netlify

## 📦 Production Configuration Files

### 1. Create `netlify.toml` (for Netlify)
```toml
[build]
  publish = "dist"
  command = "echo 'No build needed'"

[build.environment]
  NODE_ENV = "production"

[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.railway.app/api/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

### 2. Create `vercel.json` (for Vercel)
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend-url.railway.app/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 3. Create `Procfile` (for Heroku)
```
web: node server.js
```

### 4. Update `package.json` for production
```json
{
  "name": "rescuebite-backend",
  "version": "1.0.0",
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "build": "echo 'No build step required'"
  }
}
```

## 🔒 Production Environment Variables

### Required Variables:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/rescuebite
JWT_SECRET=your_super_secure_random_string_at_least_32_chars
JWT_EXPIRE=7d
PORT=5000

# Optional but recommended:
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Security Best Practices:
1. **Generate strong JWT secret**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Use MongoDB Atlas** for production database

3. **Enable SSL/TLS** on all connections

4. **Set up monitoring** and alerting

## 📊 Production Monitoring

### 1. Add Logging
```javascript
// In server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### 2. Health Check Endpoint
```javascript
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    await mongoose.connection.db.admin().ping();
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      database: 'disconnected'
    });
  }
});
```

### 3. Rate Limiting for Production
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

## 🌐 Domain Configuration

### Custom Domain Setup:
1. **Backend**: Configure DNS A record to point to your backend service
2. **Frontend**: Configure DNS CNAME record for frontend
3. **SSL**: Most platforms provide automatic SSL certificates

### CORS Configuration for Production:
```javascript
const corsOptions = {
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'https://your-frontend-url.netlify.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

## 🔧 Performance Optimization

### 1. Database Indexes
```javascript
// Add to your models or create indexes separately
db.users.createIndex({ email: 1 });
db.donations.createIndex({ status: 1, expiryDate: 1 });
db.donations.createIndex({ provider: 1 });
db.donations.createIndex({ receiver: 1 });
db.donations.createIndex({ 'location.coordinates': '2dsphere' });
```

### 2. Caching Strategy
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

// Cache middleware
const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    const key = req.originalUrl;
    const cached = cache.get(key);
    
    if (cached) {
      return res.json(cached);
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      cache.set(key, body, duration);
      res.sendResponse(body);
    };
    
    next();
  };
};

// Use for static data
app.get('/api/locations/areas', cacheMiddleware(3600), locationRoutes);
```

## 📱 Progressive Web App (PWA)

### Create `manifest.json`
```json
{
  "name": "Rescue Bite - Jamshedpur Food Rescue",
  "short_name": "Rescue Bite",
  "description": "Connect food donors with NGOs in Jamshedpur",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#6366f1",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Add Service Worker
```javascript
// Create sw.js
const CACHE_NAME = 'rescuebite-v1';
const urlsToCache = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css',
  'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
```

## 🚀 Deployment Checklist

### Pre-Deployment:
- [ ] Test all API endpoints
- [ ] Verify database connection
- [ ] Set up production environment variables
- [ ] Configure CORS for production domains
- [ ] Add error monitoring
- [ ] Set up logging
- [ ] Test with production data

### Post-Deployment:
- [ ] Monitor application logs
- [ ] Set up alerts for errors
- [ ] Test all user flows
- [ ] Verify email notifications work
- [ ] Check mobile responsiveness
- [ ] Test PWA functionality

## 📞 Support & Monitoring

### Recommended Services:
- **Error Tracking**: Sentry
- **Uptime Monitoring**: Uptime Robot
- **Performance**: New Relic or DataDog
- **Logs**: Logtail or Papertrail

### Backup Strategy:
- **Database**: Daily automated backups
- **Code**: Git version control
- **Assets**: CDN backup

---

**🎉 Your Rescue Bite application is now ready for production deployment!**
