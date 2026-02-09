import { createAuthClient } from '@neondatabase/neon-js/auth';
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react/adapters';

// Validate that VITE_NEON_AUTH_URL is set
const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

if (!authUrl) {
  console.error(
    'VITE_NEON_AUTH_URL environment variable is not set. ' +
    'Please configure this in your Netlify environment variables. ' +
    'See NEON_AUTH_SETUP.md for details.'
  );
}

export const authClient = createAuthClient(
  authUrl || 'http://localhost:3000/fallback',
  {
    adapter: BetterAuthReactAdapter(),
  }
);
