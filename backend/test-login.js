/**
 * Quick Login Test Script
 * 
 * Run this to test if login is working:
 * node backend/test-login.js
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function testLogin() {
  console.log('🧪 Testing Login...\n');
  console.log(`API URL: ${API_URL}\n`);

  try {
    // Test login
    console.log('📤 Sending login request...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'secondarymail251045@gmail.com',
      password: 'pasword@123'
    });

    console.log('✅ Login successful!');
    console.log('\nResponse:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n✅ Token received:', response.data.token ? 'Yes' : 'No');
    console.log('✅ User data:', response.data.user ? 'Received' : 'Missing');

  } catch (error) {
    console.error('❌ Login failed!');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else if (error.request) {
      console.error('❌ Cannot connect to backend!');
      console.error('Make sure backend is running: cd backend && npm run dev');
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

testLogin();
