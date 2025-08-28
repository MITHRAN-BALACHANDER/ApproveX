import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testPassword() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully!');
    
    // Find the student user
    const student = await User.findOne({ email: 'mithrans23it@srishakthi.ac.in' });
    
    if (!student) {
      console.log('Student not found');
      return;
    }
    
    console.log('Student found:', student.email, 'Role:', student.role);
    
    // Common passwords to test
    const testPasswords = ['123456', 'password', 'student123', 'mithran', 'Mithran', 'mithrans'];
    
    console.log('\nTesting common passwords...');
    for (const password of testPasswords) {
      const isMatch = await bcryptjs.compare(password, student.password);
      if (isMatch) {
        console.log(`✅ Password found: "${password}"`);
        return;
      } else {
        console.log(`❌ Not: "${password}"`);
      }
    }
    
    console.log('\nNo common password matched. You may need to reset the password.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testPassword();
