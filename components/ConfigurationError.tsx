import { AlertCircle } from 'lucide-react';

export function ConfigurationError() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="max-w-2xl p-8 bg-white rounded-lg shadow-lg">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              Configuration Error
            </h1>
            <p className="text-slate-700 mb-4">
              The application is missing required environment variables and cannot start.
            </p>
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-sm font-mono text-red-900">
                Missing: <strong>VITE_NEON_AUTH_URL</strong>
              </p>
            </div>
            <div className="text-slate-700 space-y-3">
              <p>
                <strong>If you're a developer:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Create a <code className="bg-slate-100 px-2 py-1 rounded text-sm">.env</code> file in the project root</li>
                <li>Add your Neon Auth URL: <code className="bg-slate-100 px-2 py-1 rounded text-sm">VITE_NEON_AUTH_URL=your-auth-url</code></li>
                <li>Restart the development server</li>
              </ol>
              <p className="mt-4">
                <strong>If you're deploying to Netlify:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Go to your Netlify site settings</li>
                <li>Navigate to Site configuration → Environment variables</li>
                <li>Add <code className="bg-slate-100 px-2 py-1 rounded text-sm">VITE_NEON_AUTH_URL</code> with your Neon Auth URL</li>
                <li>Trigger a new deployment</li>
              </ol>
              <p className="mt-4 text-sm text-slate-600">
                See <code className="bg-slate-100 px-2 py-1 rounded text-xs">NEON_AUTH_SETUP.md</code> for detailed setup instructions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
