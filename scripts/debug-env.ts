import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

console.log('Current working directory:', process.cwd());

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    console.log('.env file FOUND at:', envPath);
} else {
    console.log('.env file NOT FOUND at:', envPath);
}

const result = dotenv.config();
if (result.error) {
    console.error('dotenv load error:', result.error);
} else {
    console.log('dotenv loaded contents:', Object.keys(result.parsed || {}));
}

console.log('DATABASE_URL is set:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
    console.log('DATABASE_URL starts with:', process.env.DATABASE_URL.substring(0, 15) + '...');
}
