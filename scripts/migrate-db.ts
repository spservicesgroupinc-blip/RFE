import { Pool, neonConfig } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ws from 'ws';

dotenv.config();

neonConfig.webSocketConstructor = ws;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('Error: DATABASE_URL environment variable is not defined.');
    process.exit(1);
}

const pool = new Pool({ connectionString });

async function migrate() {
    console.log('Starting database migration...');

    try {
        const schemaPath = path.resolve(__dirname, '../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log(`Reading schema from: ${schemaPath}`);

        // Execute the schema SQL
        await pool.query(schemaSql);

        console.log('Migration completed successfully.');
    } catch (error: any) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
