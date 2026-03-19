import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

const pinecone = process.env.PINECONE_API_KEY && process.env.PINECONE_API_KEY !== 'your_pinecone_key'
  ? new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
  : null;

/**
 * Get the divine index for the Oracle.
 * @returns {import('@pinecone-database/pinecone').Index | null}
 */
export const getOracleIndex = () => {
  if (!pinecone) {
    console.warn('🕉️ Pinecone not configured. The Oracle is currently offline.');
    return null;
  }
  return pinecone.index('devlok-oracle');
};

export default pinecone;
