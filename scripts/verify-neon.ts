import { neon } from '@netlify/neon';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('DATABASE_URL is missing');
    process.exit(1);
}

const sql = neon(connectionString);

async function verify() {
    console.log('Verifying Neon connection...');
    try {
        const timeResult = await sql`SELECT NOW() as current_time`;
        console.log('Connection successful! Server time:', timeResult[0].current_time);

        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `;

        console.log('Current tables:', tables.map(t => t.table_name));

    } catch (err) {
        console.error('Verification failed:', err);
    }
}

verify();
