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
    process.exit(1);
}

const sql = neon(connectionString);

async function migrate() {
    console.log('Starting logs migration...');

    try {
        const schemaPath = path.resolve(__dirname, '../database/schema_logs.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        const cleanSql = schemaSql.replace(/--.*$/gm, '');
        const statements = cleanSql.split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const stmt of statements) {
            // @ts-ignore
            const query = [stmt];
            // @ts-ignore
            query.raw = [stmt];
            // @ts-ignore
            await sql(query);
        }
        console.log('Logs migration successful.');
    } catch (error) {
        console.error('Logs migration failed:', error);
        process.exit(1);
    }
}

migrate();
