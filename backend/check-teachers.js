import mongoose from 'mongoose';
import User from './models/User.js';

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odprovider';

async function checkTeachers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔌 Connected to MongoDB');

    // Find all teachers
    const teachers = await User.find({ role: 'teacher' });
    console.log(`📊 Found ${teachers.length} teacher(s) in database:`);
    
    teachers.forEach((teacher, index) => {
      console.log(`\n👩‍🏫 Teacher ${index + 1}:`);
      console.log(`   📧 Email: ${teacher.email}`);
      console.log(`   👤 Name: ${teacher.profile?.fullName || 'N/A'}`);
      console.log(`   🏢 Department: ${teacher.profile?.department || 'N/A'}`);
      console.log(`   ✅ Active: ${teacher.isActive}`);
      console.log(`   📝 Verified: ${teacher.isEmailVerified}`);
    });

    if (teachers.length === 0) {
      console.log('\n⚠️  No teachers found in database!');
      console.log('💡 Run: node create-admin.js --teacher to create a test teacher');
    }

    // Check if JWT_SECRET is set
    console.log('\n🔐 JWT_SECRET check:');
    console.log(`   ${process.env.JWT_SECRET ? '✅ JWT_SECRET is set' : '❌ JWT_SECRET is missing'}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

checkTeachers();
