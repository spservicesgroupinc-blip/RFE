import { sql } from '../database/client.ts';

async function testConnection() {
    try {
        console.log('Testing connection to Neon database...');
        const result = await sql`SELECT NOW()`;
        console.log('Connected successfully!');
        console.log('Server time:', result[0].now);
        process.exit(0);
    } catch (error) {
        console.error('Connection failed:', error);
        process.exit(1);
    }
}

testConnection();
