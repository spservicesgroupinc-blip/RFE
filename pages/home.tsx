import { authClient } from '../lib/auth';
import SprayFoamCalculator from '../components/SprayFoamCalculator';
import { CalculatorProvider } from '../context/CalculatorContext';

export function Home() {
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
            href="/auth"
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
