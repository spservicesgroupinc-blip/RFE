# RFE Spray Foam App

A React-based application for managing spray foam business operations with a Neon Serverless PostgreSQL backend.

## Quick Start

### 1. Database Setup
Follow the comprehensive guide to set up your Neon database:
```bash
# See detailed instructions in DATABASE_SETUP.md
npm install
npm run db:test    # Test connection
npm run db:migrate # Create schema
```

See **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** for complete database setup instructions.

### 2. Development
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

## Documentation
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Complete database setup guide
- **[DEPLOY.md](./DEPLOY.md)** - Netlify deployment instructions
- **`skills/neon-expert/SKILL.md`** - Neon database best practices and architecture

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run db:test` - Test database connection
- `npm run db:migrate` - Run database migrations
- `npm run db:verify` - Verify database setup
- `npm run db:seed` - Seed database with demo data (dev only)

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Database**: Neon Serverless PostgreSQL
- **Backend**: Netlify Functions
- **Deployment**: Netlify
