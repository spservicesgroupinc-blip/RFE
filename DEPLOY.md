# Deploy to Netlify with Neon Database

## Prerequisites
1.  **Netlify Account**
2.  **Neon Database Project** with:
    - Pooled connection string (for application queries)
    - Direct connection string (for running migrations)
    - Neon Auth URL from project dashboard

## Deployment Steps

### Step 1: Run Database Migration (if not done)

Before deploying your application, ensure the database schema is set up:

```bash
# Use the DIRECT connection string (port 5432) for migrations
psql "postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require" -f database/schema-with-auth.sql
```

**Important Notes:**
- Use the **direct** connection string (port 5432) for migrations, not the pooled connection
- This creates all required tables including Neon Auth tables (user, session, account, verification) and application tables (companies, customers, estimates, etc.)
- This only needs to be run once per database

**Getting your connection strings:**
1. Go to your Neon Project Dashboard
2. Navigate to the "Connection Details" section
3. Copy the **Pooled connection** string (for `NETLIFY_DATABASE_URL`)
4. Copy the **Direct connection** string (for running migrations)

### Step 2: Push to GitHub

Ensure your code is pushed to your repository:
```bash
git push origin main
```

### Step 3: Create New Site in Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git provider and select your repository
4. Configure build settings:
   - **Build Command**: `npm run build` (auto-detected from `netlify.toml`)
   - **Publish Directory**: `dist`

### Step 4: Configure Environment Variables (CRITICAL)

Go to **Site Settings > Environment Variables** and add the following:

#### Required Variables:

1. **NETLIFY_DATABASE_URL**
   - **Key**: `NETLIFY_DATABASE_URL`
   - **Value**: Your **pooled** connection string
   - **Example**: `postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech:6543/dbname?sslmode=require`
   - **Note**: Must use the **pooled** connection (port 6543) for best performance
   - **Note**: When using Netlify's Neon integration, this is automatically populated

2. **VITE_NEON_AUTH_URL**
   - **Key**: `VITE_NEON_AUTH_URL`
   - **Value**: Your Neon Auth URL
   - **Example**: `https://ep-xxx.neonauth.c-2.us-east-2.aws.neon.build/dbname/auth`
   - **Note**: This is required for authentication to work

**Getting VITE_NEON_AUTH_URL:**
1. Go to your Neon Project Dashboard
2. Navigate to the "Auth" tab
3. Copy the Auth URL (it should match the format: `https://ep-xxx.neonauth.c-X.region.aws.neon.build/dbname/auth`)

### Step 5: Deploy

1. Click "Deploy Site"
2. Wait for the build to complete (usually 1-2 minutes)
3. Once deployed, test your application:
   - Visit the site URL
   - Try signing up/logging in to verify auth works
   - Check that database operations work

## Post-Deployment Verification

After deployment, verify:
- [ ] Application loads without errors
- [ ] Authentication (sign up/login) works
- [ ] Database operations succeed
- [ ] No console errors in browser DevTools

## Troubleshooting

### 404 on Page Refresh
**Issue**: Getting 404 errors when refreshing on any route except home.
**Solution**: Ensure `netlify.toml` is present with the SPA redirect rule (already configured in this repo).

### Database Connection Error
**Issue**: Application shows database connection errors.
**Solution**: 
- Verify `NETLIFY_DATABASE_URL` is set correctly in Netlify environment variables
- Ensure you're using the **pooled** connection string (port 6543)
- Check that the connection string includes `?sslmode=require`

### Authentication Not Working
**Issue**: Login/signup fails or redirects incorrectly.
**Solution**:
- Verify `VITE_NEON_AUTH_URL` is set in Netlify environment variables
- Ensure the Auth URL format is correct: `https://ep-xxx.neonauth.c-X.region.aws.neon.build/dbname/auth`
- Check that database migration was run successfully (auth tables must exist)
- Redeploy after adding environment variables (Netlify requires rebuild)

### Build Failures
**Issue**: Build fails during deployment.
**Solution**:
- Check build logs in Netlify dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript code compiles locally with `npm run build`

### Migration Errors
**Issue**: Database migration fails.
**Solution**:
- Ensure you're using the **direct** connection string (port 5432), not pooled
- Check that you have proper database permissions
- If tables already exist, the migration will skip them (uses `CREATE TABLE IF NOT EXISTS`)

## Environment Variable Reference

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `NETLIFY_DATABASE_URL` | Yes | `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech:6543/db?sslmode=require` | Pooled connection (port 6543). Auto-populated by Netlify-Neon integration |
| `VITE_NEON_AUTH_URL` | Yes | `https://ep-xxx.neonauth.c-2.us-east-2.aws.neon.build/db/auth` | From Neon Auth tab |

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Neon Documentation](https://neon.tech/docs)
- [Neon Auth Setup Guide](./NEON_AUTH_SETUP.md) - Detailed auth configuration
- [Database Schema](./database/schema-with-auth.sql) - Complete database schema
