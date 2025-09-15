import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odprovider';

async function fixTeacherPassword() {
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
    
    // Hash the password manually
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('teacher123', salt);
    
    // Update directly in database to bypass pre-save hook
    await User.updateOne(
      { email: 'jane.doe@yahoo.com' },
      { $set: { password: hashedPassword } }
    );
    
    console.log('✅ Password updated directly in database');
    
    // Reload the teacher and test
    const updatedTeacher = await User.findOne({ email: 'jane.doe@yahoo.com' });
    const isMatch = await updatedTeacher.comparePassword('teacher123');
    console.log(`🔑 Password test: ${isMatch ? '✅ Success' : '❌ Failed'}`);

    if (isMatch) {
      console.log('🎉 Teacher login should now work!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

fixTeacherPassword();
