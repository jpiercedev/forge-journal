// Debug page to test ads API
// Visit this page to test the ads functionality

import { useState } from 'react'

export default function DebugAds() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testTableExists = async () => {
    setLoading(true)
    setResult('Testing if ads table exists...')

    try {
      const response = await fetch('/api/test-ads-table')
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testAdsAPI = async () => {
    setLoading(true)
    setResult('Testing ads API...')

    try {
      const response = await fetch('/api/content/ads', {
        credentials: 'include',
      })

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const setupAds = async () => {
    setLoading(true)
    setResult('Setting up ads...')
    
    try {
      const response = await fetch('/api/admin/setup-ads', {
        method: 'POST',
        credentials: 'include',
      })
      
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Ads API</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testTableExists}
            disabled={loading}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            1. Check Table Exists
          </button>

          <button
            onClick={setupAds}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 ml-4"
          >
            2. Setup Sample Ads
          </button>

          <button
            onClick={testAdsAPI}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 ml-4"
          >
            3. Test Ads API
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {result || 'Click a button to test...'}
          </pre>
        </div>

        <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>First, create the ads table by running the SQL in <code>CREATE_ADS_TABLE.sql</code> in your Supabase dashboard</li>
            <li>Then click &quot;Setup Sample Ads&quot; to create sample data</li>
            <li>Finally, click &quot;Test Ads API&quot; to verify everything works</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
