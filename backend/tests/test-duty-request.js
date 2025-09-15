import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

async function testDutyRequestSubmission() {
  try {
    console.log('🔑 Testing duty request submission...');

    // First, login as a student to get token
    console.log('🔑 Logging in as student...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'student@college.edu',
        password: 'student123'
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      console.log('❌ Student login failed:', error.message);
      return;
    }

    const loginData = await loginResponse.json();
    const studentToken = loginData.token;
    console.log('✅ Student login successful');

    // Create a mock file for testing
    const testFileContent = 'This is a test invitation document.';
    const testFilePath = path.join(process.cwd(), 'test-invitation.txt');
    fs.writeFileSync(testFilePath, testFileContent);

    // Prepare form data
    const formData = new FormData();
    
    const requestData = {
      studentInfo: {
        fullName: 'Test Student',
        registerNumber: 'REG123',
        department: 'Computer Science and Engineering',
        year: '3rd Year',
        section: 'A'
      },
      eventDetails: {
        reasonType: 'workshop',
        eventTitle: 'Technical Workshop on AI',
        eventTheme: 'Artificial Intelligence and Machine Learning',
        venue: {
          institutionName: 'Test University',
          city: 'Chennai',
          address: '123 Test Street'
        },
        dateRange: {
          startDate: '2025-09-01',
          endDate: '2025-09-03',
          startTime: '09:00',
          endTime: '17:00'
        },
        organizer: {
          name: 'Test Organizer',
          type: 'Educational Institution',
          contactInfo: 'test@example.com'
        }
      },
      academicDetails: {
        subjectsMissed: ['Subject 1', 'Subject 2'],
        undertaking: 'I undertake to compensate for all missed classes.'
      }
    };

    formData.append('requestData', JSON.stringify(requestData));
    formData.append('invitation', fs.createReadStream(testFilePath), 'test-invitation.txt');

    console.log('📝 Submitting duty request...');
    console.log('Request data:', JSON.stringify(requestData, null, 2));

    // Submit duty request
    const submitResponse = await fetch('http://localhost:5000/api/duty-requests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${studentToken}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    if (submitResponse.ok) {
      const result = await submitResponse.json();
      console.log('✅ Duty request submitted successfully!');
      console.log('Request ID:', result.dutyRequest?._id);
      console.log('Status:', result.dutyRequest?.overallStatus);
    } else {
      const error = await submitResponse.json();
      console.log('❌ Failed to submit duty request:');
      console.log('Status:', submitResponse.status);
      console.log('Error:', error);
    }

    // Clean up test file
    fs.unlinkSync(testFilePath);
    console.log('🧹 Cleaned up test file');

    console.log('\n🎉 Duty request submission test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDutyRequestSubmission();
