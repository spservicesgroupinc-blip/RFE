import React, { type ReactNode } from "react";
import { NeonAuthUIProvider } from "@neondatabase/neon-js/auth/react/ui";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { authClient } from "./lib/auth";

// Adapter for react-router-dom Link
function Link({
  href,
  ...props
}: { href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <RouterLink to={href} {...props} />;
}

export function Providers({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={(path) => navigate(path)}
      replace={(path) => navigate(path, { replace: true })}
      onSessionChange={() => {
        // Optional: refresh data or invalidate cache when session changes
      }}
      Link={Link}
      social={{
        providers: ["google", "github"],
      }}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
