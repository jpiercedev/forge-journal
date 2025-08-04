// Contributor Management Page

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from 'components/admin/AdminLayout'
import { AdminProvider, useAdmin, withAdminAuth } from 'components/admin/AdminContext'
import Alert from 'components/admin/Alert'
import ImageUpload from 'components/ImageUpload'

interface Author {
  id: string
  name: string
  title?: string
  bio?: string
  image_url?: string
  image_alt?: string
  slug: string
  created_at: string
  updated_at: string
}

interface CreateAuthorForm {
  name: string
  title: string
  bio: string
  image_url: string
  image_alt: string
}

function AdminAuthors() {
  const { state } = useAdmin()
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)
  const [createForm, setCreateForm] = useState<CreateAuthorForm>({
    name: '',
    title: '',
    bio: '',
    image_url: '',
    image_alt: '',
  })
  const [createLoading, setCreateLoading] = useState(false)

  useEffect(() => {
    loadAuthors()
  }, [])

  const loadAuthors = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/content/contributors', {
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success) {
        setAuthors(data.data)
      } else {
        setError('Failed to load contributors')
      }
    } catch (error) {
      setError('Failed to load contributors')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleCreateAuthor = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    setError('')
    setSuccess('')

    try {
      const authorData = {
        ...createForm,
        slug: generateSlug(createForm.name),
      }

      const response = await fetch('/api/content/contributors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(authorData),
      })

      const data = await response.json()

      if (data.success) {
        setShowCreateForm(false)
        setCreateForm({
          name: '',
          title: '',
          bio: '',
          image_url: '',
          image_alt: '',
        })
        setSuccess('Contributor created successfully!')
        await loadAuthors() // Reload authors list
      } else {
        setError(data.error?.message || 'Failed to create contributor')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleUpdateAuthor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAuthor) return

    setCreateLoading(true)
    setError('')
    setSuccess('')

    try {
      const authorData = {
        ...createForm,
        slug: generateSlug(createForm.name),
      }

      const response = await fetch(`/api/content/contributors?id=${editingAuthor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(authorData),
      })

      const data = await response.json()

      if (data.success) {
        setEditingAuthor(null)
        setCreateForm({
          name: '',
          title: '',
          bio: '',
          image_url: '',
          image_alt: '',
        })
        setSuccess('Contributor updated successfully!')
        await loadAuthors() // Reload authors list
      } else {
        setError(data.error?.message || 'Failed to update contributor')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDeleteAuthor = async (authorId: string) => {
    if (!confirm('Are you sure you want to delete this contributor? This action cannot be undone.')) {
      return
    }

    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/content/contributors?id=${authorId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Contributor deleted successfully!')
        await loadAuthors() // Reload authors list
      } else {
        setError(data.error?.message || 'Failed to delete contributor')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  const startEdit = (author: Author) => {
    setEditingAuthor(author)
    setCreateForm({
      name: author.name,
      title: author.title || '',
      bio: author.bio || '',
      image_url: author.image_url || '',
      image_alt: author.image_alt || '',
    })
    setShowCreateForm(true)
  }

  const cancelEdit = () => {
    setEditingAuthor(null)
    setShowCreateForm(false)
    setCreateForm({
      name: '',
      title: '',
      bio: '',
      image_url: '',
      image_alt: '',
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <AdminLayout title="Contributors" description="Loading contributors..." currentSection="contributors">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forge-teal mx-auto"></div>
            <p className="mt-4 text-gray-600 font-sans">Loading contributors...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Contributors" description="Manage contributor profiles and information" currentSection="contributors">
      {/* Action Bar */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-9 font-sans">All Contributors</h2>
          <p className="text-sm text-gray-6 font-sans">Manage contributor profiles and information</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors font-sans"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Contributor
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

      {/* Authors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {authors.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <svg className="w-12 h-12 text-gray-5 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <p className="text-gray-6 font-sans">No contributors found</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover font-sans"
            >
              Create your first contributor
            </button>
          </div>
        ) : (
          authors.map((author) => (
            <div key={author.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-3">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  {author.image_url ? (
                    <img
                      src={author.image_url}
                      alt={author.image_alt || author.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-3"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center">
                      <span className="text-primary text-xl font-bold font-sans">
                        {author.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-9 font-sans">
                      {author.name}
                    </h3>
                    {author.title && (
                      <p className="text-sm text-gray-6 font-sans">
                        {author.title}
                      </p>
                    )}
                  </div>
                </div>

                {author.bio && (
                  <p className="text-sm text-gray-7 mb-4 line-clamp-3 font-sans leading-relaxed">
                    {author.bio}
                  </p>
                )}

                <div className="text-xs text-gray-5 mb-4 font-sans">
                  Created: {formatDate(author.created_at)}
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => startEdit(author)}
                    className="text-primary hover:text-primary-hover text-sm px-3 py-1 rounded-lg hover:bg-primary-light font-medium font-sans transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAuthor(author.id)}
                    className="text-danger hover:text-danger text-sm px-3 py-1 rounded-lg hover:bg-danger-light font-medium font-sans transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Author Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-8 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border border-gray-3 w-full max-w-2xl shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-bold text-gray-9 mb-6 font-sans">
                {editingAuthor ? 'Edit Contributor' : 'Create New Contributor'}
              </h3>
                <form onSubmit={editingAuthor ? handleUpdateAuthor : handleCreateAuthor} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-9 font-sans mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={createForm.name}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                        className="block w-full border border-gray-3 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-9 font-sans mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={createForm.title}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                        className="block w-full border border-gray-3 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-sans"
                        placeholder="e.g., Senior Pastor, Author"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-9 font-sans mb-2">
                      Bio
                    </label>
                    <textarea
                      rows={4}
                      value={createForm.bio}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="block w-full border border-gray-3 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-sans"
                      placeholder="Contributor biography..."
                    />
                  </div>

                  <div>
                    <ImageUpload
                      label="Contributor Photo"
                      value={createForm.image_url}
                      onChange={(url) => setCreateForm(prev => ({ ...prev, image_url: url }))}
                      onError={(error) => setError(error)}
                      onSuccess={(message) => setSuccess(message)}
                      folder="authors"
                      placeholder="Upload a photo for this contributor"
                      maxSize={5 * 1024 * 1024} // 5MB
                      showPreview={true}
                      showOptimizationStats={true}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-9 font-sans mb-2">
                      Image Alt Text
                    </label>
                    <input
                      type="text"
                      value={createForm.image_alt}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, image_alt: e.target.value }))}
                      className="block w-full border border-gray-3 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-sans"
                      placeholder="Description of the image (for accessibility)"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-3">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2.5 text-sm font-medium text-gray-7 bg-gray-2 border border-gray-3 rounded-lg hover:bg-gray-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-5 font-sans transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createLoading}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-primary border border-transparent rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed font-sans transition-colors"
                    >
                      {createLoading ? (editingAuthor ? 'Updating...' : 'Creating...') : (editingAuthor ? 'Update Contributor' : 'Create Contributor')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
    </AdminLayout>
  )
}

const AuthorsWithAuth = withAdminAuth(AdminAuthors)

export default function AuthorsPageWrapper() {
  return (
    <AdminProvider>
      <AuthorsWithAuth />
    </AdminProvider>
  )
}
