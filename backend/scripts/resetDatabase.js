// backend/scripts/resetDatabase.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const GameRound = require('../models/GameRound');
const DemoSession = require('../models/DemoSession');
const AuditLog = require('../models/AuditLog');
const Pool = require('../models/Pool');

// Load environment variables
require('dotenv').config();

async function resetDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bvsb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear all collections
    console.log('Clearing all collections...');
    
    await User.deleteMany({});
    console.log('✓ Cleared Users collection');
    
    await GameRound.deleteMany({});
    console.log('✓ Cleared GameRounds collection');
    
    await DemoSession.deleteMany({});
    console.log('✓ Cleared DemoSessions collection');
    
    await AuditLog.deleteMany({});
    console.log('✓ Cleared AuditLogs collection');
    
    await Pool.deleteMany({});
    console.log('✓ Cleared Pools collection');

    // Create test user
    console.log('Creating test user...');
    
    const hashedPassword = await bcrypt.hash('12345678', 10);
    
    const testUser = new User({
      email: 'ahmedriazbepari@gmail.com',
      password: hashedPassword,
      balance: 1000,
      address: '',
      isAdmin: false,
      avatar: '',
      country: '',
      type: 'real'
    });

    await testUser.save();
    console.log('✓ Created test user:', {
      email: 'ahmedriazbepari@gmail.com',
      balance: 1000,
      id: testUser._id
    });

    // Create an admin user for testing
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = new User({
      email: 'admin@bvsb.com',
      password: adminPassword,
      balance: 10000,
      address: '',
      isAdmin: true,
      avatar: '',
      country: '',
      type: 'real'
    });

    await adminUser.save();
    console.log('✓ Created admin user:', {
      email: 'admin@bvsb.com',
      balance: 10000,
      id: adminUser._id
    });

    console.log('\n🎉 Database reset completed successfully!');
    console.log('\nTest Credentials:');
    console.log('User: ahmedriazbepari@gmail.com / 12345678');
    console.log('Admin: admin@bvsb.com / admin123');

  } catch (error) {
    console.error('❌ Database reset failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the reset
resetDatabase();
