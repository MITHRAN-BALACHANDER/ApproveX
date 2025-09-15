import mongoose from 'mongoose';
import User from './models/User.js';
import DutyRequest from './models/DutyRequest.js';

async function cleanupAllData() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/odprovider');
    console.log('✅ Connected to MongoDB');
    
    // Check and clean users
    const users = await User.find({});
    console.log(`📊 Current users in database: ${users.length}`);
    
    if (users.length > 0) {
      const userResult = await User.deleteMany({});
      console.log(`🗑️ Deleted ${userResult.deletedCount} users from database`);
    }
    
    // Check and clean duty requests
    const dutyRequests = await DutyRequest.find({});
    console.log(`📊 Current duty requests in database: ${dutyRequests.length}`);
    
    if (dutyRequests.length > 0) {
      const dutyResult = await DutyRequest.deleteMany({});
      console.log(`🗑️ Deleted ${dutyResult.deletedCount} duty requests from database`);
    }
    
    // Verify cleanup
    const remainingUsers = await User.find({});
    const remainingRequests = await DutyRequest.find({});
    
    console.log('✅ Final database state:');
    console.log(`   - Users: ${remainingUsers.length}`);
    console.log(`   - Duty Requests: ${remainingRequests.length}`);
    
    // Disconnect
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    console.log('🎉 Complete database cleanup finished!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupAllData();
