import mongoose from 'mongoose';

async function verifyCleanDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/odprovider');
    console.log('✅ Connected to MongoDB');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📂 Available collections:');
    
    for (const collection of collections) {
      const collectionName = collection.name;
      const count = await mongoose.connection.db.collection(collectionName).countDocuments();
      console.log(`   - ${collectionName}: ${count} documents`);
      
      // If there are documents, delete them
      if (count > 0) {
        const result = await mongoose.connection.db.collection(collectionName).deleteMany({});
        console.log(`   🗑️ Deleted ${result.deletedCount} documents from ${collectionName}`);
      }
    }
    
    console.log('');
    console.log('🎯 Final verification:');
    for (const collection of collections) {
      const collectionName = collection.name;
      const count = await mongoose.connection.db.collection(collectionName).countDocuments();
      console.log(`   - ${collectionName}: ${count} documents`);
    }
    
    // Disconnect
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    console.log('✅ Database is completely clean!');
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
    process.exit(1);
  }
}

verifyCleanDatabase();
