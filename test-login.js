const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login...');
    const response = await axios.post('https://ubumwegroup.onrender.com/api/login', {
      email: 'armand123@gmail.com',
      password: 'your_password_here'  // Replace with the actual password used during registration
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Login successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Login failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
      console.log('Headers:', error.response.headers);
    } else if (error.request) {
      console.log('No response received:', error.request);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testLogin();
