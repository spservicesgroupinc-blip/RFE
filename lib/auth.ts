import { createAuthClient } from '@neondatabase/neon-js/auth';
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react/adapters';

// Get and validate the auth URL
const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

// Type for the auth client (extract the return type of createAuthClient)
type AuthClient = ReturnType<typeof createAuthClient>;

// Create auth client only if URL is available
// If missing, index.tsx will display ConfigurationError
export const authClient: AuthClient | null = authUrl 
  ? createAuthClient(authUrl, {
      adapter: BetterAuthReactAdapter(),
    })
  : null;
