// backend/scripts/createAdmin.js
require('dotenv').config();             
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('../models/userModel');  // ← correct path

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
  });
  
  const email    = 'admin@yourdomain.com';         // pick your admin email
  const password = 'supersecurepassword';          // pick a strong password
  const hashed   = await bcrypt.hash(password, 10);

  // remove any existing user with that email
  await User.deleteOne({ email });

  const admin = new User({
    email,
    password: hashed,
    isAdmin: true,    // your schema field
  });
  await admin.save();
  console.log(`✅ Admin created: ${email} / ${password}`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

