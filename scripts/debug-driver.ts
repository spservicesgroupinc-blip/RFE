import { neon } from '@netlify/neon';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('DATABASE_URL missing');
    process.exit(1);
}

const sql = neon(connectionString);

async function debug() {
    console.log('--- Testing Tagged Template Syntax ---');
    try {
        const res1 = await sql`SELECT 1 as num`;
        console.log('Tagged template success:', res1);
    } catch (e) {
        console.error('Tagged template failed:', e);
    }

    console.log('--- Testing Function Call Syntax ---');
    try {
        // @ts-ignore
        const res2 = await sql('SELECT 1 as num');
        console.log('Function call success:', res2);
    } catch (e) {
        console.error('Function call failed (might be expected):', e);
    }

    console.log('--- Testing Multi-Statement via Tagged Template ---');
    try {
        const res3 = await sql`SELECT 1 as a; SELECT 2 as b;`;
        console.log('Multi-statement success:', res3);
    } catch (e) {
        console.error('Multi-statement failed:', e);
    }
}

debug();
