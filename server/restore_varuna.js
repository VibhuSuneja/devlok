import 'dotenv/config';
import mongoose from 'mongoose';
import Character from './models/Character.js';
import connectDB from './config/db.js';

const restoreVaruna = async () => {
  await connectDB();
  
  await Character.findOneAndUpdate(
    { id: 'varuna' },
    {
      desc: "Ancient Vedic god of cosmic order (Rta), moral law, and the seas. He sees all through the stars and punishes oath-breakers. Often invoked alongside Mitra as the twin guardians of sacred law.",
      source: 'Rig Veda · Atharva Veda · Mahābhārata'
    }
  );

  console.log("Varuna restored to his original sacred essence.");
  process.exit(0);
};

restoreVaruna().catch(console.error);
