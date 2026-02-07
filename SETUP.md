# Setup Guide

This guide will help you set up the RFE application for local development.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Neon account (for authentication and database)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RFE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

4. **Configure Neon Auth** (Required for full functionality)
   
   a. Create a Neon project at [console.neon.tech](https://console.neon.tech)
   
   b. Enable Auth in your Neon project dashboard
   
   c. Copy your Auth URL from the Neon dashboard
   
   d. Update your `.env` file:
   ```env
   VITE_NEON_AUTH_URL=https://ep-xxx.neonauth.c-2.us-east-2.aws.neon.build/dbname/auth
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Troubleshooting

### Blank Page or "Loading..." Message

If you see a blank page or just "Loading...", check:

1. **Environment variables are set**: Ensure your `.env` file exists and contains `VITE_NEON_AUTH_URL`
2. **Restart the dev server**: After creating or modifying `.env`, restart the dev server
3. **Check browser console**: Open DevTools (F12) and look for error messages

### Configuration Warning

If you see a yellow warning box about "Authentication Not Configured":

- This means `VITE_NEON_AUTH_URL` is not set in your `.env` file
- Follow step 4 above to configure Neon Auth
- The app will still render the landing page, but authentication features won't work

### Tailwind CSS Not Loading

If styles don't appear:

- Check if your browser or ad blocker is blocking `cdn.tailwindcss.com`
- The app uses Tailwind CSS from CDN for development
- For production builds, Tailwind is bundled with the app

## Development

### Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run verify-auth` - Verify Neon Auth configuration

### Project Structure

- `App.tsx` - Main application component with routing
- `index.tsx` - Application entry point
- `lib/auth-client.ts` - Neon Auth client configuration
- `components/` - React components
- `context/` - React context providers
- `database/` - Database schemas and migrations
- `services/` - API service layer

## Additional Resources

- [Neon Auth Documentation](https://neon.tech/docs/guides/auth-overview)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [GitHub Actions Setup for Preview Branches](./GITHUB_ACTIONS_SETUP.md)

## CI/CD and Preview Environments

This repository includes a GitHub Actions workflow that automatically creates Neon database branches for each pull request. See [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) for setup instructions.

## Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review the browser console for errors
3. Ensure all environment variables are correctly set
4. Try deleting `node_modules` and running `npm install` again
