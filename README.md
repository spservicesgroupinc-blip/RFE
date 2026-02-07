# RFE - Spray Foam Equipment Management System

Enterprise SaaS platform for spray foam equipment estimation and rig management.

## Quick Start

For detailed setup instructions, see [SETUP.md](./SETUP.md).

### Basic Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your Neon Auth URL in .env
# VITE_NEON_AUTH_URL=your-neon-auth-url

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Features

- **Algorithmic Estimation**: Calculate board footage and chemical yields with sub-1% variance
- **Rig Command Sync**: Sync sold jobs to touch-screen displays in foam rigs
- **Live Rig Telemetry**: Capture operational data and transmit back to admin dashboard
- **Financial Intelligence**: Automated P&L reconciliation per job

## Documentation

- [Setup Guide](./SETUP.md) - Complete setup instructions
- [Quick Start Guide](./QUICKSTART.md) - Quick start guide
- [Neon Auth Setup](./NEON_AUTH_SETUP.md) - Authentication configuration
- [Deployment Guide](./DEPLOY.md) - Production deployment

## Development

This is a React application built with:
- React 19
- TypeScript
- Vite
- Neon Serverless Postgres
- Neon Auth
- Tailwind CSS

## Troubleshooting

If you encounter issues with a blank page or loading screen:

1. Ensure `.env` file exists with `VITE_NEON_AUTH_URL` configured
2. Restart the development server after modifying `.env`
3. Check browser console for errors (F12)

See [SETUP.md](./SETUP.md) for more troubleshooting tips.

## License

Proprietary Software - © 2026 RFE Foam Equipment
