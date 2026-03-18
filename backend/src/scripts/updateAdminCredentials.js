/**
 * Update the super admin email, password, or name.
 *
 * Usage:
 *   cd e:/CampusConnect/backend
 *   node src/scripts/updateAdminCredentials.js
 *
 * Pass new values via env vars:
 *   NEW_EMAIL=admin@example.com NEW_PASSWORD=newpass123 node src/scripts/updateAdminCredentials.js
 *
 * If not provided, defaults below are used.
 */
'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

// ── New credentials ────────────────────────────────────────────────────────
const NEW_EMAIL    = process.env.NEW_EMAIL    || 'admin@campusconnect.io';
const NEW_PASSWORD = process.env.NEW_PASSWORD || 'admin123';
const NEW_NAME     = process.env.NEW_NAME     || null; // null = keep existing name
// ──────────────────────────────────────────────────────────────────────────

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  const admin = await User.findOne({ role: 'superAdmin' });
  if (!admin) {
    console.error('No super admin found. Run createSuperAdmin.js first.');
    await mongoose.disconnect();
    process.exit(1);
  }

  const oldEmail = admin.email;

  admin.email    = NEW_EMAIL;
  admin.password = NEW_PASSWORD; // pre-save hook re-hashes automatically
  if (NEW_NAME) admin.name = NEW_NAME;

  await admin.save();

  console.log('✅ Super admin credentials updated!');
  console.log(`   Old email : ${oldEmail}`);
  console.log(`   New email : ${admin.email}`);
  console.log(`   Password  : ${NEW_PASSWORD}`);
  console.log(`   Name      : ${admin.name}`);
  console.log('   Login at  : /admin/login');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Failed to update credentials:', err.message);
  process.exit(1);
});
