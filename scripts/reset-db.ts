import { neon } from '@netlify/neon';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function reset() {
    console.log('Resetting Database...');
    try {
        await sql`DROP TABLE IF EXISTS material_logs CASCADE`;
        await sql`DROP TABLE IF EXISTS settings CASCADE`;
        await sql`DROP TABLE IF EXISTS inventory CASCADE`;
        await sql`DROP TABLE IF EXISTS estimates CASCADE`;
        await sql`DROP TABLE IF EXISTS customers CASCADE`;
        await sql`DROP TABLE IF EXISTS users CASCADE`;
        console.log('Tables dropped.');
    } catch (e) {
        console.error('Drop failed:', e);
    }
}

reset();
