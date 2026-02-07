
import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import {
  AuthView,
  UserButton,
  SignedIn,
  SignedOut,
} from "@neondatabase/auth/react/ui";
import SprayFoamCalculator from './components/SprayFoamCalculator';
import { CalculatorProvider } from './context/CalculatorContext';
import { authClient } from './lib/auth-client';

// Check if auth is properly configured
const isAuthConfigured = !!import.meta.env.VITE_NEON_AUTH_URL;

// Configuration warning component
function ConfigurationWarning() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
        <h2 className="text-xl font-bold text-yellow-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">⚠️</span>
          Authentication Not Configured
        </h2>
        <p className="text-yellow-800 mb-4">
          The application requires Neon Auth to be configured. Please follow these steps:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-yellow-800 mb-4">
          <li>Create a Neon project at <a href="https://console.neon.tech" className="underline font-medium" target="_blank" rel="noopener noreferrer" aria-label="Neon Console (opens in new tab)">console.neon.tech</a></li>
          <li>Enable Auth in your Neon project dashboard</li>
          <li>Copy your Auth URL from the Neon dashboard</li>
          <li>Create a <code className="bg-yellow-100 px-2 py-1 rounded font-mono text-sm">.env</code> file in the project root</li>
          <li>Add <code className="bg-yellow-100 px-2 py-1 rounded font-mono text-sm">VITE_NEON_AUTH_URL=your-auth-url</code></li>
          <li>Restart the development server</li>
        </ol>
        <p className="text-sm text-yellow-700">
          See <code className="bg-yellow-100 px-2 py-1 rounded font-mono">.env.example</code> for reference.
        </p>
      </div>
    </div>
  );
}

// Auth page component - handles /auth/sign-in, /auth/sign-up, etc.
function AuthPage() {
  const { pathname } = useParams();
  
  if (!isAuthConfigured) {
    return <ConfigurationWarning />;
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <AuthView pathname={pathname} />
    </div>
  );
}

// Simple navbar with auth status
function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
      <a href="/" className="text-lg font-semibold text-slate-900">
        RFE App
      </a>
      <div className="flex items-center gap-4">
        <SignedOut>
          <a 
            href="/auth/sign-in"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Sign In
          </a>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
}

// Protected main content
function MainContent() {
  // Show configuration warning if auth is not set up
  if (!isAuthConfigured) {
    return <ConfigurationWarning />;
  }

  const session = authClient.useSession();

  if (session.isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session.data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Welcome to RFE App
          </h2>
          <p className="text-slate-600 mb-6">
            Please sign in to access the spray foam calculator and other features.
          </p>
          <a
            href="/auth/sign-in"
            className="inline-block px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 py-8">
      <CalculatorProvider>
        <SprayFoamCalculator />
      </CalculatorProvider>
    </div>
  );
}

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route path="/auth/:pathname" element={<AuthPage />} />
      </Routes>
    </>
  );
}

export default App;
