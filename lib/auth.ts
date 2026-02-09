import { createAuthClient } from '@neondatabase/neon-js/auth';
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react/adapters';

// Get and validate the auth URL
const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

// Create auth client only if URL is available
// If missing, the App component will display ConfigurationError
export const authClient = authUrl 
  ? createAuthClient(authUrl, {
      adapter: BetterAuthReactAdapter(),
    })
  : null as any; // Will be checked before use in App.tsx
