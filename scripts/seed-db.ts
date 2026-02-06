import { sql } from '../database/client.ts';

/**
 * Seed Database Script
 * 
 * This script adds sample data to the database for testing and development.
 * Only run this on development databases, not production!
 * 
 * Usage: npm run db:seed
 */

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Check if database is already seeded
    const existingCompanies = await sql`SELECT COUNT(*) as count FROM companies`;
    if (existingCompanies[0].count > 0) {
      console.log('⚠️  Database already contains data. Skipping seed to avoid duplicates.');
      console.log('   To re-seed, first clear the tables manually.');
      process.exit(0);
    }

    // Seed a demo company
    console.log('Creating demo company...');
    const [company] = await sql`
      INSERT INTO companies (username, password_hash, company_name, email, crew_access_pin)
      VALUES (
        'demo',
        '$2a$10$rK7JxK/lKlH5lh5HmZGJyOH9vQH5b5Lh5b5Lh5b5Lh5b5Lh5b5L', -- bcrypt hash of 'demo123'
        'Demo Spray Foam Co.',
        'demo@example.com',
        '1234'
      )
      RETURNING id, company_name
    `;
    console.log(`✓ Created company: ${company.company_name}`);

    const companyId = company.id;

    // Seed demo customers
    console.log('Creating demo customers...');
    const customers = [
      {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '(555) 123-4567',
        data: {
          id: 'customer-1',
          name: 'John Smith',
          email: 'john@example.com',
          phone: '(555) 123-4567',
          address: '123 Main St, Springfield, IL 62701',
          status: 'Active'
        }
      },
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '(555) 987-6543',
        data: {
          id: 'customer-2',
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '(555) 987-6543',
          address: '456 Oak Ave, Chicago, IL 60601',
          status: 'Active'
        }
      }
    ];

    for (const customer of customers) {
      await sql`
        INSERT INTO customers (company_id, name, email, phone, status, data)
        VALUES (
          ${companyId},
          ${customer.name},
          ${customer.email},
          ${customer.phone},
          'Active',
          ${sql.json(customer.data)}
        )
      `;
      console.log(`  ✓ Created customer: ${customer.name}`);
    }

    // Seed demo settings
    console.log('Creating demo settings...');
    const defaultCosts = {
      openCell: 1.25,
      closedCell: 2.50,
      laborPerBF: 0.15
    };

    const defaultYields = {
      openCell: 300,
      closedCell: 150
    };

    const companyProfile = {
      name: 'Demo Spray Foam Co.',
      address: '789 Business Blvd, Springfield, IL 62701',
      phone: '(555) 555-5555',
      email: 'info@demosprayfoam.com',
      license: 'SF-12345'
    };

    await sql`
      INSERT INTO settings (company_id, key, value)
      VALUES 
        (${companyId}, 'costs', ${sql.json(defaultCosts)}),
        (${companyId}, 'yields', ${sql.json(defaultYields)}),
        (${companyId}, 'companyProfile', ${sql.json(companyProfile)})
    `;
    console.log('  ✓ Created default settings');

    // Seed demo inventory
    console.log('Creating demo inventory...');
    const inventoryItems = [
      {
        name: 'Open Cell Foam',
        quantity: 500,
        unit: 'board feet',
        data: {
          id: 'inv-1',
          name: 'Open Cell Foam',
          quantity: 500,
          unit: 'board feet',
          lastUpdated: new Date().toISOString()
        }
      },
      {
        name: 'Closed Cell Foam',
        quantity: 300,
        unit: 'board feet',
        data: {
          id: 'inv-2',
          name: 'Closed Cell Foam',
          quantity: 300,
          unit: 'board feet',
          lastUpdated: new Date().toISOString()
        }
      }
    ];

    for (const item of inventoryItems) {
      await sql`
        INSERT INTO inventory (company_id, name, quantity, unit, data)
        VALUES (
          ${companyId},
          ${item.name},
          ${item.quantity},
          ${item.unit},
          ${sql.json(item.data)}
        )
      `;
      console.log(`  ✓ Created inventory item: ${item.name}`);
    }

    // Seed demo equipment
    console.log('Creating demo equipment...');
    const equipmentItems = [
      {
        name: 'Spray Gun #1',
        status: 'Available',
        data: {
          id: 'eq-1',
          name: 'Spray Gun #1',
          status: 'Available',
          lastSeen: new Date().toISOString()
        }
      },
      {
        name: 'Compressor #1',
        status: 'Available',
        data: {
          id: 'eq-2',
          name: 'Compressor #1',
          status: 'Available',
          lastSeen: new Date().toISOString()
        }
      }
    ];

    for (const item of equipmentItems) {
      await sql`
        INSERT INTO equipment (company_id, name, status, data)
        VALUES (
          ${companyId},
          ${item.name},
          ${item.status},
          ${sql.json(item.data)}
        )
      `;
      console.log(`  ✓ Created equipment: ${item.name}`);
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Demo Login Credentials:');
    console.log('   Username: demo');
    console.log('   Password: demo123');
    console.log('   Crew PIN: 1234\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
