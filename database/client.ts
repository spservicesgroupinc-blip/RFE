import { neon } from '@netlify/neon';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.warn('DATABASE_URL environment variable is not defined');
}

// Configured for Neon Serverless via @netlify/neon
// This automatically handles connection pooling at the edge if available, or direct connection.
// It prioritizes NETLIFY_DATABASE_URL if present, otherwise falls back to the passed connection string.
export const sql = neon(connectionString);
