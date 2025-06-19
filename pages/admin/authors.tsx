// Author Management Page

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from 'components/admin/AdminLayout'
import { AdminProvider, useAdmin, withAdminAuth } from 'components/admin/AdminContext'
import Alert from 'components/admin/Alert'

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
      const response = await fetch('/api/content/authors', {
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success) {
        setAuthors(data.data)
      } else {
        setError('Failed to load authors')
      }
    } catch (error) {
      setError('Failed to load authors')
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

      const response = await fetch('/api/content/authors', {
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
        setSuccess('Author created successfully!')
        await loadAuthors() // Reload authors list
      } else {
        setError(data.error?.message || 'Failed to create author')
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

      const response = await fetch(`/api/content/authors?id=${editingAuthor.id}`, {
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
        setSuccess('Author updated successfully!')
        await loadAuthors() // Reload authors list
      } else {
        setError(data.error?.message || 'Failed to update author')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDeleteAuthor = async (authorId: string) => {
    if (!confirm('Are you sure you want to delete this author? This action cannot be undone.')) {
      return
    }

    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/content/authors?id=${authorId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Author deleted successfully!')
        await loadAuthors() // Reload authors list
      } else {
        setError(data.error?.message || 'Failed to delete author')
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
      <AdminLayout title="Authors" description="Loading authors..." currentSection="authors">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forge-teal mx-auto"></div>
            <p className="mt-4 text-gray-600 font-sans">Loading authors...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Authors" description="Manage author profiles and information" currentSection="authors">
      {/* Action Bar */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-serif">All Authors</h2>
          <p className="text-sm text-gray-600 font-sans">Manage author profiles and information</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-forge-teal hover:bg-forge-teal-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forge-teal transition-colors font-sans"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Author
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
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <p className="text-gray-500 font-sans">No authors found</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-forge-teal hover:bg-forge-teal-hover font-sans"
            >
              Create your first author
            </button>
          </div>
        ) : (
          authors.map((author) => (
            <div key={author.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  {author.image_url ? (
                    <img
                      src={author.image_url}
                      alt={author.image_alt || author.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-forge-teal bg-opacity-10 flex items-center justify-center">
                      <span className="text-forge-teal text-xl font-bold font-serif">
                        {author.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 font-serif">
                      {author.name}
                    </h3>
                    {author.title && (
                      <p className="text-sm text-gray-600 font-sans">
                        {author.title}
                      </p>
                    )}
                  </div>
                </div>

                {author.bio && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3 font-sans leading-relaxed">
                    {author.bio}
                  </p>
                )}

                <div className="text-xs text-gray-500 mb-4 font-sans">
                  Created: {formatDate(author.created_at)}
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => startEdit(author)}
                    className="text-forge-teal hover:text-forge-teal-hover text-sm px-3 py-1 rounded-lg hover:bg-forge-teal hover:bg-opacity-10 font-medium font-sans transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAuthor(author.id)}
                    className="text-red-600 hover:text-red-900 text-sm px-3 py-1 rounded-lg hover:bg-red-50 font-medium font-sans transition-colors"
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-xl bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-bold text-gray-900 mb-4 font-serif">
                {editingAuthor ? 'Edit Author' : 'Create New Author'}
              </h3>
                <form onSubmit={editingAuthor ? handleUpdateAuthor : handleCreateAuthor} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-sans">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={createForm.name}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forge-teal focus:border-forge-teal font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-sans">
                        Title
                      </label>
                      <input
                        type="text"
                        value={createForm.title}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forge-teal focus:border-forge-teal font-sans"
                        placeholder="e.g., Senior Pastor, Author"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-sans">
                      Bio
                    </label>
                    <textarea
                      rows={4}
                      value={createForm.bio}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forge-teal focus:border-forge-teal font-sans"
                      placeholder="Author biography..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-sans">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={createForm.image_url}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, image_url: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forge-teal focus:border-forge-teal font-sans"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-sans">
                        Image Alt Text
                      </label>
                      <input
                        type="text"
                        value={createForm.image_alt}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, image_alt: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forge-teal focus:border-forge-teal font-sans"
                        placeholder="Description of the image"
                      />
                    </div>
                  </div>

                  {createForm.image_url && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                        Image Preview
                      </label>
                      <img
                        src={createForm.image_url}
                        alt={createForm.image_alt || 'Preview'}
                        className="w-24 h-24 rounded-full object-cover border border-gray-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 font-sans"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-forge-teal border border-transparent rounded-lg hover:bg-forge-teal-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forge-teal disabled:opacity-50 disabled:cursor-not-allowed font-sans"
                    >
                      {createLoading ? (editingAuthor ? 'Updating...' : 'Creating...') : (editingAuthor ? 'Update Author' : 'Create Author')}
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
