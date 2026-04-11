const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testAPI() {
  console.log('🧪 Testing Rescue Bite API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing Health Endpoint...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health:', health.data.status);
    console.log('   Message:', health.data.message);

    // Test CAPTCHA
    console.log('\n2. Testing CAPTCHA Generation...');
    const captcha = await axios.post(`${API_BASE}/auth/captcha`);
    console.log('✅ CAPTCHA Generated:', captcha.data.captcha);

    // Test user registration
    console.log('\n3. Testing User Registration...');
    const userData = {
      name: 'Test Provider',
      email: 'test@provider.com',
      password: 'test123456',
      idType: 'Aadhar Card',
      idNumber: '123456789012'
    };
    const register = await axios.post(`${API_BASE}/auth/register`, userData);
    console.log('✅ User Registered:', register.data.data.user.name);
    const token = register.data.data.token;

    // Test role assignment
    console.log('\n4. Testing Role Assignment...');
    const roleResponse = await axios.put(
      `${API_BASE}/users/role`,
      { role: 'provider' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Role Assigned:', roleResponse.data.data.user.role);

    // Test location services
    console.log('\n5. Testing Location Services...');
    const locations = await axios.get(`${API_BASE}/locations/areas`);
    console.log('✅ Areas Available:', locations.data.data.total, 'areas');
    console.log('   Sample Area:', locations.data.data.areas[0].name);

    // Test geocoding
    console.log('\n6. Testing Geocoding...');
    const geocode = await axios.post(`${API_BASE}/locations/geocode`, {
      address: 'Telco'
    });
    console.log('✅ Geocoded Telco:', geocode.data.data.coordinates);

    // Test donation creation
    console.log('\n7. Testing Donation Creation...');
    const donationData = {
      providerType: 'Restaurant',
      entityName: 'Test Restaurant',
      foodItems: 'Rice, Dal, Roti - 20 meals',
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      safetyConfirmed: true,
      location: {
        address: 'Telco, Jamshedpur',
        coordinates: geocode.data.data.coordinates
      }
    };
    const donation = await axios.post(
      `${API_BASE}/donations`,
      donationData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Donation Created:', donation.data.data.donation.missionId);

    // Test available donations
    console.log('\n8. Testing Available Donations...');
    const available = await axios.get(`${API_BASE}/donations/available`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Available Donations:', available.data.data.donations.length);

    // Test user profile
    console.log('\n9. Testing User Profile...');
    const profile = await axios.get(`${API_BASE}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` } 
    });
    console.log('✅ Profile Retrieved:', profile.data.data.user.name);

    console.log('\n🎉 All API Tests Passed Successfully!');
    console.log('\n📊 Summary:');
    console.log('- Server is running on port 5000');
    console.log('- Authentication system working');
    console.log('- Role assignment working');
    console.log('- Location services working');
    console.log('- Donation system working');
    console.log('- Database connectivity confirmed');

  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('\n💡 Note: Some tests may fail without MongoDB running');
    }
  }
}

// Run tests
testAPI();
