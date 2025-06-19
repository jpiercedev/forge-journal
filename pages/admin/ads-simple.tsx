// Simple Ads Management Page for debugging

import { useState, useEffect } from 'react'
import AdminLayout from 'components/admin/AdminLayout'
import { AdminProvider, withAdminAuth } from 'components/admin/AdminContext'

function SimpleAdsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ads, setAds] = useState([])

  useEffect(() => {
    loadAds()
  }, [])

  const loadAds = async () => {
    setLoading(true)
    try {
      console.log('Fetching ads...')
      const response = await fetch('/api/content/ads', {
        credentials: 'include',
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (data.success) {
        setAds(data.data || [])
        setError('')
      } else {
        setError(data.error?.message || 'Failed to load ads')
      }
    } catch (err) {
      console.error('Error loading ads:', err)
      setError(`Network error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Ads Management (Simple)" currentSection="ads">
        <div className="p-6">
          <p>Loading ads...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Ads Management (Simple)" currentSection="ads">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Ads Management (Debug Version)</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Ads ({ads.length})</h2>
          
          {ads.length === 0 ? (
            <p className="text-gray-500">No ads found.</p>
          ) : (
            <div className="space-y-4">
              {ads.map((ad, index) => (
                <div key={ad.id || index} className="border border-gray-200 rounded p-4">
                  <h3 className="font-medium">{ad.title}</h3>
                  <p className="text-sm text-gray-600">{ad.headline}</p>
                  <div className="flex space-x-2 mt-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {ad.type}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      ad.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ad.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 bg-gray-100 rounded p-4">
          <h3 className="font-medium mb-2">Debug Info:</h3>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>Error:</strong> {error || 'None'}</p>
          <p><strong>Ads Count:</strong> {ads.length}</p>
          <button 
            onClick={loadAds}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Reload Ads
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}

const SimpleAdsWithAuth = withAdminAuth(SimpleAdsPage)

export default function SimpleAdsPageWrapper() {
  return (
    <AdminProvider>
      <SimpleAdsWithAuth />
    </AdminProvider>
  )
}
