import mongoose from 'mongoose';
import DutyRequest from './models/DutyRequest.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkRequests() {
  try {
    // Connect to MongoDB Atlas
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    await mongoose.connect(MONGODB_URI);
    console.log('🔌 Connected to MongoDB Atlas');

    const requests = await DutyRequest.find()
      .populate('studentId', 'profile.fullName email')
      .sort({ submittedAt: -1 });

    console.log(`📊 Found ${requests.length} duty request(s) in database:\n`);

    requests.forEach((request, index) => {
      console.log(`📝 Request ${index + 1}:`);
      console.log(`   🆔 ID: ${request._id}`);
      console.log(`   👤 Student: ${request.studentInfo?.fullName || 'Unknown'}`);
      console.log(`   📧 Email: ${request.studentInfo?.email || 'Unknown'}`);
      console.log(`   🎯 Event: ${request.eventDetails?.eventTitle || 'Unknown'}`);
      console.log(`   📅 Date: ${request.eventDetails?.dateRange?.startDate || 'Unknown'}`);
      console.log(`   🔄 Overall Status: ${request.overallStatus}`);
      console.log(`   👨‍🏫 Mentor Status: ${request.approvals?.mentor?.status || 'pending'}`);
      console.log(`   👨‍💼 HOD Status: ${request.approvals?.hod?.status || 'pending'}`);
      console.log(`   👨‍🎓 Principal Status: ${request.approvals?.principal?.status || 'pending'}`);
      console.log('');
    });

    if (requests.length === 0) {
      console.log('💡 No requests found. You can create test requests using the student interface.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

checkRequests();
