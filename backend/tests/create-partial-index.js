import mongoose from 'mongoose';

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/oddesk';

async function createPartialIndex() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔌 Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Create a simpler partial unique index for collegeEmail (only for students with collegeEmail)
    try {
      await collection.createIndex(
        { collegeEmail: 1 },
        { 
          unique: true,
          partialFilterExpression: { 
            role: 'student',
            collegeEmail: { $exists: true }
          },
          name: 'collegeEmail_student_partial'
        }
      );
      console.log('✅ Created partial unique index for student collegeEmail');
    } catch (error) {
      console.log('⚠️  Error creating partial index:', error.message);
    }

    // List indexes to confirm
    const indexes = await collection.listIndexes().toArray();
    console.log('📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createPartialIndex();
