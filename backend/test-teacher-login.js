import fetch from 'node-fetch';

async function testTeacherLogin() {
  try {
    console.log('🧪 Testing teacher login...');
    
    const response = await fetch('http://localhost:5000/api/teacher/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'jane.doe@yahoo.com',
        password: 'teacher123'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Teacher login successful!');
      console.log('📧 Email:', result.teacher.email);
      console.log('👤 Name:', result.teacher.fullName);
      console.log('🏢 Department:', result.teacher.department);
      console.log('🔑 Token received:', result.token ? 'Yes' : 'No');
    } else {
      console.log('❌ Teacher login failed:');
      console.log('📝 Error:', result.message);
      console.log('🔍 Status:', response.status);
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testTeacherLogin();
