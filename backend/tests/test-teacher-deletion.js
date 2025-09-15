import fetch from 'node-fetch';

async function testTeacherDeletion() {
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

    // Create a test teacher first
    console.log('\n📝 Creating a test teacher to delete...');
    const createResponse = await fetch('http://localhost:5000/api/admin/teachers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test.delete@college.edu',
        fullName: 'Teacher To Delete',
        employeeId: 'DEL001',
        designation: 'Assistant Professor',
        department: 'Computer Science and Engineering',
        password: 'deleteTest123',
        sendInvite: false
      })
    });

    let teacherId;
    if (createResponse.ok) {
      const result = await createResponse.json();
      teacherId = result.teacher.id;
      console.log('✅ Test teacher created:', result.teacher.fullName);
    } else {
      const error = await createResponse.json();
      console.log('❌ Failed to create test teacher:', error.message);
      return;
    }

    // Now test deletion
    console.log('\n🗑️ Testing teacher deletion...');
    const deleteResponse = await fetch(`http://localhost:5000/api/admin/teachers/${teacherId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (deleteResponse.ok) {
      const result = await deleteResponse.json();
      console.log('✅ Teacher deleted successfully:', result.message);
    } else {
      const error = await deleteResponse.json();
      console.log('❌ Failed to delete teacher:', error.message);
    }

    // Verify teacher is actually deleted
    console.log('\n🔍 Verifying teacher deletion...');
    const verifyResponse = await fetch(`http://localhost:5000/api/admin/teachers`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (verifyResponse.ok) {
      const data = await verifyResponse.json();
      const deletedTeacher = data.teachers.find(t => t._id === teacherId);
      if (!deletedTeacher) {
        console.log('✅ Verification successful: Teacher no longer exists in database');
      } else {
        console.log('❌ Verification failed: Teacher still exists in database');
      }
    }

    console.log('\n🎉 Teacher deletion test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testTeacherDeletion();
