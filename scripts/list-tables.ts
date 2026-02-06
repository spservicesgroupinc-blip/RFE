import { neon } from '@netlify/neon';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function listTables() {
    try {
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;
        console.log('Tables found:', tables);
    } catch (e) {
        console.error('Error listing tables:', e);
    }
}

listTables();
