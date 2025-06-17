// Posts Management Page

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface Post {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  published_at?: string
  created_at: string
  updated_at: string
  author?: {
    id: string
    name: string
  }
  word_count: number
  reading_time: number
  excerpt?: string
}

export default function PostsManagement() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadPosts()
  }, [filter])

  const getAuthToken = () => {
    return localStorage.getItem('supabase_admin_token')
  }

  const loadPosts = async () => {
    const token = getAuthToken()
    if (!token) {
      router.push('/admin/dashboard')
      return
    }

    setLoading(true)
    try {
      const statusParam = filter !== 'all' ? `&status=${filter}` : ''
      const response = await fetch(`/api/content/posts?limit=100&includeAuthor=true${statusParam}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      const data = await response.json()
      if (data.success) {
        setPosts(data.data)
      } else {
        setError('Failed to load posts')
      }
    } catch (error) {
      setError('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    const token = getAuthToken()
    if (!token) return

    try {
      const response = await fetch(`/api/content/posts?id=${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      const data = await response.json()
      if (data.success) {
        setPosts(posts.filter(p => p.id !== postId))
      } else {
        alert('Failed to delete post')
      }
    } catch (error) {
      alert('Failed to delete post')
    }
  }

  const handleStatusChange = async (postId: string, newStatus: string) => {
    const token = getAuthToken()
    if (!token) return

    try {
      const updateData: any = { status: newStatus }
      if (newStatus === 'published') {
        updateData.published_at = new Date().toISOString()
      }

      const response = await fetch(`/api/content/posts?id=${postId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()
      if (data.success) {
        loadPosts() // Reload to get updated data
      } else {
        alert('Failed to update post status')
      }
    } catch (error) {
      alert('Failed to update post status')
    }
  }

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Posts Management</h1>
              <p className="text-gray-600">Manage your blog posts</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/posts/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                New Post
              </Link>
              <Link
                href="/admin/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Posts</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Posts ({filteredPosts.length})
            </h3>
          </div>
          
          {error && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-200">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="divide-y divide-gray-200">
            {filteredPosts.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No posts found
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-gray-900">{post.title}</h4>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            post.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : post.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {post.status}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        <p>
                          {post.author?.name} • {post.word_count} words • {post.reading_time} min read
                        </p>
                        <p>
                          Created: {formatDate(post.created_at)}
                          {post.published_at && ` • Published: ${formatDate(post.published_at)}`}
                        </p>
                        {post.excerpt && (
                          <p className="mt-2 text-gray-500 line-clamp-2">{post.excerpt}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={post.status}
                        onChange={(e) => handleStatusChange(post.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="text-blue-600 hover:text-blue-900 text-sm px-2 py-1"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 hover:text-red-900 text-sm px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
