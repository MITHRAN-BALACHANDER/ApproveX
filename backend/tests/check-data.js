import mongoose from 'mongoose';
import DutyRequest from './models/DutyRequest.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkData = async () => {
  await connectDB();
  
  // Check for duty requests
  const dutyRequests = await DutyRequest.find().populate('studentId');
  console.log('\n📊 Duty Requests in database:');
  console.log(`Total requests: ${dutyRequests.length}`);
  
  dutyRequests.forEach((request, index) => {
    console.log(`\n${index + 1}. Request ID: ${request._id}`);
    console.log(`   Student: ${request.studentInfo?.fullName || 'N/A'}`);
    console.log(`   Event: ${request.eventDetails?.eventTitle || 'N/A'}`);
    console.log(`   Status: ${request.overallStatus}`);
    console.log(`   Submitted: ${request.submittedAt}`);
    console.log(`   Mentor Status: ${request.approvals?.mentor?.status || 'pending'}`);
    console.log(`   HOD Status: ${request.approvals?.hod?.status || 'pending'}`);
    console.log(`   Principal Status: ${request.approvals?.principal?.status || 'pending'}`);
  });
  
  // Check for teachers
  const teachers = await User.find({ role: 'teacher' });
  console.log(`\n👨‍🏫 Teachers in database: ${teachers.length}`);
  teachers.forEach((teacher, index) => {
    console.log(`${index + 1}. ${teacher.email} - ${teacher.profile?.fullName || 'N/A'}`);
  });
  
  // Check for students
  const students = await User.find({ role: 'student' });
  console.log(`\n👨‍🎓 Students in database: ${students.length}`);
  students.forEach((student, index) => {
    console.log(`${index + 1}. ${student.email} - ${student.profile?.fullName || 'N/A'}`);
  });
  
  process.exit(0);
};

checkData().catch(console.error);
