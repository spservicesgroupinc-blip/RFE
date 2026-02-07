# RFE Spray Foam App

A React-based application for managing spray foam business operations with a Neon Serverless PostgreSQL backend.

## Quick Start

### 1. Database Setup
The easiest way to set up your database is using the interactive setup script:
```bash
npm run db:setup
```

This will guide you through:
- Installing dependencies
- Configuring your Neon database connection
- Testing the connection
- Running migrations
- Optionally seeding demo data

For detailed manual setup instructions, see **[DATABASE_SETUP.md](./DATABASE_SETUP.md)**.

### 2. Development
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

## Documentation
- **[DATABASE_STATUS.md](./DATABASE_STATUS.md)** - Current setup status and overview
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Complete database setup guide
- **[DEPLOY.md](./DEPLOY.md)** - Netlify deployment instructions
- **`skills/neon-expert/SKILL.md`** - Neon database best practices and architecture

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run db:setup` - Interactive database setup (recommended)
- `npm run db:test` - Test database connection
- `npm run db:migrate` - Run database migrations
- `npm run db:verify` - Verify database setup
- `npm run db:seed` - Seed database with demo data (dev only)

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Database**: Neon Serverless PostgreSQL
- **Backend**: Netlify Functions
- **Deployment**: Netlify
