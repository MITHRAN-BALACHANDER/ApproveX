import fetch from 'node-fetch';

async function testAutoLogin() {
  try {
    console.log('Testing auto-login endpoint...');
    
    // Test with the student email from database
    const response = await fetch('http://localhost:5000/api/role-auth/auto-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'mithrans23it@srishakthi.ac.in',
        password: '5tgb$RFV' // You'll need to use the correct password
      }),
    });

    const result = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log(`✅ Login successful!`);
      console.log(`User Role: ${result.role}`);
      console.log(`Redirect To: ${result.redirectTo}`);
      console.log(`User Data:`, result.user);
    } else {
      console.log(`❌ Login failed: ${result.message}`);
    }
    
  } catch (error) {
    console.error('Error testing auto-login:', error);
  }
}

testAutoLogin();
