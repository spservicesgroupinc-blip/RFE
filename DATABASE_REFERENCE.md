# Database Quick Reference

Quick reference guide for working with the RFE database.

## Connection String Formats

### Pooled Connection (Recommended for App)
```
postgres://user:pass@ep-xxx.region.aws.neon.tech:6543/dbname?sslmode=require
```
- Use for: Application queries, Netlify Functions
- Port: 6543 (default for pooled)
- Best for: High concurrency, serverless functions

### Direct Connection (For Migrations)
```
postgres://user:pass@ep-xxx.region.aws.neon.tech:5432/dbname?sslmode=require
```
- Use for: Running migrations
- Port: 5432 (standard PostgreSQL)
- Best for: Schema changes, admin tasks

## Common Commands

```bash
# Test connection
npm run db:test

# Run migrations (create schema)
npm run db:migrate

# Verify setup
npm run db:verify

# Seed demo data
npm run db:seed

# Start dev server
npm run dev
```

## Database Schema Overview

### Companies Table
- **Purpose**: Multi-tenant company accounts
- **Key Fields**: `id`, `username`, `password_hash`, `company_name`
- **Relations**: Parent to all other tables via `company_id`

### Customers Table
- **Purpose**: Customer profiles
- **Key Fields**: `id`, `company_id`, `name`, `email`, `phone`
- **Data**: Full `CustomerProfile` object in JSONB

### Estimates Table
- **Purpose**: Estimates, work orders, invoices
- **Key Fields**: `id`, `company_id`, `customer_id`, `status`, `total_value`
- **Status Values**: `Draft`, `Work Order`, `Invoiced`, `Paid`, `Archived`
- **Data**: Full `EstimateRecord` object in JSONB

### Inventory Table
- **Purpose**: Warehouse items
- **Key Fields**: `id`, `company_id`, `name`, `quantity`, `unit`
- **Data**: Full `WarehouseItem` object in JSONB

### Equipment Table
- **Purpose**: Tools and machinery tracking
- **Key Fields**: `id`, `company_id`, `name`, `status`
- **Status Values**: `Available`, `In Use`, `Maintenance`, `Lost`
- **Data**: Full `EquipmentItem` object in JSONB

### Settings Table
- **Purpose**: Key-value configuration store
- **Key Examples**: `costs`, `yields`, `companyProfile`, `lifetime_usage`
- **Data**: Flexible JSONB values

### Material Logs Table
- **Purpose**: Historical usage tracking
- **Key Fields**: `id`, `company_id`, `estimate_id`, `date`, `material_name`
- **Data**: Full `MaterialUsageLogEntry` object in JSONB

### Leads Table
- **Purpose**: Landing page signups
- **Key Fields**: `id`, `name`, `email`, `phone`

## Query Examples

### Using Neon Client

```typescript
import { sql } from './database/client';

// Simple query
const result = await sql`SELECT NOW()`;

// Parameterized query (safe from SQL injection)
const companyId = 'uuid-here';
const estimates = await sql`
  SELECT * FROM estimates 
  WHERE company_id = ${companyId}
`;

// Insert with JSONB
const data = { name: 'John', email: 'john@example.com' };
await sql`
  INSERT INTO customers (company_id, name, email, data)
  VALUES (${companyId}, ${data.name}, ${data.email}, ${sql.json(data)})
`;

// Update
await sql`
  UPDATE estimates 
  SET status = 'Paid'
  WHERE id = ${estimateId}
`;

// Delete (cascade will remove related records)
await sql`
  DELETE FROM customers 
  WHERE id = ${customerId}
`;
```

## Environment Variables

### Required
- `DATABASE_URL` - Neon connection string (pooled for app, direct for migrations)

### Getting Your Connection String
1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Click "Connection Details"
4. Copy the **Pooled connection** string
5. Add to `.env` file

## Netlify Functions Example

```typescript
// netlify/functions/api.ts
import { sql } from "../../database/client";

export default async (req: Request) => {
  const { action, payload } = await req.json();
  
  switch (action) {
    case 'FETCH_ESTIMATES':
      const { companyId } = payload;
      const records = await sql`
        SELECT * FROM estimates 
        WHERE company_id = ${companyId}
        ORDER BY created_at DESC
      `;
      return new Response(JSON.stringify({ data: records }));
      
    case 'CREATE_CUSTOMER':
      const { customer } = payload;
      const [newCustomer] = await sql`
        INSERT INTO customers (company_id, name, email, phone, data)
        VALUES (
          ${customer.companyId},
          ${customer.name},
          ${customer.email},
          ${customer.phone},
          ${sql.json(customer)}
        )
        RETURNING *
      `;
      return new Response(JSON.stringify({ data: newCustomer }));
  }
};
```

## Best Practices

### 1. Always Use Parameterized Queries
```typescript
// ✅ GOOD - Safe from SQL injection
const name = userInput;
await sql`SELECT * FROM customers WHERE name = ${name}`;

// ❌ BAD - Vulnerable to SQL injection
await sql`SELECT * FROM customers WHERE name = '${name}'`;
```

### 2. Use Transactions for Multiple Operations
```typescript
try {
  await sql`BEGIN`;
  await sql`INSERT INTO estimates ...`;
  await sql`UPDATE inventory ...`;
  await sql`COMMIT`;
} catch (error) {
  await sql`ROLLBACK`;
  throw error;
}
```

### 3. Enforce Multi-Tenancy
Always filter by `company_id`:
```typescript
// ✅ GOOD - Includes company_id
await sql`
  SELECT * FROM estimates 
  WHERE company_id = ${companyId} AND id = ${estimateId}
`;

// ❌ BAD - Could access other companies' data
await sql`SELECT * FROM estimates WHERE id = ${estimateId}`;
```

### 4. Handle JSONB Properly
```typescript
// Storing JSONB
await sql`
  INSERT INTO customers (data)
  VALUES (${sql.json(customerObject)})
`;

// Querying JSONB
await sql`
  SELECT * FROM customers 
  WHERE data->>'status' = 'Active'
`;
```

## Troubleshooting

### "Too many connections"
- You're not using the pooled connection string
- Solution: Use port 6543 (pooled) in `DATABASE_URL`

### "Connection timeout"
- Database is in scale-to-zero sleep mode
- Solution: Wait 5-10 seconds for cold start, or set minimum compute > 0

### "SSL required"
- Missing `?sslmode=require` in connection string
- Solution: Add `?sslmode=require` to end of connection string

### "Migration failed"
- Tables might already exist
- Solution: Drop tables or create new database branch

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [Neon SQL Query](https://neon.tech/docs/serverless/serverless-driver)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [Connection Pooling](https://neon.tech/docs/connect/connection-pooling)
