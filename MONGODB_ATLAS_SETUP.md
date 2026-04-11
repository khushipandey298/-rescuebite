# MongoDB Atlas Setup - Rescue Bite

## 🎯 Quick Setup (5 Minutes)

### Step 1: Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/atlas
2. Click "Try Free" → "Sign up"
3. Fill in:
   - Email: your-email@example.com
   - Password: strong password
   - Username: your-username
4. Verify email

### Step 2: Create Free Cluster
1. Click "Build a Database"
2. Choose "M0 Sandbox" (FREE)
3. Cloud Provider: AWS
4. Region: Mumbai (closest to India)
5. Cluster Name: `rescuebite-cluster`
6. Click "Create Cluster"

### Step 3: Create Database User
1. Go to "Database Access" → "Add New Database User"
2. Fill details:
   - Username: `rescuebite`
   - Password: `RescueBite@2024`
   - Authentication Method: SCRAM
3. Click "Add User"

### Step 4: Whitelist IP Address
1. Go to "Network Access" → "Add IP Address"
2. Choose "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0)
3. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" → "Connect"
2. Click "Drivers"
3. Copy connection string
4. Replace `<password>` with your actual password

### Step 6: Update .env File
Open `.env` file and update:
```env
MONGODB_URI=mongodb+srv://rescuebite:RescueBite@2024@rescuebite-cluster.xxxxx.mongodb.net/rescuebite?retryWrites=true&w=majority
```

## 🚀 Alternative: Use Existing Connection

If you already have MongoDB Atlas:
1. Create new database: `rescuebite`
2. Create user with read/write permissions
3. Update .env with connection string

## ✅ Test Connection

After updating .env, test:
```bash
cd "C:\Users\Khushi Pandey\OneDrive\Desktop\resurcebite"
node server.js
```

Look for: "MongoDB connected successfully"

## 📊 Database Collections

After connection, MongoDB will create:
- `users` - User accounts and profiles
- `donations` - Food donation records

## 🔧 Troubleshooting

### Connection Issues:
- Check password in connection string
- Verify IP whitelist (0.0.0.0/0)
- Ensure cluster is running

### Common Errors:
- "Authentication failed" → Wrong password
- "Connection timeout" → IP not whitelisted
- "Database not found" → Wrong database name

## 🎉 Success Indicators

✅ Server starts without database errors
✅ "MongoDB connected successfully" message
✅ Can register new users
✅ Can create donations
✅ Health check shows database: "connected"

## Next Steps After MongoDB Setup

1. **Restart server**: `node server.js`
2. **Test full API**: `node test-api.js`
3. **Deploy backend**: Railway
4. **Deploy frontend**: Netlify

## MongoDB Atlas Dashboard Features

- **Free Tier**: 512MB storage
- **Automatic Backups**: 7 days retention
- **Monitoring**: Performance metrics
- **Security**: IP whitelisting and authentication

## Connection String Format

```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

Your actual connection string will be:
```
mongodb+srv://rescuebite:YOUR_PASSWORD@rescuebite-cluster.xxxxx.mongodb.net/rescuebite?retryWrites=true&w=majority
```
