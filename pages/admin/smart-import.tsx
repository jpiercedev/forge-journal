// Smart Import Admin Page

import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useEffect,useState } from 'react';

import ForgeLayout from '../../components/ForgeLayout';
import SmartImportInterface from '../../components/SmartImport/SmartImportInterface';
import { ImportResult } from '../../types/smart-import';

interface SmartImportPageProps {
  preview?: boolean;
}

export default function SmartImportPage({ preview }: SmartImportPageProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token in localStorage
    const savedToken = localStorage.getItem('supabase_admin_token');
    if (savedToken) {
      setAuthToken(savedToken);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!authToken.trim()) {
      setAuthError('Please enter your Supabase service role key');
      return;
    }

    try {
      // Test the token by making a simple API call
      const response = await fetch('/api/smart-import/parse-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ text: 'test' }),
      });

      if (response.status === 401) {
        setAuthError('Invalid service role key. Please check your token and try again.');
        return;
      }

      // Save token and authenticate
      localStorage.setItem('supabase_admin_token', authToken);
      setIsAuthenticated(true);
    } catch (error) {
      setAuthError('Failed to validate token. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sanity_token');
    setIsAuthenticated(false);
    setAuthToken('');
  };

  const handleImportComplete = (result: ImportResult) => {
    console.log('Import completed:', result);
    // Could add analytics or notifications here
  };

  if (isLoading) {
    return (
      <ForgeLayout preview={preview} showSidebar={false}>
        <Head>
          <title>Smart Import - Forge Journal</title>
          <meta name="description" content="AI-powered content import for Forge Journal" />
        </Head>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ForgeLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <ForgeLayout preview={preview} showSidebar={false}>
        <Head>
          <title>Smart Import - Authentication - Forge Journal</title>
          <meta name="description" content="Authenticate to access Smart Import" />
        </Head>
        
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Merriweather, serif' }}>
                Smart Import
              </h2>
              <p className="mt-2 text-sm text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Enter your Supabase service role key to access Smart Import
              </p>
            </div>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <form className="space-y-6" onSubmit={handleAuth}>
                <div>
                  <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                    Supabase Service Role Key
                  </label>
                  <div className="mt-1">
                    <input
                      id="token"
                      name="token"
                      type="password"
                      value={authToken}
                      onChange={(e) => setAuthToken(e.target.value)}
                      required
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your Supabase service role key"
                    />
                  </div>
                  {authError && (
                    <p className="mt-2 text-sm text-red-600">{authError}</p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Access Smart Import
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">How to get your token</span>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-2">To get your Supabase service role key:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Go to <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="underline">app.supabase.com</a></li>
                        <li>Select your Forge Journal project</li>
                        <li>Navigate to Settings → API</li>
                        <li>Copy the &quot;service_role&quot; key (not the anon key)</li>
                        <li>Paste the key here</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ForgeLayout>
    );
  }

  return (
    <ForgeLayout preview={preview} showSidebar={false}>
      <Head>
        <title>Smart Import - Forge Journal</title>
        <meta name="description" content="AI-powered content import for Forge Journal" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {/* Header with logout */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Merriweather, serif' }}>
                Smart Import
              </h1>
              <p className="text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                AI-powered content import for Forge Journal
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Smart Import Interface */}
      <SmartImportInterface onComplete={handleImportComplete} />
    </ForgeLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  return {
    props: {
      preview,
    },
  };
};
