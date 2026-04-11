# API Usage Examples for Developers

## Quick Start

Base URL: `http://localhost:5000/api`

## Authentication Flow

### 1. Generate CAPTCHA
```javascript
// Get CAPTCHA for login
fetch('http://localhost:5000/api/auth/captcha', {
  method: 'POST'
})
.then(response => response.json())
.then(data => {
  console.log('CAPTCHA:', data.captcha); // e.g., 1234
});
```

### 2. User Registration
```javascript
const userData = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'securepassword123',
  idType: 'Aadhar Card',
  idNumber: '123456789012'
};

fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(userData)
})
.then(response => response.json())
.then(data => {
  const token = data.data.token; // Save this token
  const user = data.data.user;   // User information
  console.log('Registration successful:', user);
});
```

### 3. User Login
```javascript
const loginData = {
  email: 'john@example.com',
  password: 'securepassword123',
  captcha: '1234' // From step 1
};

fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(loginData)
})
.then(response => response.json())
.then(data => {
  const token = data.data.token;
  localStorage.setItem('authToken', token);
  console.log('Login successful');
});
```

## Role Assignment

### Assign User Role
```javascript
const token = localStorage.getItem('authToken');

fetch('http://localhost:5000/api/users/role', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    role: 'provider' // or 'receiver'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Role assigned:', data.data.user.role);
});
```

## Donation Management

### Create Donation (Provider)
```javascript
const donationData = {
  providerType: 'Restaurant',
  entityName: 'Food Paradise',
  foodItems: 'Rice, Dal, Roti - 20 meals',
  expiryDate: '2024-12-31T18:00:00.000Z',
  safetyConfirmed: true,
  location: {
    address: 'Telco, Jamshedpur',
    coordinates: {
      lat: 22.8071,
      lng: 86.2039
    }
  }
};

fetch('http://localhost:5000/api/donations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(donationData)
})
.then(response => response.json())
.then(data => {
  console.log('Donation created:', data.data.donation.missionId);
});
```

### Get Available Donations (Receiver)
```javascript
fetch('http://localhost:5000/api/donations/available', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => {
  const donations = data.data.donations;
  donations.forEach(donation => {
    console.log(`Mission ${donation.missionId}: ${donation.foodItems}`);
  });
});
```

### Claim Donation (Receiver)
```javascript
const donationId = '507f1f77bcf86cd799439011'; // Donation ID

fetch(`http://localhost:5000/api/donations/${donationId}/claim`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => {
  console.log('Donation claimed:', data.data.donation.missionId);
});
```

### Mark Donation as Received
```javascript
fetch(`http://localhost:5000/api/donations/${donationId}/receive`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => {
  console.log('Donation marked as received');
});
```

## Rating System

### Submit Rating (Receiver)
```javascript
const ratingData = {
  packaging: 5,
  quality: 4,
  review: 'Good quality food, well packaged'
};

