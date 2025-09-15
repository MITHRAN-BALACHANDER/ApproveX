import fetch from 'node-fetch';

async function testTeacherCreation() {
  try {
    // First, login as admin to get token
    console.log('🔑 Logging in as admin...');
    const loginResponse = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@college.edu',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Admin login failed');
    }

    const loginData = await loginResponse.json();
    const adminToken = loginData.token;
    console.log('✅ Admin login successful');

    // Test 1: Create teacher with custom password
    console.log('\n📝 Test 1: Creating teacher with custom password...');
    const customPasswordResponse = await fetch('http://localhost:5000/api/admin/teachers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test.teacher1@college.edu',
        fullName: 'Test Teacher One',
        employeeId: 'EMP001',
        designation: 'Assistant Professor',
        department: 'Computer Science and Engineering',
        password: 'customPass123',
        sendInvite: false
      })
    });

    if (customPasswordResponse.ok) {
      const result = await customPasswordResponse.json();
      console.log('✅ Teacher created with custom password');
      console.log('📧 Email will not be sent (sendInvite: false)');
      console.log('👤 Teacher details:', result.teacher);
    } else {
      const error = await customPasswordResponse.json();
      console.log('❌ Failed to create teacher:', error.message);
    }

    // Test 2: Create teacher with auto-generated password
    console.log('\n📝 Test 2: Creating teacher with auto-generated password...');
    const autoPasswordResponse = await fetch('http://localhost:5000/api/admin/teachers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test.teacher2@college.edu',
        fullName: 'Test Teacher Two',
        employeeId: 'EMP002',
        designation: 'Professor',
        department: 'Information Technology',
        sendInvite: true
      })
    });

    if (autoPasswordResponse.ok) {
      const result = await autoPasswordResponse.json();
      console.log('✅ Teacher created with auto-generated password');
      console.log('📧 Invitation email will be sent');
      console.log('👤 Teacher details:', result.teacher);
    } else {
      const error = await autoPasswordResponse.json();
      console.log('❌ Failed to create teacher:', error.message);
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testTeacherCreation();
