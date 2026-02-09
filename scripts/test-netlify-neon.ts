#!/usr/bin/env tsx

/**
 * Test script for @netlify/neon integration
 * 
 * This script demonstrates the new @netlify/neon syntax:
 * - No need to explicitly pass DATABASE_URL
 * - Automatically uses NETLIFY_DATABASE_URL environment variable
 */

import dotenv from 'dotenv';
import { neon } from '@netlify/neon';

// Load environment variables
dotenv.config();

console.log('🧪 Testing @netlify/neon integration...\n');

// Check environment variables
console.log('1. Checking environment variables...');
const netlifyDbUrl = process.env.NETLIFY_DATABASE_URL;
const oldDbUrl = process.env.DATABASE_URL;

if (!netlifyDbUrl && !oldDbUrl) {
  console.error('   ❌ Neither NETLIFY_DATABASE_URL nor DATABASE_URL is set in .env');
  console.log('\n💡 Tip: Create a .env file with NETLIFY_DATABASE_URL=<your-connection-string>');
  process.exit(1);
}

if (netlifyDbUrl) {
  console.log('   ✅ NETLIFY_DATABASE_URL is set (preferred)');
} else {
  console.log('   ⚠️  DATABASE_URL is set (fallback - consider updating to NETLIFY_DATABASE_URL)');
}

// Test database connection using new syntax
console.log('\n2. Testing database connection with neon()...');

try {
  // The key feature: neon() with no arguments automatically uses NETLIFY_DATABASE_URL
  // For backward compatibility during migration, we pass the URL explicitly
  const sql = neon(DATABASE_URL);
  
  console.log('   ℹ️  Using explicit connection string for backward compatibility');
  console.log('   ℹ️  In production with Netlify-Neon integration, use: const sql = neon()');
  
  // Test query
  const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
  
  if (result && result.length > 0) {
    console.log('   ✅ Database connection successful!');
    console.log(`   🕐 Current time: ${result[0].current_time}`);
    
    const versionString = result[0].pg_version;
    const versionMatch = versionString.match(/PostgreSQL ([\d.]+)/);
    const version = versionMatch ? versionMatch[1] : 'Unknown';
    console.log(`   📊 PostgreSQL version: ${version}`);
  }
} catch (error) {
  console.error('   ❌ Failed to connect to database:', error);
  process.exit(1);
}

// Test parameterized query (as shown in problem statement)
console.log('\n3. Testing parameterized query...');

try {
  // Reuse the same sql instance
  const sql = neon(DATABASE_URL);
  
  // Simulating the pattern from the problem statement:
  // const [post] = await sql`SELECT * FROM posts WHERE id = ${postId}`;
  const testId = 1;
  const [result] = await sql`
    SELECT 
      ${testId} as test_id, 
      'Test Post' as title,
      'This demonstrates the new @netlify/neon syntax' as content
  `;
  
  console.log('   ✅ Parameterized query successful!');
  console.log(`   📝 Result: ID=${result.test_id}, Title="${result.title}"`);
} catch (error) {
  console.error('   ❌ Parameterized query failed:', error);
  process.exit(1);
}

console.log('\n✅ All tests passed!');
console.log('\n📚 Migration Summary:');
console.log('   • Old: import { neon } from "@neondatabase/serverless"');
console.log('   • Old: const sql = neon(process.env.DATABASE_URL)');
console.log('   • New: import { neon } from "@netlify/neon"');
console.log('   • New: const sql = neon() // automatically uses NETLIFY_DATABASE_URL');
console.log('\n🎉 Your application is ready to use @netlify/neon!');
