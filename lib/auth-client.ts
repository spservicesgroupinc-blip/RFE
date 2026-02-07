import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthReactAdapter } from "@neondatabase/auth/react/adapters";

// Create auth client with Neon Auth URL from environment
const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

if (!authUrl) {
  console.warn(
    "⚠️ VITE_NEON_AUTH_URL is not defined. Please set it in your .env file to enable authentication."
  );
  console.warn(
    "Example: VITE_NEON_AUTH_URL=https://ep-xxx.neonauth.c-2.us-east-2.aws.neon.build/dbname/auth"
  );
}

// Provide a fallback URL to prevent crashes when auth is not configured
// This allows the app to render in a degraded state
// Note: This is a placeholder and won't provide actual authentication functionality
const fallbackUrl = authUrl || `${window.location.origin}/api/auth`;

export const authClient = createAuthClient(fallbackUrl, {
  adapter: BetterAuthReactAdapter(),
});
