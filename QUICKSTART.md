# Quick Start: Neon Auth Setup

**✅ Migration Complete!** The RFE application has been successfully migrated to Neon Serverless PostgreSQL with Neon Auth. See [NEON_MIGRATION_COMPLETE.md](./NEON_MIGRATION_COMPLETE.md) for details.

This is a quick reference for setting up Neon Auth in the RFE application. For detailed instructions, see [NEON_AUTH_SETUP.md](./NEON_AUTH_SETUP.md).

## Prerequisites

1. Neon account with a project created
2. Auth enabled in your Neon project dashboard

## Setup (5 minutes)

### 1. Enable Auth in Neon Console

1. Go to https://console.neon.tech
2. Select your project
3. Click **Auth** tab → **Enable Auth**
4. Copy your Auth URL

### 2. Configure Environment

Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```bash
NETLIFY_DATABASE_URL=your-neon-database-url
VITE_NEON_AUTH_URL=your-neon-auth-url
```

### 3. Run Database Migration

```bash
# Option 1: Using psql
psql "$NETLIFY_DATABASE_URL" -f database/schema-with-auth.sql

# Option 2: Using any PostgreSQL client
# Connect to your database and run the schema-with-auth.sql file
```

### 4. Verify Setup

```bash
npm run verify-auth
```

This will check:
- ✅ Environment variables are set
- ✅ Database connection works
- ✅ Required tables exist

### 5. Start Development Server

```bash
npm install  # If not already done
npm run dev
```

Visit http://localhost:5173 and click "Sign In" to test!

## Available Routes

After setup, these routes are available:

- `/` - Main application (requires auth)
- `/auth/sign-in` - Sign in page
- `/auth/sign-up` - Create account
- `/auth/forgot-password` - Reset password
- `/auth/sign-out` - Sign out

## Authentication Methods

Users can sign in with:

- ✉️ Email & Password
- 🔐 Google OAuth (if configured)
- 🔐 GitHub OAuth (if configured)

To enable OAuth:
1. Go to Neon Console → Auth tab
2. Add OAuth provider credentials
3. Restart your dev server

## Troubleshooting

### Can't see sign-in page?
```bash
# Make sure react-router-dom is installed
npm install react-router-dom
```

### Database connection error?
```bash
# Verify your DATABASE_URL
echo $DATABASE_URL

# Test connection
psql "$DATABASE_URL" -c "SELECT version();"
```

### Auth not working?
```bash
# Run verification script
npm run verify-auth

# Check browser console for errors
# Open DevTools (F12) → Console tab
```

## What Got Installed?

New files added to your project:

```
lib/
├── auth-client.ts           # Frontend auth client
└── backend/
    ├── db.ts                # Backend database utilities
    └── api-examples.ts      # Example API handlers

database/
└── schema-with-auth.sql     # Complete DB schema with auth tables

providers.tsx                # Auth provider wrapper
.env.example                 # Environment template
NEON_AUTH_SETUP.md          # Detailed setup guide
```

Modified files:
- `App.tsx` - Added auth routes and protected content
- `index.tsx` - Added BrowserRouter and auth provider
- `package.json` - Added dependencies and verify-auth script

## Next Steps

1. **Customize the UI** - Modify `App.tsx` to change the look
2. **Add API endpoints** - See `lib/backend/api-examples.ts` for examples
3. **Protect routes** - Use `authClient.useSession()` in any component
4. **Deploy to Netlify** - See [DEPLOY.md](./DEPLOY.md) for complete deployment instructions

## Deployment

Ready to deploy? Check out our comprehensive deployment guide:

- 🚀 [Deploy to Netlify](./DEPLOY.md) - Step-by-step deployment with environment variables and database migration

The deployment guide covers:
- Setting up both required environment variables (`DATABASE_URL` and `VITE_NEON_AUTH_URL`)
- Running database migrations
- Troubleshooting common deployment issues

## Need Help?

- 📖 [Detailed Setup Guide](./NEON_AUTH_SETUP.md)
- 🚀 [Deployment Guide](./DEPLOY.md)
- 📚 [Neon Auth Docs](https://neon.com/docs/auth)
- 💬 [Neon Discord](https://discord.gg/neon)
