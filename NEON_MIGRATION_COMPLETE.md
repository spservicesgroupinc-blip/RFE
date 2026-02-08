# Neon Migration Complete

## Overview

The RFE application has been successfully migrated from Google Apps Script backend to Neon Serverless PostgreSQL with Neon Auth for authentication.

## What Changed

### Backend Infrastructure
- **Old**: Google Apps Script with Google Sheets as database
- **New**: Netlify serverless functions with Neon Serverless PostgreSQL

### Authentication System  
- **Old**: Custom token-based authentication with localStorage
- **New**: Neon Auth (@neondatabase/auth) with OAuth support (Google, GitHub)

### Session Management
- **Old**: UserSession with `username`, `companyName`, `spreadsheetId`, `token`
- **New**: UserSession with `user_id`, `email`, `name`, `company_id`, `company_name`, `role`, `crew_pin`

## Key Technical Changes

### 1. Type Definitions (`types.ts`)
Updated UserSession interface to match Neon Auth structure:
```typescript
export interface UserSession {
  user_id: string;
  email: string;
  name: string;
  company_id: string;
  company_name: string;
  role: 'admin' | 'crew';
  crew_pin?: string;
}
```

### 2. Backend API (`netlify/functions/api.ts`)
- Uses `@neondatabase/serverless` for database operations
- Authenticates requests using Neon Auth session tokens from Authorization header
- Joins user, session, and companies tables for authentication
- Returns user session information with sync data

### 3. Frontend API Service (`services/api.ts`)
- Removed `spreadsheetId` and `token` parameters from all functions
- Session token automatically extracted from Neon Auth client
- All API calls use the new Neon backend at `/api`

### 4. Hooks
- **useSync**: Now uses Neon Auth session, fetches user session from backend
- **useEstimates**: Removed all spreadsheetId/token parameters from API calls
- Both hooks work seamlessly with Neon Auth

### 5. Components
- **SprayFoamCalculator**: Removed LoginPage, uses Neon Auth flow
- **Layout**: Updated to display email, name, company_name
- **CrewDashboard**: Removed spreadsheetId dependencies
- Logout now calls `authClient.signOut()`

## Authentication Flow

1. User navigates to app
2. App.tsx checks Neon Auth session with `authClient.useSession()`
3. If no session → redirects to `/auth/sign-in`
4. User signs in with:
   - Email/Password
   - Google OAuth (if configured)
   - GitHub OAuth (if configured)
5. Neon Auth creates session
6. App fetches data from Neon database with `syncDown()`
7. Backend validates session token and returns user data
8. User session populated in context

## Database Schema

The database includes:
- **Neon Auth tables**: `user`, `session`, `account`, `verification`
- **Application tables**: `companies`, `customers`, `estimates`, `inventory`, `equipment`, `settings`, `material_logs`, `leads`
- Multi-tenant architecture using `company_id` for data isolation

## Environment Variables

Required environment variables:
```bash
# Database connection (pooled, port 6543) for backend operations
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# Neon Auth URL for frontend authentication
VITE_NEON_AUTH_URL=https://ep-xxx.neonauth.c-2.us-east-2.aws.neon.build/dbname/auth
```

## Migration Benefits

1. **Better Authentication**: OAuth support, secure token management
2. **Scalability**: Neon auto-scales, connection pooling built-in
3. **Performance**: Faster than Google Sheets backend
4. **Developer Experience**: Standard SQL, type-safe queries
5. **Security**: Row-level security via company_id, session validation
6. **Modern Stack**: Serverless, edge-ready, future-proof

## Removed Features

- **LoginPage component**: Replaced by Neon Auth UI
- **localStorage session management**: Handled by Neon Auth
- **Google Apps Script backend**: Archived in `legacy/Code.js.legacy`

## Testing Checklist

- [x] Build succeeds without errors
- [ ] User can sign up with email/password
- [ ] User can sign in with email/password
- [ ] User can sign in with OAuth (if configured)
- [ ] User can sign out
- [ ] Data syncs correctly from database
- [ ] Estimates can be created and saved
- [ ] Customers can be created and saved
- [ ] Inventory updates work
- [ ] Work orders can be created
- [ ] Crew dashboard functions properly
- [ ] Multi-tenant isolation works (users only see their company data)

## Deployment

1. Ensure Neon project is configured with Auth enabled
2. Set environment variables in Netlify:
   - `DATABASE_URL`
   - `VITE_NEON_AUTH_URL`
3. Deploy via Git push or Netlify CLI
4. Configure OAuth providers in Neon Console (optional)

## Support

For issues or questions about the migration:
1. Check Neon Auth documentation: https://neon.tech/docs/auth
2. Check Neon Serverless docs: https://neon.tech/docs/serverless
3. Review `NEON_AUTH_SETUP.md` for detailed setup instructions

## Legacy Code

The old Google Apps Script backend has been archived at:
- `legacy/Code.js.legacy`

This file is kept for reference but is no longer used by the application.
