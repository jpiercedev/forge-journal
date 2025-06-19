// Admin Login Page - /admin

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { AdminProvider, useAdmin } from 'components/admin/AdminContext'

interface LoginForm {
  email: string
  password: string
}

function AdminLoginForm() {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' })
  const [error, setError] = useState('')
  const { state, login } = useAdmin()
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    if (state.isAuthenticated) {
      router.push('/admin/dashboard')
    }
  }, [state.isAuthenticated, router])

  useEffect(() => {
    // Clear any existing errors when form changes
    if (error) {
      setError('')
    }
  }, [form, error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const success = await login(form)
    if (success) {
      router.push('/admin/dashboard')
    } else {
      setError(state.error || 'Login failed')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forge-teal mx-auto"></div>
          <p className="mt-4 text-gray-600 font-sans">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Login - Forge Journal</title>
        <meta name="description" content="Admin login for Forge Journal content management" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <Link href="/" className="inline-block group">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-10 h-10 bg-forge-teal rounded-lg flex items-center justify-center group-hover:bg-forge-teal-hover transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 font-sans">
                  Forge Journal
                </h1>
              </div>
            </Link>
          </div>
          <h2 className="mt-8 text-center text-3xl font-bold text-gray-900 font-sans">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 font-sans">
            Sign in to access the content management system
          </p>
        </div>

        {/* Login Form */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 font-sans">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-forge-teal focus:border-forge-teal sm:text-sm font-sans transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 font-sans">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-forge-teal focus:border-forge-teal sm:text-sm font-sans transition-colors"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {(error || state.error) && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 font-sans">{error || state.error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={state.isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-forge-teal hover:bg-forge-teal-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forge-teal disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-sans"
                >
                  {state.isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            {/* Development Info */}
            <div className="mt-6 p-4 bg-forge-gold bg-opacity-10 rounded-lg border border-forge-gold border-opacity-20">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-forge-gold" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-forge-gold font-sans mb-2">Default Admin Account:</h3>
                  <div className="text-xs text-gray-700 font-sans space-y-1">
                    <p><strong>Email:</strong> admin@forgejournal.com</p>
                    <p><strong>Password:</strong> admin123</p>
                  </div>
                  <p className="text-xs text-red-600 mt-2 font-sans">
                    ⚠️ Change the default password after first login!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-forge-teal transition-colors font-sans">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Forge Journal
          </Link>
        </div>
      </div>
    </>
  )
}

// Wrap the login form with AdminProvider
export default function AdminLoginPage() {
  return (
    <AdminProvider>
      <AdminLoginForm />
    </AdminProvider>
  )
}
