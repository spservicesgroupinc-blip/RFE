import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.warn('DATABASE_URL environment variable is not defined');
}

// Configured for Neon Serverless
// max: 10 - Prevent exhausting serverless compute resources (Neon loves pooling!)
// idleTimeoutMillis: 30000 - Close idle clients to save resources
export const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000
});
