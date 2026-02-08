# Migration to @netlify/neon

This document describes the migration from `@neondatabase/serverless` to `@netlify/neon`.

## What Changed

### Package
- **Before**: `@neondatabase/serverless`
- **After**: `@netlify/neon`

### Environment Variable
- **Before**: `DATABASE_URL`
- **After**: `NETLIFY_DATABASE_URL`

### Code Syntax

**Before:**
```typescript
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}
const sql = neon(databaseUrl);
```

**After:**
```typescript
import { neon } from '@netlify/neon';

// Automatically uses NETLIFY_DATABASE_URL
const sql = neon();
```

## Benefits

1. **Simpler API**: No need to explicitly pass the database URL
2. **Netlify Integration**: When deployed on Netlify with Neon integration, `NETLIFY_DATABASE_URL` is automatically populated
3. **Less Boilerplate**: Removes the need for error checking and manual URL passing
4. **Consistent with Netlify Best Practices**: Follows Netlify's recommended approach for Neon integration

## Migration Steps Completed

1. ✅ Updated `lib/backend/db.ts` to use `@netlify/neon`
2. ✅ Updated `.env.example` to use `NETLIFY_DATABASE_URL`
3. ✅ Updated all documentation files:
   - `DEPLOY.md`
   - `QUICKSTART.md`
   - `NEON_AUTH_SETUP.md`
   - `.github/copilot-instructions.md`
4. ✅ Updated verification script to support both old and new environment variables

## Testing

To test the migration locally:

1. Update your `.env` file:
   ```bash
   # Rename DATABASE_URL to NETLIFY_DATABASE_URL
   NETLIFY_DATABASE_URL=postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech:6543/dbname?sslmode=require
   ```

2. Run the verification script:
   ```bash
   npm run verify-auth
   ```

3. Run the test script:
   ```bash
   npx tsx scripts/test-netlify-neon.ts
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

## Backward Compatibility

The verification script (`scripts/verify-neon-auth.ts`) supports both `NETLIFY_DATABASE_URL` and `DATABASE_URL` for backward compatibility during the migration period.

## Deployment

When deploying to Netlify:

1. Update the environment variable in Netlify's dashboard:
   - Go to **Site Settings > Environment Variables**
   - Change `DATABASE_URL` to `NETLIFY_DATABASE_URL`
   - Or use Netlify's Neon integration which sets this automatically

2. Redeploy the application

## Files Changed

- `lib/backend/db.ts` - Core database client
- `.env.example` - Example environment configuration
- `DEPLOY.md` - Deployment instructions
- `QUICKSTART.md` - Quick start guide
- `NEON_AUTH_SETUP.md` - Auth setup instructions
- `.github/copilot-instructions.md` - GitHub Copilot instructions
- `scripts/verify-neon-auth.ts` - Verification script
- `scripts/test-netlify-neon.ts` - New test script (created)

## References

- [@netlify/neon Documentation](https://www.npmjs.com/package/@netlify/neon)
- [Netlify Neon Integration](https://docs.netlify.com/integrations/neon/)
- [Problem Statement Example](../problem_statement.md)
