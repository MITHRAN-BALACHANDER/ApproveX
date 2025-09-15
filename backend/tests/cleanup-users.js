import mongoose from 'mongoose';
import User from './models/User.js';

async function cleanupUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/odprovider');
    console.log('✅ Connected to MongoDB');
    
    // Check current users
    const users = await User.find({});
    console.log(`📊 Current users in database: ${users.length}`);
    
    if (users.length > 0) {
      console.log('🔍 Sample user data:');
      console.log(JSON.stringify(users[0], null, 2));
      
      // Delete all users
      const result = await User.deleteMany({});
      console.log(`🗑️ Deleted ${result.deletedCount} users from database`);
    } else {
      console.log('📭 No users found in database');
    }
    
    // Verify deletion
    const remainingUsers = await User.find({});
    console.log(`✅ Remaining users after cleanup: ${remainingUsers.length}`);
    
    // Disconnect
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    console.log('🎉 Cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupUsers();
