
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.resolve(__dirname, '../database/schema.sql');
console.log(`Resolved Schema Path: ${schemaPath}`);

try {
    if (fs.existsSync(schemaPath)) {
        console.log("File exists.");
        const content = fs.readFileSync(schemaPath, 'utf8');
        console.log(`Content length: ${content.length}`);
        console.log(`First 50 chars: ${content.substring(0, 50)}`);
    } else {
        console.error("File does NOT exist.");
    }
} catch (e) {
    console.error("Error reading file:", e);
}
