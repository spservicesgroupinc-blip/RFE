#!/usr/bin/env tsx

/**
 * Neon Auth Setup Verification Script
 * 
 * This script verifies that Neon Auth is properly configured
 * and the database schema includes all required tables.
 */

import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const VITE_NEON_AUTH_URL = process.env.VITE_NEON_AUTH_URL;

console.log('🔍 Verifying Neon Auth Setup...\n');

// Check environment variables
console.log('1. Checking environment variables...');
if (!DATABASE_URL) {
  console.error('   ❌ DATABASE_URL is not set in .env');
  process.exit(1);
}
console.log('   ✅ DATABASE_URL is set');

if (!VITE_NEON_AUTH_URL) {
  console.error('   ❌ VITE_NEON_AUTH_URL is not set in .env');
  process.exit(1);
}
console.log('   ✅ VITE_NEON_AUTH_URL is set');

// Verify database connection
console.log('\n2. Testing database connection...');
const sql = neon(DATABASE_URL);

try {
  const result = await sql`SELECT version()`;
  console.log('   ✅ Database connection successful');
  console.log(`   📊 PostgreSQL version: ${result[0].version.split(' ')[1]}`);
} catch (error) {
  console.error('   ❌ Failed to connect to database:', error);
  process.exit(1);
}

// Check for required Neon Auth tables
console.log('\n3. Checking for Neon Auth tables...');
const requiredAuthTables = ['user', 'session', 'account', 'verification'];

for (const tableName of requiredAuthTables) {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
      )
    `;
    
    if (result[0].exists) {
      console.log(`   ✅ Table "${tableName}" exists`);
    } else {
      console.log(`   ❌ Table "${tableName}" is missing`);
      console.log(`      Run: psql $DATABASE_URL -f database/schema-with-auth.sql`);
    }
  } catch (error) {
    console.error(`   ❌ Error checking table "${tableName}":`, error);
  }
}

// Check for application tables
console.log('\n4. Checking for application tables...');
const requiredAppTables = [
  'companies',
  'customers',
  'estimates',
  'inventory',
  'equipment',
  'settings',
  'material_logs',
  'leads'
];

for (const tableName of requiredAppTables) {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
      )
    `;
    
    if (result[0].exists) {
      console.log(`   ✅ Table "${tableName}" exists`);
    } else {
      console.log(`   ⚠️  Table "${tableName}" is missing (optional)`);
    }
  } catch (error) {
    console.error(`   ❌ Error checking table "${tableName}":`, error);
  }
}

// Check Auth URL format
console.log('\n5. Verifying Auth URL format...');
if (VITE_NEON_AUTH_URL.includes('neonauth') && VITE_NEON_AUTH_URL.endsWith('/auth')) {
  console.log('   ✅ Auth URL format looks correct');
} else {
  console.log('   ⚠️  Auth URL format may be incorrect');
  console.log('      Expected format: https://ep-xxx.neonauth.c-2.region.aws.neon.build/dbname/auth');
}

console.log('\n✅ Neon Auth setup verification complete!');
console.log('\nNext steps:');
console.log('1. If any auth tables are missing, run the migration:');
console.log('   psql "$DATABASE_URL" -f database/schema-with-auth.sql');
console.log('2. Start the dev server: npm run dev');
console.log('3. Navigate to http://localhost:5173/auth/sign-up to create an account');
console.log('\nFor more information, see NEON_AUTH_SETUP.md');
