# Database Setup Checklist

Use this checklist to ensure you've completed all steps for setting up the backend database.

## Pre-Setup

- [ ] You have a Neon account ([Sign up here](https://neon.tech))
- [ ] Node.js 18+ is installed (`node --version`)
- [ ] npm is installed (`npm --version`)

## Neon Database Setup

- [ ] Created a new Neon project
- [ ] Copied the **pooled** connection string (port 6543)
- [ ] Connection string includes `?sslmode=require`

## Local Configuration

- [ ] Cloned the repository
- [ ] Ran `npm install` to install dependencies
- [ ] Copied `.env.example` to `.env`
- [ ] Updated `DATABASE_URL` in `.env` with your connection string

## Database Initialization

- [ ] Tested connection: `npm run db:test`
  - Should show: "Connected successfully!"
- [ ] Ran migrations: `npm run db:migrate`
  - Should show: "Migration completed successfully!"
- [ ] Verified setup: `npm run db:verify`
  - Should show all tables created

## Expected Tables

After migration, these tables should exist:

- [ ] `companies` - Company/tenant accounts
- [ ] `customers` - Customer profiles  
- [ ] `estimates` - Estimates/work orders/invoices
- [ ] `inventory` - Warehouse items
- [ ] `equipment` - Tools and machinery
- [ ] `settings` - Company configuration
- [ ] `material_logs` - Usage history
- [ ] `leads` - Trial signups

## Verification

You can verify the setup in multiple ways:

### Method 1: Use the verify script
```bash
npm run db:verify
```

### Method 2: Check Neon Console
1. Go to [Neon Console](https://console.neon.tech)
2. Open your project
3. Click "Tables" - you should see 8 tables

### Method 3: Test connection manually
```bash
npm run db:test
```

## Troubleshooting

If any step fails:

### Connection Issues
- [ ] Verified DATABASE_URL is correct in `.env`
- [ ] Checked that Neon database is not paused
- [ ] Confirmed connection string has `?sslmode=require`
- [ ] Tried waiting 30 seconds and retrying (cold start)

### Migration Issues  
- [ ] Checked if tables already exist
- [ ] Verified database user has CREATE privileges
- [ ] Reviewed Neon Console logs for errors

### Package Issues
- [ ] Ran `npm install` again
- [ ] Deleted `node_modules` and `package-lock.json`, then ran `npm install`

## Next Steps After Setup

- [ ] Update API handlers in `netlify/functions/api.ts`
- [ ] Implement authentication middleware
- [ ] Connect frontend to backend API
- [ ] Deploy to Netlify (see [DEPLOY.md](./DEPLOY.md))

## For Deployment to Netlify

- [ ] Added `DATABASE_URL` environment variable in Netlify
- [ ] Used the pooled connection string
- [ ] Tested deployment

## Resources

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Detailed setup guide
- [DEPLOY.md](./DEPLOY.md) - Deployment instructions
- [Neon Documentation](https://neon.tech/docs)
- [Neon Console](https://console.neon.tech)

---

**Need Help?** Check the troubleshooting section in [DATABASE_SETUP.md](./DATABASE_SETUP.md)
