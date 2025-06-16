import { useEffect } from 'react'

export default function SupportPage() {
  useEffect(() => {
    // Redirect to external support page
    window.location.href = 'https://support.forgejournal.org'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Redirecting to Support...
        </h1>
        <p className="text-gray-600 mb-6">
          You're being redirected to our support page.
        </p>
        <a 
          href="https://support.forgejournal.org"
          className="inline-block bg-blue-800 hover:bg-blue-900 text-white px-6 py-2 text-sm font-medium uppercase tracking-wide transition-colors duration-200"
        >
          Continue to Support
        </a>
      </div>
    </div>
  )
}
