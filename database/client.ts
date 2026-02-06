import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.warn('DATABASE_URL environment variable is not defined');
}

export const pool = new Pool({ connectionString });
