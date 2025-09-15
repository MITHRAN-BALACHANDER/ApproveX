import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const recreateAdmin = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Delete existing admin user
    await User.deleteOne({ email: 'admin@srishakthi.ac.in', role: 'admin' });
    console.log('🗑️ Deleted existing admin user');

    // Create new admin user (let the pre-save middleware handle password hashing)
    const plainPassword = 'admin123';

    const adminData = {
      email: 'admin@srishakthi.ac.in',
      password: plainPassword, // Use plain password, let middleware hash it
      role: 'admin',
      profile: {
        fullName: 'Super Admin',
        adminLevel: 'super_admin'
      },
      isActive: true,
      emailVerified: true
    };

    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully');
    console.log('Email: admin@srishakthi.ac.in');
    console.log('Password: admin123');

    // Test the new admin credentials
    const testAdmin = await User.findOne({ email: 'admin@srishakthi.ac.in', role: 'admin' });
    const isPasswordCorrect = await testAdmin.comparePassword('admin123');
    
    console.log('\n🔍 Testing new admin credentials:');
    console.log('Password comparison result:', isPasswordCorrect);
    
    if (isPasswordCorrect) {
      console.log('✅ Admin login credentials are working correctly!');
    } else {
      console.log('❌ Still having issues with password comparison');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

recreateAdmin().catch(console.error);
