import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully!');
    
    // Find all users and their roles
    const users = await User.find({}, 'email role profile.fullName isActive isEmailVerified');
    
    console.log('\n--- All Users in Database ---');
    console.log(`Total users found: ${users.length}`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Name: ${user.profile?.fullName || 'N/A'}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Email Verified: ${user.isEmailVerified}`);
      console.log('   ---');
    });
    
    // Test specific student emails
    const testEmails = ['student@test.com', 'student1@test.com', 'test@student.com'];
    
    console.log('\n--- Testing Specific Student Emails ---');
    for (const email of testEmails) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        console.log(`✅ Found: ${email} -> Role: ${user.role}`);
      } else {
        console.log(`❌ Not found: ${email}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testUsers();
