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
    console.log('Starting split database migration...');

    try {
        const schemaPath = path.resolve(__dirname, '../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Remove comments to avoid split issues? 
        // Basic regex to remove -- style comments might be good but let's try simple split first.
        // If we split by ; and there is a comment like -- ... ; ... it might break.
        // Let's strip comments first.

        const cleanSql = schemaSql.replace(/--.*$/gm, ''); // Remove single line comments
        const statements = cleanSql.split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`Found ${statements.length} statements.`);

        for (const stmt of statements) {
            console.log(`Executing: ${stmt.substring(0, 50)}...`);
            // Use the array hack
            const query = [stmt];
            // @ts-ignore
            query.raw = [stmt];
            // @ts-ignore
            await sql(query);
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
