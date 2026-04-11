# Rescue Bite Backend API

Backend server for Rescue Bite - Jamshedpur Food Rescue Platform

## Features

- **User Authentication**: Secure login/registration with JWT tokens
- **Role-based Access**: Providers, Receivers, and Admin roles
- **Food Donation Management**: Create, claim, track donations
- **Location Services**: Geocoding and distance calculations for Jamshedpur
- **Rating System**: Quality audit and feedback mechanism
- **Admin Dashboard**: Complete system oversight and management

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
- MongoDB connection string
- JWT secret key
- Email credentials (optional)

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/captcha` - Get CAPTCHA
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/role` - Assign user role
- `GET /api/users/providers` - Get all providers
- `GET /api/users/receivers` - Get all receivers

### Donations
- `POST /api/donations` - Create new donation
- `GET /api/donations/available` - Get available donations
- `GET /api/donations/my` - Get user's donations
- `GET /api/donations/:id` - Get donation details
- `POST /api/donations/:id/claim` - Claim a donation
- `POST /api/donations/:id/receive` - Mark donation as received

### Ratings
- `POST /api/ratings/:donationId` - Submit rating
- `GET /api/ratings/provider/:providerId` - Get provider ratings
- `GET /api/ratings/stats` - Get user rating stats

### Locations
- `GET /api/locations/default` - Get default Jamshedpur coordinates
- `GET /api/locations/areas` - Get Jamshedpur areas
- `POST /api/locations/geocode` - Convert address to coordinates
- `POST /api/locations/reverse-geocode` - Convert coordinates to address
- `GET /api/locations/distance` - Calculate distance between points

### Admin (Admin access required)
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId/status` - Update user status
- `GET /api/admin/donations` - Get all donations
- `PUT /api/admin/donations/:donationId/status` - Update donation status
- `DELETE /api/admin/donations/:donationId` - Delete donation
- `GET /api/admin/activity` - Get system activity

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['provider', 'receiver', 'admin'],
  idType: ['Aadhar Card', 'Voter ID', 'PAN Card'],
  idNumber: String,
  isActive: Boolean,
  emailVerified: Boolean
}
```

### Donation Model
```javascript
{
  missionId: String (auto-generated),
  provider: ObjectId (ref: User),
  receiver: ObjectId (ref: User),
  providerType: ['Restaurant', 'Store', 'Individual'],
  entityName: String,
  foodItems: String,
  expiryDate: Date,
  safetyConfirmed: Boolean,
  location: {
    address: String,
    coordinates: { lat: Number, lng: Number }
  },
  status: ['available', 'claimed', 'in_progress', 'received', 'completed', 'expired'],
  ratings: {
    packaging: Number (1-5),
    quality: Number (1-5),
    review: String,
    ratedBy: ObjectId (ref: User)
  }
}
```

## Default Credentials

**Admin:**
- Email: admin@jsr.com
- Password: root

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Account lockout after failed attempts

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rescuebite
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

## Error Handling

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Validation errors if applicable
}
```

## Development

The server includes comprehensive error logging and development-friendly error messages when `NODE_ENV=development`.

## License

MIT License
