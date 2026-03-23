import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

async function resetUser() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  const res = await User.updateOne(
    { email: 'testuser100@example.com' },
    { $set: { shraddha: 0, bookmarks: [], conceptsRead: [] } }
  );
  console.log('Update result:', res);
  await mongoose.disconnect();
}

resetUser().catch(console.error);
