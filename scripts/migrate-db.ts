import fs from 'fs';
import path from 'path';
import { sql } from '../database/client';

async function migrate() {
    try {
        console.log('Starting migration...');

        const schemaPath = path.resolve(process.cwd(), 'database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

        console.log(`Reading schema from ${schemaPath}`);

        // Execute the SQL schema
        // Note: passing a raw string to the tag function might require .unsafe or similar if strictly postgres.js
        // But for @neondatabase/serverless 'neon', specific raw execution usually needs to be formatted or specific call.
        // We'll try passing it as a single string argument, or assume the user wants `sql(query_string)`.
        // If this fails we might need `await sql(schemaSql)` if it supports function call.
        await sql(schemaSql);

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
