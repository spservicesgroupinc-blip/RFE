# RFE - Spray Foam Estimation & Project Management

A comprehensive React-based application for spray foam contractors to manage estimates, customers, inventory, and equipment.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: Neon Auth
- **Deployment**: Netlify
- **Styling**: Tailwind CSS

## Quick Start

### Local Development

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd RFE
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Neon credentials
   ```

3. **Run Database Migration**
   ```bash
   psql "$DATABASE_URL" -f database/schema-with-auth.sql
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000

### Deployment

For complete deployment instructions to Netlify:
- 📚 See [DEPLOY.md](./DEPLOY.md) - Step-by-step deployment guide

### Documentation

- 🚀 [Quick Start Guide](./QUICKSTART.md) - Get started in 5 minutes
- 🔐 [Neon Auth Setup](./NEON_AUTH_SETUP.md) - Detailed authentication setup
- 🌐 [Deployment Guide](./DEPLOY.md) - Deploy to Netlify

## Features

- Customer & Lead Management
- Project Estimation & Quoting
- Material Inventory Tracking
- Equipment Management
- PDF Invoice Generation
- Crew Dashboards
- Multi-tenant Architecture

## Development

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Environment Variables

Required environment variables:
- `DATABASE_URL` - Neon pooled connection string
- `VITE_NEON_AUTH_URL` - Neon Auth URL

See `.env.example` for details.

## Project Structure

```
/
├── components/          # React components
├── context/            # React context providers
├── lib/                # Utilities and backend code
├── database/           # SQL schema files
├── backend/            # Netlify serverless functions
├── services/           # Business logic
└── utils/              # Helper functions
```

## License

Proprietary - SP Services Group Inc.
