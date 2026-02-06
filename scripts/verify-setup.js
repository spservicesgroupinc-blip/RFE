#!/usr/bin/env node

/**
 * Database Setup Verification Script
 * 
 * This script helps verify that the database is properly configured and set up.
 * Run with: node scripts/verify-setup.js
 */

import { sql } from '../database/client.js';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, colors.green);
}

function error(message) {
  log(`✗ ${message}`, colors.red);
}

function info(message) {
  log(`ℹ ${message}`, colors.blue);
}

function warning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

async function checkConnection() {
  try {
    const result = await sql`SELECT NOW() as time, version() as version`;
    success('Database connection successful');
    info(`Server time: ${result[0].time}`);
    info(`PostgreSQL version: ${result[0].version.split(',')[0]}`);
    return true;
  } catch (err) {
    error('Database connection failed');
    console.error(err.message);
    return false;
  }
}

async function checkTables() {
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    if (tables.length === 0) {
      warning('No tables found in database');
      info('Run: npm run db:migrate');
      return false;
    }
    
    success(`Found ${tables.length} tables:`);
    tables.forEach(t => {
      console.log(`  - ${t.table_name}`);
    });
    
    const expectedTables = [
      'companies',
      'customers', 
      'estimates',
      'inventory',
      'equipment',
      'settings',
      'material_logs',
      'leads'
    ];
    
    const foundTables = tables.map(t => t.table_name);
    const missingTables = expectedTables.filter(t => !foundTables.includes(t));
    
    if (missingTables.length > 0) {
      warning(`Missing tables: ${missingTables.join(', ')}`);
      info('Run: npm run db:migrate');
      return false;
    }
    
    success('All expected tables are present');
    return true;
  } catch (err) {
    error('Failed to check tables');
    console.error(err.message);
    return false;
  }
}

async function checkExtensions() {
  try {
    const extensions = await sql`
      SELECT extname 
      FROM pg_extension 
      WHERE extname = 'uuid-ossp'
    `;
    
    if (extensions.length > 0) {
      success('UUID extension is enabled');
      return true;
    } else {
      warning('UUID extension not found');
      info('Run: npm run db:migrate');
      return false;
    }
  } catch (err) {
    error('Failed to check extensions');
    console.error(err.message);
    return false;
  }
}

async function verifySetup() {
  console.log('\n' + '='.repeat(60));
  log('Database Setup Verification', colors.blue);
  console.log('='.repeat(60) + '\n');
  
  // Check environment variable
  if (!process.env.DATABASE_URL) {
    error('DATABASE_URL environment variable is not set');
    info('Create a .env file with your Neon connection string');
    info('See DATABASE_SETUP.md for instructions');
    process.exit(1);
  }
  
  success('DATABASE_URL is configured');
  console.log();
  
  // Check connection
  log('Step 1: Testing database connection...', colors.yellow);
  const connectionOk = await checkConnection();
  console.log();
  
  if (!connectionOk) {
    error('Setup verification failed at connection step');
    info('Check your DATABASE_URL in .env file');
    info('Make sure your Neon database is active');
    process.exit(1);
  }
  
  // Check extensions
  log('Step 2: Checking database extensions...', colors.yellow);
  await checkExtensions();
  console.log();
  
  // Check tables
  log('Step 3: Checking database schema...', colors.yellow);
  const tablesOk = await checkTables();
  console.log();
  
  // Final summary
  console.log('='.repeat(60));
  if (connectionOk && tablesOk) {
    success('✓ Database setup is complete and verified!');
    info('You can now start using the application');
  } else {
    warning('⚠ Database setup is incomplete');
    info('Follow the steps in DATABASE_SETUP.md to complete setup');
  }
  console.log('='.repeat(60) + '\n');
  
  process.exit(tablesOk ? 0 : 1);
}

// Run verification
verifySetup().catch(err => {
  error('Unexpected error during verification');
  console.error(err);
  process.exit(1);
});
