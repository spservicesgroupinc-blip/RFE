# Neon Auth Setup Guide

This guide explains how to set up Neon Auth for the RFE application.

## Prerequisites

1. A Neon account (sign up at https://neon.tech)
2. A Neon project with a database created

## Step 1: Enable Neon Auth in your Neon Project

1. Go to your Neon project dashboard at https://console.neon.tech
2. Navigate to the **Auth** tab in the left sidebar
3. Click **Enable Auth** to activate authentication for your project
4. Configure your OAuth providers (optional):
   - **Google**: Add your Google OAuth Client ID and Secret
   - **GitHub**: Add your GitHub OAuth App Client ID and Secret
5. Copy your **Auth URL** - it will look like:
   ```
   https://ep-xxx.neonauth.c-2.us-east-2.aws.neon.build/dbname/auth
   ```

## Step 2: Set up your Database Schema

Run the migration script to create all required tables:

```bash
# Using psql with your Neon connection string
psql "postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require" -f database/schema-with-auth.sql

# Or using a migration script (if available)
npm run migrate
```

The schema includes:
- **Neon Auth tables**: `user`, `session`, `account`, `verification`
- **Application tables**: `companies`, `customers`, `estimates`, `inventory`, `equipment`, `settings`, `material_logs`, `leads`

## Step 3: Configure Environment Variables

Create a `.env` file in the root of your project (use `.env.example` as a template):

```bash
# Database connection (for backend/server operations only)
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# Neon Auth URL (from Step 1)
VITE_NEON_AUTH_URL=https://ep-xxx.neonauth.c-2.us-east-2.aws.neon.build/dbname/auth
```

**Important Notes:**
- `DATABASE_URL` is for server-side operations only - never expose this to the client
- `VITE_NEON_AUTH_URL` is safe to expose to the client as it's designed for frontend auth

## Step 4: Install Dependencies

The required packages should already be installed, but if needed:

```bash
npm install @neondatabase/auth @neondatabase/serverless react-router-dom
```

## Step 5: Run the Application

```bash
npm run dev
```

The application will be available at http://localhost:5173 (or the port shown in your terminal).

## Features

### Authentication Pages

The following auth routes are automatically available:

- `/auth/sign-in` - Sign in page
- `/auth/sign-up` - Sign up page  
- `/auth/forgot-password` - Password reset request
- `/auth/reset-password` - Set new password
- `/auth/sign-out` - Sign out

### Authentication Methods

Users can authenticate using:

1. **Email/Password** - Traditional email and password authentication
2. **Google OAuth** - Sign in with Google (if configured in Neon Console)
3. **GitHub OAuth** - Sign in with GitHub (if configured in Neon Console)

### Protected Routes

The main application content is protected and requires authentication:
- Users must sign in to access the spray foam calculator
- Unauthenticated users are redirected to the sign-in page

## File Structure

```
/
├── lib/
│   ├── auth-client.ts         # Auth client configuration
│   └── backend/
│       └── db.ts               # Backend database utilities
├── database/
│   ├── schema.sql              # Original schema
│   ├── schema-with-auth.sql    # Schema with Neon Auth tables
│   └── client.ts               # Database client
├── providers.tsx               # Auth provider wrapper
├── App.tsx                     # Main app with routes
├── index.tsx                   # Entry point with BrowserRouter
└── .env                        # Environment variables (create from .env.example)
```

## Usage in Components

### Get Current User Session

```typescript
import { authClient } from './lib/auth-client';

function MyComponent() {
  const session = authClient.useSession();
  
  if (session.isPending) return <div>Loading...</div>;
  if (!session.data) return <div>Not signed in</div>;
  
  return <div>Hello, {session.data.user.name}!</div>;
}
```

### Sign Out

```typescript
import { authClient } from './lib/auth-client';

async function handleSignOut() {
  await authClient.signOut();
  // User will be redirected automatically
}
```

### Use Built-in UI Components

```typescript
import { SignedIn, SignedOut, UserButton } from "@neondatabase/auth/react/ui";

function Navbar() {
  return (
    <nav>
      <SignedOut>
        <a href="/auth/sign-in">Sign In</a>
      </SignedOut>
      <SignedIn>
        <UserButton /> {/* Shows user avatar and dropdown */}
      </SignedIn>
    </nav>
  );
}
```

## Backend API Usage

For server-side operations (e.g., Netlify Functions, API routes):

```typescript
import { sql, getUserFromSession } from './lib/backend/db';

// Get user from session token
const user = await getUserFromSession(sessionToken);

// Query database with user context
if (user) {
  const customers = await sql`
    SELECT * FROM customers 
    WHERE company_id = (
      SELECT id FROM companies WHERE user_id = ${user.id}
    )
  `;
}
```

## Troubleshooting

### "VITE_NEON_AUTH_URL is not defined"

Make sure you've created a `.env` file with the correct auth URL from your Neon project.

### Auth pages not loading

Ensure `react-router-dom` is installed and the `BrowserRouter` is properly configured in `index.tsx`.

### OAuth not working

1. Verify OAuth providers are enabled in Neon Console (Auth tab)
2. Check that you've added the correct Client ID and Secret
3. Ensure your OAuth callback URL is configured correctly

### Database connection errors

1. Verify your `DATABASE_URL` in `.env` is correct
2. Make sure your IP is allowed in Neon's IP allowlist (if configured)
3. Check that the database schema has been applied

## Additional Resources

- [Neon Auth Documentation](https://neon.com/docs/auth)
- [Neon Console](https://console.neon.tech)
- [@neondatabase/auth on npm](https://www.npmjs.com/package/@neondatabase/auth)