fetch(`http://localhost:5000/api/ratings/${donationId}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(ratingData)
})
.then(response => response.json())
.then(data => {
  console.log('Rating submitted successfully');
});
```

### Get Provider Ratings
```javascript
const providerId = '507f1f77bcf86cd799439011';

fetch(`http://localhost:5000/api/ratings/provider/${providerId}`)
.then(response => response.json())
.then(data => {
  console.log('Average Rating:', data.data.averageRating);
  console.log('Total Ratings:', data.data.totalRatings);
});
```

## Location Services

### Get Jamshedpur Areas
```javascript
fetch('http://localhost:5000/api/locations/areas')
.then(response => response.json())
.then(data => {
  const areas = data.data.areas;
  areas.forEach(area => {
    console.log(`${area.name}: ${area.lat}, ${area.lng}`);
  });
});
```

### Geocode Address
```javascript
fetch('http://localhost:5000/api/locations/geocode', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    address: 'Telco'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Coordinates:', data.data.coordinates);
});
```

### Calculate Distance
```javascript
fetch('http://localhost:5000/api/locations/distance?lat1=22.8046&lng1=86.2029&lat2=22.7914&lng2=86.1854')
.then(response => response.json())
.then(data => {
  console.log('Distance:', data.data.distance, 'km');
});
```

## Admin Functions

### Get System Statistics
```javascript
fetch('http://localhost:5000/api/admin/stats', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
})
.then(response => response.json())
.then(data => {
  console.log('Total Users:', data.data.overview.totalUsers);
  console.log('Active Donations:', data.data.overview.activeDonations);
});
```

### Get All Users
```javascript
fetch('http://localhost:5000/api/admin/users?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
})
.then(response => response.json())
.then(data => {
  const users = data.data.users;
  console.log('Total users:', data.data.pagination.total);
});
```

## Error Handling

### Standard Response Format
```javascript
// Success Response
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Validation errors if applicable
}
```

### Handling Errors
```javascript
fetch('http://localhost:5000/api/donations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(donationData)
})
.then(response => {
  if (!response.ok) {
    return response.json().then(error => {
      throw new Error(error.message);
    });
  }
  return response.json();
})
.then(data => {
  console.log('Success:', data);
})
.catch(error => {
  console.error('Error:', error.message);
});
```

## Complete Example: Full Donation Flow

```javascript
class RescueBiteAPI {
  constructor(baseURL = 'http://localhost:5000/api') {
    this.baseURL = baseURL;
    this.token = null;
  }

  async login(email, password) {
    // 1. Get CAPTCHA
    const captchaResponse = await fetch(`${this.baseURL}/auth/captcha`, {
      method: 'POST'
    });
    const { captcha } = await captchaResponse.json();

    // 2. Login
    const loginResponse = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, captcha })
    });

    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }

    const data = await loginResponse.json();
    this.token = data.data.token;
    return data.data.user;
  }

  async createDonation(donationData) {
    const response = await fetch(`${this.baseURL}/donations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(donationData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return await response.json();
  }

  async getAvailableDonations() {
    const response = await fetch(`${this.baseURL}/donations/available`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    return await response.json();
  }

  async claimDonation(donationId) {
    const response = await fetch(`${this.baseURL}/donations/${donationId}/claim`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return await response.json();
  }

  async submitRating(donationId, rating) {
    const response = await fetch(`${this.baseURL}/ratings/${donationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(rating)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return await response.json();
  }
}

// Usage Example
const api = new RescueBiteAPI();

async function exampleFlow() {
  try {
    // Login as provider
    await api.login('provider@example.com', 'password123');
    
    // Create donation
    const donation = await api.createDonation({
      providerType: 'Restaurant',
      entityName: 'Test Restaurant',
      foodItems: 'Rice and Curry - 10 meals',
      expiryDate: '2024-12-31T18:00:00.000Z',
      safetyConfirmed: true,
      location: {
        address: 'Telco, Jamshedpur',
        coordinates: { lat: 22.8071, lng: 86.2039 }
      }
    });
    
    console.log('Donation created:', donation.data.donation.missionId);
    
    // Get available donations (as receiver)
    const available = await api.getAvailableDonations();
    console.log('Available donations:', available.data.donations.length);
    
  } catch (error) {
    console.error('Flow failed:', error.message);
  }
}

exampleFlow();
```

## Testing with curl

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Get CAPTCHA
```bash
curl -X POST http://localhost:5000/api/auth/captcha
```

### Get Areas
```bash
curl http://localhost:5000/api/locations/areas
```

### Login (replace with actual values)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jsr.com","password":"root","captcha":"1234"}'
```

## Rate Limits

- **100 requests per 15 minutes** per IP
- **Authentication required** for most endpoints
- **Admin access required** for admin endpoints

## WebSocket Support (Future Enhancement)

```javascript
// Real-time updates (planned feature)
const ws = new WebSocket('ws://localhost:5000/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};
```

---

**For more information, see the main README.md and test files in the project.**
