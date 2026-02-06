
import { neon } from '@netlify/neon';
import dotenv from 'dotenv';
dotenv.config();

async function checkConnection() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error("❌ DATABASE_URL is missing!");
        process.exit(1);
    }
    console.log("Found DATABASE_URL, attempting connection...");
    try {
        const sql = neon(url);
        const result = await sql`SELECT version()`;
        console.log("✅ Connection successful!");
        console.log("Database Version:", result[0].version);
    } catch (err) {
        console.error("❌ Connection failed:", err);
        process.exit(1);
    }
}

checkConnection();
