import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from "dotenv";
dotenv.config();

// MongoDB connection string - update if different
const MONGODB_URI = process.env.MONGODB_URI;
async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Admin details
    const adminData = {
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin',
      profile: {
        fullName: 'Super Admin',
        department: 'Administration',
        designation: 'System Administrator',
        adminLevel: 'super_admin'
      }
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin user already exists with email:', adminData.email);
      console.log('Use these credentials to login:');
      console.log('Email:', adminData.email);
      console.log('Password: admin123');
      await mongoose.connection.close();
      return;
    }

    // Create admin user
    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password: admin123');
    console.log('🎯 Role: Super Admin');
    console.log('\nYou can now login at: http://localhost:5173/admin/login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Additional function to create a teacher for testing
async function createTestTeacher() {
  try {
    await mongoose.connect(MONGODB_URI);

    const teacherData = {
      email: 'john.smith@gmail.com', // Using Gmail as example
      password: 'teacher123',
      role: 'teacher',
      profile: {
        fullName: 'John Smith',
        department: 'Computer Science',
        designation: 'Assistant Professor'
      }
    };

    const existingTeacher = await User.findOne({ email: teacherData.email });
    if (existingTeacher) {
      console.log('Test teacher already exists');
      await mongoose.connection.close();
      return;
    }

    const teacher = new User(teacherData);
    await teacher.save();

    console.log('✅ Test teacher created successfully!');
    console.log('📧 Email:', teacherData.email);
    console.log('🔑 Password: teacher123');
    console.log('🎯 Role: Teacher (Mentor Level)');
    console.log('ℹ️  Note: Teachers can use any email domain (Gmail, Yahoo, Outlook, etc.)');

  } catch (error) {
    console.error('❌ Error creating test teacher:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--teacher')) {
  createTestTeacher();
} else if (args.includes('--both')) {
  (async () => {
    await createAdmin();
    await createTestTeacher();
  })();
} else {
  createAdmin();
}
