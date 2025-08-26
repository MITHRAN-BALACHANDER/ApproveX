// Simple test without node-fetch
const http = require('http');

const postData = JSON.stringify({
  email: 'jane.doe@yahoo.com',
  password: 'teacher123'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/teacher/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing teacher login API...');

const req = http.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

  res.setEncoding('utf8');
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (res.statusCode === 200) {
        console.log('✅ Teacher login successful!');
        console.log('📧 Email:', result.teacher?.email);
        console.log('👤 Name:', result.teacher?.fullName);
        console.log('🔑 Token received:', result.token ? 'Yes' : 'No');
      } else {
        console.log('❌ Teacher login failed:');
        console.log('📝 Response:', result);
      }
    } catch (error) {
      console.log('📝 Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});

req.write(postData);
req.end();
