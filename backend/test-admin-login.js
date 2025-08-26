import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const testAdminLogin = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@srishakthi.ac.in', role: 'admin' });
    
    if (!admin) {
      console.log('❌ No admin user found');
      return;
    }

    console.log('✅ Admin user found:');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Full Name:', admin.profile?.fullName);
    console.log('Password Hash:', admin.password.substring(0, 20) + '...');
    console.log('Is Active:', admin.isActive);

    // Test password comparison
    const testPassword = 'admin123';
    console.log('\n🔍 Testing password comparison...');
    console.log('Test password:', testPassword);
    
    const isMatch = await admin.comparePassword(testPassword);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('❌ Password comparison failed');
      console.log('Trying to hash the test password to compare:');
      
      const bcrypt = await import('bcryptjs');
      const hashedTest = await bcrypt.hash(testPassword, 12);
      console.log('Test hash:', hashedTest.substring(0, 20) + '...');
      console.log('Stored hash:', admin.password.substring(0, 20) + '...');
    } else {
      console.log('✅ Password comparison successful');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

testAdminLogin().catch(console.error);
