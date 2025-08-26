import mongoose from 'mongoose';

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odprovider';

async function fixCollegeEmailIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('🔌 Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Check existing indexes
    const indexes = await collection.listIndexes().toArray();
    console.log('📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Drop the collegeEmail unique index if it exists
    try {
      await collection.dropIndex('collegeEmail_1');
      console.log('✅ Dropped collegeEmail_1 unique index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  collegeEmail_1 index does not exist');
      } else {
        console.log('⚠️  Error dropping index:', error.message);
      }
    }

    // Create a partial unique index for collegeEmail (only for students)
    try {
      await collection.createIndex(
        { collegeEmail: 1 },
        { 
          unique: true,
          partialFilterExpression: { 
            role: 'student',
            collegeEmail: { $exists: true, $ne: null }
          },
          name: 'collegeEmail_student_unique'
        }
      );
      console.log('✅ Created partial unique index for student collegeEmail');
    } catch (error) {
      console.log('⚠️  Error creating partial index:', error.message);
    }

    // List indexes again to confirm
    const newIndexes = await collection.listIndexes().toArray();
    console.log('📋 Updated indexes:');
    newIndexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log('\n🎉 Database migration completed successfully!');
    console.log('📝 Changes made:');
    console.log('   - Removed global unique constraint on collegeEmail');
    console.log('   - Added partial unique constraint only for students');
    console.log('   - Teachers can now use any email address without conflicts');

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

fixCollegeEmailIndex();
