# Database Setup Guide

This guide will help you set up the Neon Serverless PostgreSQL database for the RFE Spray Foam App.

## Prerequisites

1. **Neon Account**: Sign up at [neon.tech](https://neon.tech) if you don't have an account
2. **Node.js**: Version 18 or higher
3. **npm**: Comes with Node.js

## Step 1: Create a Neon Database

1. Log in to your [Neon Console](https://console.neon.tech)
2. Click **"New Project"**
3. Choose a project name (e.g., "rfe-spray-foam")
4. Select a region closest to your users
5. Click **"Create Project"**

## Step 2: Get Your Connection String

1. In the Neon Console, navigate to your project dashboard
2. Click on **"Connection Details"**
3. Copy the **Pooled connection** string (recommended for serverless apps)
   - It should look like: `postgres://user:password@ep-xxxxx.us-east-2.aws.neon.tech/dbname?sslmode=require`
   - The pooled connection uses port 6543 by default

## Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your connection string:
   ```bash
   DATABASE_URL="postgres://user:password@ep-xxxxx.us-east-2.aws.neon.tech/dbname?sslmode=require"
   ```

   **Important**: Make sure to use the **pooled connection** string for best performance with serverless apps.

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Test Database Connection

Before running migrations, verify your connection works:

```bash
npm run db:test
```

You should see:
```
Testing connection to Neon database...
Connected successfully!
Server time: [timestamp]
```

If you see an error:
- Double-check your `DATABASE_URL` in `.env`
- Ensure the connection string includes `?sslmode=require`
- Verify your Neon database is active (not paused)

## Step 6: Run Database Migrations

Create all the necessary tables and schema:

```bash
npm run db:migrate
```

You should see:
```
Starting migration...
Reading schema from /path/to/database/schema.sql
Migration completed successfully!
```

This creates the following tables:
- `companies` - Tenant/company accounts
- `customers` - Customer profiles
- `estimates` - Estimates, work orders, and invoices
- `inventory` - Warehouse items
- `equipment` - Tracked tools and machinery
- `settings` - Company configuration (key-value store)
- `material_logs` - Historical usage logs
- `leads` - Trial membership signups

## Step 7: Verify Schema

You can verify the schema was created successfully using the Neon Console:

1. Go to your project in the [Neon Console](https://console.neon.tech)
2. Click on **"Tables"** in the left sidebar
3. You should see all 8 tables listed

Or use the verification script:

```bash
npm run db:verify
```

This will check:
- Database connection
- All required tables exist
- UUID extension is enabled

## Step 8: Seed Demo Data (Optional)

For development and testing, you can add sample data:

```bash
npm run db:seed
```

This creates:
- A demo company account
- Sample customers
- Default settings and costs
- Sample inventory items
- Sample equipment

**Note**: Authentication is not yet implemented in this setup. The seed script creates a demo company with a placeholder password hash. You'll need to implement proper bcrypt password hashing and authentication middleware before using login functionality.

## Troubleshooting

### "DATABASE_URL environment variable is not defined"
- Make sure you created the `.env` file
- Check that `DATABASE_URL` is set correctly
- Verify there are no extra spaces or quotes

### "Connection timeout"
- Your Neon database might be in a "sleep" state (scale-to-zero)
- Wait a few seconds and try again
- Consider setting a minimum compute unit > 0 in Neon settings

### "Migration failed"
- Check if tables already exist (drop them if re-running)
- Verify your database user has CREATE privileges
- Check the Neon Console logs for detailed errors

### "SSL connection required"
- Make sure your connection string includes `?sslmode=require`
- Neon requires SSL for all connections

## For Netlify Deployment

When deploying to Netlify:

1. Go to **Site Settings > Environment Variables**
2. Add `DATABASE_URL` with your pooled connection string
3. Deploy your site

See [DEPLOY.md](./DEPLOY.md) for complete deployment instructions.

## Database Architecture

The schema uses:
- **UUID primary keys** for better distribution and security
- **JSONB columns** for flexible schema evolution (matching frontend TypeScript types)
- **Multi-tenancy** via `company_id` foreign keys
- **Automatic timestamps** with triggers for `updated_at` columns
- **Cascade deletes** to maintain referential integrity

## Next Steps

After setup:
1. Update the API handlers in `netlify/functions/api.ts` to implement CRUD operations
2. Add authentication middleware to enforce multi-tenancy
3. Connect the frontend to use the API endpoints

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [Neon Console](https://console.neon.tech)
- [Connection Pooling Guide](https://neon.tech/docs/connect/connection-pooling)
- [Database Branching](https://neon.tech/docs/guides/branching)
