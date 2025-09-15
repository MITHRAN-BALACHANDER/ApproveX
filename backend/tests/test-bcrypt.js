import bcrypt from 'bcryptjs';

async function testPasswordHashing() {
  try {
    console.log('🧪 Testing password hashing...');
    
    const password = 'teacher123';
    
    // Test with salt rounds 10 (common default)
    const salt10 = await bcrypt.genSalt(10);
    const hash10 = await bcrypt.hash(password, salt10);
    const match10 = await bcrypt.compare(password, hash10);
    
    console.log(`🔐 Salt rounds 10:`);
    console.log(`   Hash: ${hash10.substring(0, 30)}...`);
    console.log(`   Match: ${match10 ? '✅ Yes' : '❌ No'}`);
    
    // Test with salt rounds 12 (used in User model)
    const salt12 = await bcrypt.genSalt(12);
    const hash12 = await bcrypt.hash(password, salt12);
    const match12 = await bcrypt.compare(password, hash12);
    
    console.log(`🔐 Salt rounds 12:`);
    console.log(`   Hash: ${hash12.substring(0, 30)}...`);
    console.log(`   Match: ${match12 ? '✅ Yes' : '❌ No'}`);
    
    // Test cross compatibility
    const crossMatch = await bcrypt.compare(password, hash10);
    console.log(`🔄 Cross match (password vs hash10): ${crossMatch ? '✅ Yes' : '❌ No'}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testPasswordHashing();
