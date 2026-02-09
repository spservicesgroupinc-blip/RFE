import { Route, Routes } from 'react-router-dom';
import { Account } from './pages/account';
import { Auth } from './pages/auth';
import { Home } from './pages/home';
import { ConfigurationError } from './components/ConfigurationError';

export default function App() {
  // Check if required environment variables are set
  const authUrl = import.meta.env.VITE_NEON_AUTH_URL;
  
  if (!authUrl) {
    return <ConfigurationError />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/account" element={<Account />} />
    </Routes>
  );
}
