import fetch from 'node-fetch';

async function testTeacherReviewFlow() {
  try {
    console.log('🔬 Testing Teacher Review and Approval Flow...\n');

    // Step 1: Login as teacher
    console.log('🔑 Step 1: Login as teacher...');
    const loginResponse = await fetch('http://localhost:5000/api/teacher/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'teacher@college.edu', // Assuming we have a test teacher
        password: 'teacher123'
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      console.log('❌ Teacher login failed:', error.message);
      return;
    }

    const loginData = await loginResponse.json();
    const teacherToken = loginData.token;
    console.log('✅ Teacher login successful');

    // Step 2: Get available requests
    console.log('\n📋 Step 2: Fetching requests for review...');
    const requestsResponse = await fetch('http://localhost:5000/api/teacher/requests', {
      headers: {
        'Authorization': `Bearer ${teacherToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!requestsResponse.ok) {
      console.log('❌ Failed to fetch requests');
      return;
    }

    const requestsData = await requestsResponse.json();
    console.log(`✅ Found ${requestsData.requests.length} requests`);

    if (requestsData.requests.length === 0) {
      console.log('ℹ️ No requests available for testing review functionality');
      return;
    }

    // Step 3: Try to review the first request
    const firstRequest = requestsData.requests[0];
    console.log(`\n🔍 Step 3: Reviewing request ${firstRequest._id}...`);
    console.log(`Student: ${firstRequest.studentInfo?.fullName}`);
    console.log(`Event: ${firstRequest.eventDetails?.eventTitle}`);
    console.log(`Current status: ${firstRequest.overallStatus}`);

    // Step 4: Submit a review
    console.log('\n✍️ Step 4: Submitting review...');
    const reviewResponse = await fetch(`http://localhost:5000/api/teacher/requests/${firstRequest._id}/review`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${teacherToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'approved',
        remarks: 'Test approval from automated script',
        approvalLevel: 'mentor' // Try mentor level first
      })
    });

    console.log('Review response status:', reviewResponse.status);

    if (reviewResponse.ok) {
      const reviewResult = await reviewResponse.json();
      console.log('✅ Review submitted successfully!');
      console.log('Review result:', reviewResult);
    } else {
      const error = await reviewResponse.json();
      console.log('❌ Review failed:', error);
      
      // Try with HOD level if mentor failed
      if (error.message.includes('already')) {
        console.log('\n🔄 Trying with HOD level...');
        const hodReviewResponse = await fetch(`http://localhost:5000/api/teacher/requests/${firstRequest._id}/review`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${teacherToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'approved',
            remarks: 'Test HOD approval from automated script',
            approvalLevel: 'hod'
          })
        });

        if (hodReviewResponse.ok) {
          console.log('✅ HOD review submitted successfully!');
        } else {
          const hodError = await hodReviewResponse.json();
          console.log('❌ HOD review failed:', hodError);
        }
      }
    }

    console.log('\n🎉 Teacher review flow test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testTeacherReviewFlow();
