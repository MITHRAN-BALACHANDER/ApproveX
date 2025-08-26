import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odprovider';

async function checkTeacherPasswords() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔌 Connected to MongoDB');

    // Find all teachers
    const teachers = await User.find({ role: 'teacher' });
    console.log(`📊 Found ${teachers.length} teacher(s):`);
    
    for (const teacher of teachers) {
      console.log(`\n👩‍🏫 Teacher: ${teacher.email}`);
      console.log(`   👤 Name: ${teacher.profile?.fullName}`);
      
      // Test password against teacher123
      const isPasswordCorrect = await teacher.comparePassword('teacher123');
      console.log(`   🔑 Password 'teacher123' matches: ${isPasswordCorrect ? '✅ Yes' : '❌ No'}`);
      
      if (!isPasswordCorrect) {
        console.log(`   🔍 Stored password hash: ${teacher.password.substring(0, 20)}...`);
        
        // Try with raw password (not hashed)
        const isRawPassword = teacher.password === 'teacher123';
        console.log(`   🔍 Is raw password: ${isRawPassword ? '✅ Yes (needs hashing)' : '❌ No'}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

checkTeacherPasswords();
