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
    console.log('Starting migration with sql.unsafe()...');

    try {
        const schemaPath = path.resolve(__dirname, '../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Use sql.unsafe to execute raw SQL string (DDL)
        // This is required because tagged template literals parameterized expected values.
        // If sql.unsafe is not available on the neon instance, this will crash.
        // In that case we might need to cast sql to any or find another way.

        // @ts-ignore
        if (typeof sql.unsafe === 'function') {
            // @ts-ignore
            await sql.unsafe(schemaSql);
            console.log('Migration with sql.unsafe completed successfully.');
        } else {
            console.error('sql.unsafe is not a function. Neon driver version mismatch?');
            // Fallback: Try to pass it as a simple string call if the driver allows (some do)
            // @ts-ignore
            await sql(schemaSql);
        }

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
