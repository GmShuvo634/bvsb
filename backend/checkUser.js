// backend/checkUser.js
require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/userModel');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser:    true,
      useUnifiedTopology: true,
    });
    console.log('🔗 Connected to MongoDB');

    const id = "686fc47e10292edccf393f4d"; // the _id from your token
    const user = await User.findById(id);
    if (!user) {
      console.log(`❌ No user found with _id=${id}`);
    } else {
      console.log('✅ User found:', user);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.connection.close();
  }
}

run();

