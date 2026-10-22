// Run with:  npm run create-admin   (inside the backend folder)
// Creates the first admin using ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD from backend/.env.
// The password is hashed before saving. Admins cannot be created from the website.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../database');
const User = require('../models/User');

async function createAdmin() {
  const name = (process.env.ADMIN_NAME || 'Admin').trim();
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';

  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env first.');
    process.exit(1);
  }
  if (password === 'change-this-password' || password.length < 8) {
    console.error('Please set a real ADMIN_PASSWORD (at least 8 characters) in backend/.env.');
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`A user with the email ${email} already exists (role: ${existing.role}). Nothing was changed.`);
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ name, email, passwordHash, role: 'admin' });
    console.log(`Admin account created for ${email}. You can now log in at /admin/login.`);
  }
  await mongoose.disconnect();
}

createAdmin().catch((err) => {
  console.error('Could not create admin:', err.message);
  process.exit(1);
});
