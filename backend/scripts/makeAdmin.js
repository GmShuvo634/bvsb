// backend/scripts/makeAdmin.js
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/userModel');

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node makeAdmin.js <email>');
    process.exit(1);
  }

  // connect to your MongoDB
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }

  // find the user
  const user = await User.findOne({ email });
  if (!user) {
    console.error(`❌ No user found with email ${email}`);
    process.exit(1);
  }

  // flip isAdmin
  user.isAdmin = true;
  await user.save();
  console.log(`✅ ${email} is now an admin`);
  process.exit(0);
}

main();

