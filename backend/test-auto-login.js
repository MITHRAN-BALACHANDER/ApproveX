import fetch from 'node-fetch';

// Test the new auto-login endpoint
async function testAutoLogin() {
  try {
    console.log('Testing auto-login endpoint...');
    
    // Test with admin credentials (if they exist)
    const response = await fetch('http://localhost:5000/api/role-auth/auto-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@srishakthi.ac.in',
        password: 'admin123'
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Auto-login successful!');
      console.log('📧 Email:', result.user.email);
      console.log('🎯 Role:', result.role);
      console.log('🔗 Redirect to:', result.redirectTo);
      console.log('🔑 Token:', result.token ? 'Generated' : 'None');
    } else {
      console.log('❌ Auto-login failed:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing auto-login:', error.message);
  }
}

testAutoLogin();
