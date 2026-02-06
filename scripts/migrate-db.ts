import { neon } from '@netlify/neon';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('Error: DATABASE_URL environment variable is not defined.');
    process.exit(1);
}

const sql = neon(connectionString);

async function migrate() {
    console.log('Starting database migration...');

    try {
        const schemaPath = path.resolve(__dirname, '../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log(`Reading schema from: ${schemaPath}`);

        // Split by semicolons simple approach, or just run as one block if supported
        // Neon HTTP driver supports multi-statement queries in a single call usually,
        // but splitting ensures better error reporting per statement if needed.
        // For DDL, running as one block is often fine.

        await sql(schemaSql);

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
