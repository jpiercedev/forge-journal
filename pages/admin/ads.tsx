// Admin Ads Management Page

import { useState, useEffect } from 'react'
import AdminLayout from 'components/admin/AdminLayout'
import Alert from 'components/admin/Alert'
import { AdminProvider, useAdmin, withAdminAuth } from 'components/admin/AdminContext'
import type { Ad } from 'types/ads'

interface CreateAdForm {
  title: string
  type: 'banner' | 'sidebar'
  headline: string
  subheading: string
  background_image_url: string
  cta_text: string
  cta_link: string
  is_active: boolean
  display_order: number
}

function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAd, setEditingAd] = useState<Ad | null>(null)
  const [createLoading, setCreateLoading] = useState(false)
  const [createForm, setCreateForm] = useState<CreateAdForm>({
    title: '',
    type: 'banner',
    headline: '',
    subheading: '',
    background_image_url: '',
    cta_text: '',
    cta_link: '',
    is_active: true,
    display_order: 0,
  })

  useEffect(() => {
    loadAds()
  }, [])

  const loadAds = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/content/ads', {
        credentials: 'include',
      })

      const data = await response.json()
      console.log('Ads API response:', data) // Debug log

      if (data.success) {
        setAds(data.data)
      } else {
        const errorMsg = data.error?.message || data.error || 'Failed to load ads'
        console.error('Ads API error:', data) // Debug log
        setError(`Failed to load ads: ${errorMsg}`)
      }
    } catch (error) {
      console.error('Network error loading ads:', error) // Debug log
      setError(`Network error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/content/ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(createForm),
      })

      const data = await response.json()

      if (data.success) {
        setShowCreateForm(false)
        setCreateForm({
          title: '',
          type: 'banner',
          headline: '',
          subheading: '',
          background_image_url: '',
          cta_text: '',
          cta_link: '',
          is_active: true,
          display_order: 0,
        })
        setSuccess('Ad created successfully!')
        await loadAds()
      } else {
        setError(data.error?.message || 'Failed to create ad')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleUpdateAd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAd) return

    setCreateLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/content/ads?id=${editingAd.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(createForm),
      })

      const data = await response.json()

      if (data.success) {
        setEditingAd(null)
        setCreateForm({
          title: '',
          type: 'banner',
          headline: '',
          subheading: '',
          background_image_url: '',
          cta_text: '',
          cta_link: '',
          is_active: true,
          display_order: 0,
        })
        setSuccess('Ad updated successfully!')
        await loadAds()
      } else {
        setError(data.error?.message || 'Failed to update ad')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this ad? This action cannot be undone.')) {
      return
    }

    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/content/ads?id=${adId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Ad deleted successfully!')
        await loadAds()
      } else {
        setError(data.error?.message || 'Failed to delete ad')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  const handleEditAd = (ad: Ad) => {
    setEditingAd(ad)
    setCreateForm({
      title: ad.title,
      type: ad.type,
      headline: ad.headline,
      subheading: ad.subheading || '',
      background_image_url: ad.background_image_url || '',
      cta_text: ad.cta_text,
      cta_link: ad.cta_link,
      is_active: ad.is_active,
      display_order: ad.display_order,
    })
    setShowCreateForm(true)
  }

  const handleCancelEdit = () => {
    setEditingAd(null)
    setShowCreateForm(false)
    setCreateForm({
      title: '',
      type: 'banner',
      headline: '',
      subheading: '',
      background_image_url: '',
      cta_text: '',
      cta_link: '',
      is_active: true,
      display_order: 0,
    })
  }

  const toggleAdStatus = async (ad: Ad) => {
    try {
      const response = await fetch(`/api/content/ads?id=${ad.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ is_active: !ad.is_active }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(`Ad ${!ad.is_active ? 'activated' : 'deactivated'} successfully!`)
        await loadAds()
      } else {
        setError(data.error?.message || 'Failed to update ad status')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Ads Management" currentSection="ads">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forge-teal"></div>
          <span className="ml-3 text-gray-600 font-sans">Loading ads...</span>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Ads Management" currentSection="ads">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-sans">Ads Management</h1>
            <p className="text-gray-600 font-sans mt-1">Manage banner and sidebar advertisements</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-forge-teal text-white px-4 py-2 rounded-lg hover:bg-forge-teal-hover transition-colors font-sans"
          >
            Create New Ad
          </button>
        </div>

        {/* Messages */}
        {error && (
          <Alert
            type="error"
            message={error}
            onDismiss={() => setError('')}
          />
        )}

        {success && (
          <Alert
            type="success"
            message={success}
            onDismiss={() => setSuccess('')}
          />
        )}

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 font-sans">
                {editingAd ? 'Edit Ad' : 'Create New Ad'}
              </h2>
              <button
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-gray-700 font-sans"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={editingAd ? handleUpdateAd : handleCreateAd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-sans mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forge-teal focus:border-transparent font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-sans mb-2">
                    Type
                  </label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as 'banner' | 'sidebar' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forge-teal focus:border-transparent font-sans"
                    required
                  >
                    <option value="banner">Banner</option>
                    <option value="sidebar">Sidebar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-sans mb-2">
                  Headline
                </label>
                <input
                  type="text"
                  value={createForm.headline}
                  onChange={(e) => setCreateForm({ ...createForm, headline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forge-teal focus:border-transparent font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-sans mb-2">
                  Subheading
                </label>
                <textarea
                  value={createForm.subheading}
                  onChange={(e) => setCreateForm({ ...createForm, subheading: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forge-teal focus:border-transparent font-sans"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-sans mb-2">
                  Background Image URL
                </label>
                <input
                  type="url"
                  value={createForm.background_image_url}
                  onChange={(e) => setCreateForm({ ...createForm, background_image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forge-teal focus:border-transparent font-sans"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-sans mb-2">
                    CTA Text
                  </label>
                  <input
                    type="text"
                    value={createForm.cta_text}
                    onChange={(e) => setCreateForm({ ...createForm, cta_text: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forge-teal focus:border-transparent font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 font-sans mb-2">
                    CTA Link
                  </label>
                  <input
                    type="url"
                    value={createForm.cta_link}
                    onChange={(e) => setCreateForm({ ...createForm, cta_link: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forge-teal focus:border-transparent font-sans"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-sans mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={createForm.display_order}
                    onChange={(e) => setCreateForm({ ...createForm, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forge-teal focus:border-transparent font-sans"
                    min="0"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={createForm.is_active}
                      onChange={(e) => setCreateForm({ ...createForm, is_active: e.target.checked })}
                      className="rounded border-gray-300 text-forge-teal focus:ring-forge-teal"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 font-sans">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-forge-teal text-white rounded-lg hover:bg-forge-teal-hover transition-colors disabled:opacity-50 font-sans"
                >
                  {createLoading ? 'Saving...' : (editingAd ? 'Update Ad' : 'Create Ad')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ads List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 font-sans">All Ads ({ads.length})</h3>
          </div>

          {ads.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500 font-sans">No ads found. Create your first ad to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {ads.map((ad) => (
                <div key={ad.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 font-sans">{ad.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full font-sans ${
                          ad.type === 'banner' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {ad.type}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full font-sans ${
                          ad.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ad.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium font-sans mb-1">{ad.headline}</p>
                      {ad.subheading && (
                        <p className="text-gray-600 text-sm font-sans mb-2">{ad.subheading}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500 font-sans">
                        <span>CTA: {ad.cta_text}</span>
                        <span>Order: {ad.display_order}</span>
                        <span>Created: {new Date(ad.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => toggleAdStatus(ad)}
                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors font-sans ${
                          ad.is_active
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {ad.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleEditAd(ad)}
                        className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors font-sans"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAd(ad.id)}
                        className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors font-sans"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

const AdsWithAuth = withAdminAuth(AdsPage)

export default function AdsPageWrapper() {
  return (
    <AdminProvider>
      <AdsWithAuth />
    </AdminProvider>
  )
}
