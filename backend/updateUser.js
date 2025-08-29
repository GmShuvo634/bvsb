// backend/updateUser.js
require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/userModel');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findById("686fc47e10292edccf393f4d");
  if (!user) return console.error("User not found");
  user.avatar  = "https://example.com/my-avatar.png";
  user.country = "🇬🇧 United Kingdom";
  await user.save();
  console.log("✅ Updated:", user);
  mongoose.disconnect();
}
run();

