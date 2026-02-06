import { neon } from '@netlify/neon';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function debug() {
    console.log('Testing tag hack...');
    try {
        // Mocking the TemplateStringsArray
        const query = ['SELECT 1 as num'];
        // @ts-ignore
        query.raw = ['SELECT 1 as num'];

        // @ts-ignore
        const res = await sql(query);
        console.log('Success:', res);
    } catch (e) {
        console.error('Failed:', e);
    }
}

debug();
