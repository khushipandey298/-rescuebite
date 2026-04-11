# MongoDB Setup Guide for Rescue Bite

## 🎯 Quick Setup Options

### Option 1: MongoDB Atlas (Recommended - Free & Easy)

1. **Create Account**
   - Go to https://www.mongodb.com/atlas
   - Sign up for free account

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "M0 Sandbox" (Free)
   - Select a cloud provider and region (closest to you)
   - Cluster name: `rescuebite-cluster`

3. **Configure Access**
   - Create Database User:
     - Username: `rescuebite`
     - Password: `your_secure_password`
   - Add IP Address: `0.0.0.0/0` (allows all IPs for development)

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Drivers"
   - Copy the connection string
   - Replace `<password>` with your actual password

5. **Update .env file**
   ```env
   MONGODB_URI=mongodb+srv://rescuebite:your_password@rescuebite-cluster.xxxxx.mongodb.net/rescuebite?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB Installation

#### Windows:
1. **Download MongoDB Community Server**
   - Go to https://www.mongodb.com/try/download/community
   - Download Windows version
   - Run installer (choose "Complete" installation)

2. **Start MongoDB Service**
   ```bash
   # As Administrator
   net start MongoDB
   ```

3. **Update .env file**
   ```env
   MONGODB_URI=mongodb://localhost:27017/rescuebite
   ```

#### Mac:
```bash
# Install with Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

#### Linux:
```bash
# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb
```

## 🔧 Verify Connection

### Test Connection Script
```bash
# Create test file
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rescuebite')
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => console.log('❌ Connection Failed:', err.message));
"
```

### Check Database Contents
```bash
# Connect to MongoDB shell
mongosh

# List databases
show dbs

# Switch to rescuebite database
use rescuebite

# List collections
show collections

# View users
db.users.find().pretty()

# View donations
db.donations.find().pretty()
```

## 🚨 Troubleshooting

### Common Issues:

1. **Connection Timeout**
   - Check if MongoDB is running
   - Verify connection string
   - Check firewall settings

2. **Authentication Failed**
   - Verify username/password
   - Check user permissions
   - Ensure IP whitelist includes your address

3. **Port Already in Use**
   ```bash
   # Find process using port 27017
   netstat -ano | findstr :27017
   
   # Kill process (Windows)
   taskkill /PID <PID> /F
   ```

### Reset Database
```bash
# Connect to MongoDB shell
mongosh

# Switch to rescuebite database
use rescuebite

# Drop all collections
db.users.drop()
db.donations.drop()

# Or drop entire database
db.dropDatabase()
```

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String ['provider', 'receiver', 'admin'],
  idType: String ['Aadhar Card', 'Voter ID', 'PAN Card'],
  idNumber: String,
  isActive: Boolean,
  emailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Donations Collection
```javascript
{
  _id: ObjectId,
  missionId: String (unique, auto-generated),
  provider: ObjectId (ref: User),
  receiver: ObjectId (ref: User),
  providerType: String ['Restaurant', 'Store', 'Individual'],
  entityName: String,
  foodItems: String,
  expiryDate: Date,
  safetyConfirmed: Boolean,
  location: {
    address: String,
    coordinates: { lat: Number, lng: Number }
  },
  status: String ['available', 'claimed', 'in_progress', 'received', 'completed', 'expired'],
  ratings: {
    packaging: Number (1-5),
    quality: Number (1-5),
    review: String,
    ratedBy: ObjectId (ref: User),
    ratedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Notes

1. **Never commit .env file to version control**
2. **Use strong passwords for database users**
3. **Enable authentication in production**
4. **Use SSL/TLS connections in production**
5. **Regularly backup your database**

## 📈 Performance Tips

1. **Add indexes for frequently queried fields**
2. **Use connection pooling**
3. **Implement data archiving for old donations**
4. **Monitor database performance**

## 🚀 Production Deployment

For production, consider:
- MongoDB Atlas for managed service
- Replica sets for high availability
- Regular backups
- Monitoring and alerting
- Data encryption at rest and in transit
