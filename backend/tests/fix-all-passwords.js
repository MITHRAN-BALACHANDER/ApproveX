import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odprovider';

async function fixAllTeacherPasswords() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔌 Connected to MongoDB');

    // Find all teachers
    const teachers = await User.find({ role: 'teacher' });
    console.log(`📊 Found ${teachers.length} teacher(s) to fix:`);
    
    for (const teacher of teachers) {
      console.log(`\n👩‍🏫 Fixing password for: ${teacher.email}`);
      
      // Hash the password manually
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('teacher123', salt);
      
      // Update directly in database to bypass pre-save hook
      await User.updateOne(
        { _id: teacher._id },
        { $set: { password: hashedPassword } }
      );
      
      // Test the password
      const updatedTeacher = await User.findById(teacher._id);
      const isMatch = await updatedTeacher.comparePassword('teacher123');
      console.log(`   🔑 Password test: ${isMatch ? '✅ Success' : '❌ Failed'}`);
    }

    console.log('\n🎉 All teacher passwords have been fixed!');
    console.log('📝 Teachers can now login with password: teacher123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

fixAllTeacherPasswords();
