import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthReactAdapter } from "@neondatabase/auth/react/adapters";

// Create auth client with Neon Auth URL from environment
const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

if (!authUrl) {
  console.error(
    "VITE_NEON_AUTH_URL is not defined. Please set it in your .env file."
  );
}

export const authClient = createAuthClient(authUrl, {
  adapter: BetterAuthReactAdapter(),
});
