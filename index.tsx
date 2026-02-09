import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react/ui';
import '@neondatabase/neon-js/ui/css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { authClient } from './lib/auth';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {authClient ? (
        <NeonAuthUIProvider authClient={authClient}>
          <App />
        </NeonAuthUIProvider>
      ) : (
        <App />
      )}
    </BrowserRouter>
  </StrictMode>
);