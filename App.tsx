
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

// Auth page component - handles /auth/sign-in, /auth/sign-up, etc.
function AuthPage() {
  const { pathname } = useParams();
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
