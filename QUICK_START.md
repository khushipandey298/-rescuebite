# Rescue Bite - Quick Start Guide

## 5-Minute Setup

### 1. Start the Backend Server
```bash
cd resurcebite
node server.js
```
> Server will start on `http://localhost:5000`

### 2. Open the Frontend
Open `index.html` in your web browser

### 3. Test the Application

#### Option A: Quick Demo (No Database Required)
- Open `index.html`
- Click "Register here"
- Fill in any details (won't save without database)
- Test location services and maps
- Explore the interface

#### Option B: Full Demo (With MongoDB)
- Set up MongoDB (see below)
- Register as a **Provider**
- Create a donation
- Register as a **Receiver**
- Claim and rate donations
- Try admin login: `admin@jsr.com` / `root`

## MongoDB Setup (2 Minutes)

### Option 1: Use MongoDB Atlas (Recommended)
1. Go to https://www.mongodb.com/atlas
2. Create free account
3. Build a free M0 Sandbox cluster
4. Get connection string
5. Update `.env` file:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rescuebite
   ```

### Option 2: Local MongoDB
```bash
# Windows (as Administrator)
net start MongoDB

# Mac
brew services start mongodb/brew/mongodb-community

# Linux
sudo systemctl start mongodb
```

## Test the Full Flow

### 1. Register as Provider
```
Name: Test Provider
Email: provider@test.com
Password: test123456
ID Type: Aadhar Card
ID Number: 123456789012
```

### 2. Create Donation
- Select "Food Provider" role
- Fill restaurant details
- Add food items and expiry
- Confirm safety
- Select location (Telco, Kadma, etc.)

### 3. Register as Receiver
```
Name: Test NGO
Email: ngo@test.com
Password: test123456
ID Type: Aadhar Card
ID Number: 987654321098
```

### 4. Claim & Rate
- Select "Food Receiver" role
- View available donations
- Claim a donation
- Mark as received
- Rate quality (1-5 stars)

## Admin Dashboard
- Login: `admin@jsr.com` / `root`
- View system statistics
- Manage users and donations
- Monitor activity

## Key Features to Test

### Location Services
- Try different areas: Telco, Kadma, Bistupur
- Test map interaction
- Verify distance calculations

### Real-time Features
- Create donation as provider
- Switch to receiver account
- See donation appear immediately
- Test claiming and status updates

### Rating System
- Complete donation cycle
- Submit packaging and quality ratings
- View provider statistics

## Troubleshooting

### Server Won't Start
```bash
# Check if port 5000 is free
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <PID> /F
```

### Database Connection Failed
- Verify MongoDB is running
- Check connection string in `.env`
- Test with MongoDB Atlas if local fails

### Frontend Not Connecting
- Ensure backend server is running
- Check browser console for errors
- Verify API base URL in `index.html`

## Production URLs (After Deployment)
- Backend: `https://your-backend.railway.app`
- Frontend: `https://your-frontend.netlify.app`

## Next Steps
1. **Customize** branding and colors
2. **Add features** like image uploads
3. **Deploy** to production (see DEPLOYMENT.md)
4. **Monitor** usage and performance

## Support
- Check `README.md` for detailed documentation
- See `API_EXAMPLES.md` for developer integration
- Review `DEPLOYMENT.md` for production setup

---

**Your Rescue Bite application is ready to use!**
