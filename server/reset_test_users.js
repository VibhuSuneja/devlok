import * as dotenv from 'dotenv';
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import connectDB from './config/db.js';

// Load directly to ensure process.env.MONGO_URI is populated
dotenv.config();

const run = async () => {
  await connectDB();
  
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const userPassword = await bcrypt.hash('user123', salt);

  // Upsert Admin
  await User.findOneAndUpdate(
    { email: 'admin@devlok.site' },
    { 
      name: 'Archivist Prime',
      email: 'admin@devlok.site',
      password: adminPassword,
      role: 'admin',
      shraddha: 50000
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Upsert Test User
  await User.findOneAndUpdate(
    { email: 'user@devlok.site' },
    { 
      name: 'Curious Scholar',
      email: 'user@devlok.site',
      password: userPassword,
      role: 'user',
      shraddha: 0
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('Test accounts successfully seeded/reset.');
  process.exit(0);
};

run().catch(console.error);
