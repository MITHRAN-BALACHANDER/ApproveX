import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odprovider';

async function resetTeacherPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔌 Connected to MongoDB');

    // Find the teacher
    const teacher = await User.findOne({ email: 'jane.doe@yahoo.com' });
    if (!teacher) {
      console.log('❌ Teacher not found');
      return;
    }

    console.log(`👩‍🏫 Found teacher: ${teacher.email}`);
    
    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('teacher123', salt);
    
    // Update the password
    teacher.password = hashedPassword;
    await teacher.save();
    
    console.log('✅ Password updated successfully');
    
    // Test the new password
    const isMatch = await teacher.comparePassword('teacher123');
    console.log(`🔑 Password test: ${isMatch ? '✅ Success' : '❌ Failed'}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

resetTeacherPassword();
