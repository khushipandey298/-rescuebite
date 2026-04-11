const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testBasicAPI() {
  console.log('🧪 Testing Basic Rescue Bite API (without database)...\n');

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

    // Test location services
    console.log('\n3. Testing Location Services...');
    const locations = await axios.get(`${API_BASE}/locations/areas`);
    console.log('✅ Areas Available:', locations.data.data.total, 'areas');
    console.log('   Sample Area:', locations.data.data.areas[0].name);

    // Test geocoding
    console.log('\n4. Testing Geocoding...');
    const geocode = await axios.post(`${API_BASE}/locations/geocode`, {
      address: 'Telco'
    });
    console.log('✅ Geocoded Telco:', geocode.data.data.coordinates);

    // Test reverse geocoding
    console.log('\n5. Testing Reverse Geocoding...');
    const reverseGeocode = await axios.post(`${API_BASE}/locations/reverse-geocode`, {
      lat: 22.8046,
      lng: 86.2029
    });
    console.log('✅ Reverse Geocoded:', reverseGeocode.data.data.area);

    // Test distance calculation
    console.log('\n6. Testing Distance Calculation...');
    const distance = await axios.get(`${API_BASE}/locations/distance?lat1=22.8046&lng1=86.2029&lat2=22.7914&lng2=86.1854`);
    console.log('✅ Distance:', distance.data.data.distance, 'km');

    // Test default coordinates
    console.log('\n7. Testing Default Coordinates...');
    const defaultCoords = await axios.get(`${API_BASE}/locations/default`);
    console.log('✅ Default Jamshedpur Coordinates:', defaultCoords.data.data.coordinates);

    console.log('\n🎉 Basic API Tests Passed Successfully!');
    console.log('\n📊 Summary:');
    console.log('- Server is running on port 5000');
    console.log('- Health endpoint working');
    console.log('- CAPTCHA system working');
    console.log('- Location services working');
    console.log('- Geocoding working');
    console.log('- Distance calculation working');
    console.log('\n💡 Database-dependent features (auth, donations, users) require MongoDB to be running');

  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
  }
}

// Run tests
testBasicAPI();
