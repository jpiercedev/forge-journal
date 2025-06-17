// Author Management Page

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

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

export default function AdminAuthors() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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
  const router = useRouter()

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      // Check authentication
      const authResponse = await fetch('/api/admin/auth/me', {
        credentials: 'include',
      })

      if (!authResponse.ok) {
        router.push('/admin')
        return
      }

      const authData = await authResponse.json()
      if (!authData.success) {
        router.push('/admin')
        return
      }

      await loadAuthors()
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/admin')
    }
  }

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

    try {
      const response = await fetch(`/api/content/authors?id=${authorId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success) {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authors...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Authors - Forge Journal Admin</title>
        <meta name="description" content="Manage authors for Forge Journal" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Merriweather, serif' }}>
                  Authors
                </h1>
                <p className="text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Manage author profiles and information
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Add Author
                </button>
                <Link
                  href="/admin/dashboard"
                  className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Authors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authors.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No authors found</p>
              </div>
            ) : (
              authors.map((author) => (
                <div key={author.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      {author.image_url ? (
                        <img
                          src={author.image_url}
                          alt={author.image_alt || author.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-xl font-medium">
                            {author.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900" style={{ fontFamily: 'Merriweather, serif' }}>
                          {author.name}
                        </h3>
                        {author.title && (
                          <p className="text-sm text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {author.title}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {author.bio && (
                      <p className="text-sm text-gray-700 mb-4 line-clamp-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {author.bio}
                      </p>
                    )}
                    
                    <div className="text-xs text-gray-500 mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Created: {formatDate(author.created_at)}
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => startEdit(author)}
                        className="text-blue-600 hover:text-blue-900 text-sm px-3 py-1 rounded hover:bg-blue-50"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAuthor(author.id)}
                        className="text-red-600 hover:text-red-900 text-sm px-3 py-1 rounded hover:bg-red-50"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        {/* Create/Edit Author Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4" style={{ fontFamily: 'Merriweather, serif' }}>
                  {editingAuthor ? 'Edit Author' : 'Create New Author'}
                </h3>
                <form onSubmit={editingAuthor ? handleUpdateAuthor : handleCreateAuthor} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={createForm.name}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Title
                      </label>
                      <input
                        type="text"
                        value={createForm.title}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Senior Pastor, Author"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Bio
                    </label>
                    <textarea
                      rows={4}
                      value={createForm.bio}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Author biography..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={createForm.image_url}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, image_url: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Image Alt Text
                      </label>
                      <input
                        type="text"
                        value={createForm.image_alt}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, image_alt: e.target.value }))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Description of the image"
                      />
                    </div>
                  </div>

                  {createForm.image_url && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
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
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {createLoading ? (editingAuthor ? 'Updating...' : 'Creating...') : (editingAuthor ? 'Update Author' : 'Create Author')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
