import fs from 'fs';
import path from 'path';
import { pool } from '../database/client';

async function migrate() {
    try {
        console.log('Starting migration...');

        const schemaPath = path.resolve(process.cwd(), 'database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

        console.log(`Reading schema from ${schemaPath}`);

        // Execute the SQL schema
        await pool.query(schemaSql);

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
