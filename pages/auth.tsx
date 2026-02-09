import { AuthView } from '@neondatabase/neon-js/auth/react/ui';
import { useLocation } from 'react-router-dom';

export function Auth() {
  const location = useLocation();
  // Extract the auth sub-path from the current location
  // E.g., /auth/sign-up becomes "sign-up", /auth becomes "sign-in"
  const authPath = location.pathname.startsWith('/auth/')
    ? location.pathname.slice('/auth/'.length)
    : 'sign-in';

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <AuthView path={authPath} />
    </div>
  );
}
