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
        // Passing as array to simulate tagged template args: sql(['string'])
        // @ts-ignore - Allowing raw string execution for migration
        await sql([schemaSql] as any);

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
