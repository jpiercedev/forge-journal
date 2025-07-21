// Posts Management Page

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import AdminLayout from 'components/admin/AdminLayout'
import { AdminProvider, useAdmin, withAdminAuth } from 'components/admin/AdminContext'

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

function PostsManagement() {
  const { state } = useAdmin()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const statusParam = filter !== 'all' ? `&status=${filter}` : ''
      const response = await fetch(`/api/content/posts?limit=100&includeAuthor=true${statusParam}`, {
        credentials: 'include',
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
  }, [filter])

  useEffect(() => {
    loadPosts()
  }, [filter, loadPosts])

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      const response = await fetch(`/api/content/posts?id=${postId}`, {
        method: 'DELETE',
        credentials: 'include',
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
    try {
      const updateData: any = { status: newStatus }
      if (newStatus === 'published') {
        updateData.published_at = new Date().toISOString()
      }

      const response = await fetch(`/api/content/posts?id=${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
      <AdminLayout title="Posts Management" description="Manage your blog posts" currentSection="posts">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forge-teal mx-auto"></div>
            <p className="mt-4 text-gray-600 font-sans">Loading posts...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Posts Management" description="Manage your blog posts" currentSection="posts">
      {/* Action Bar */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-9 font-sans">All Posts</h2>
          <p className="text-sm text-gray-6 font-sans">Manage and organize your blog content</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors font-sans"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Post
        </Link>
      </div>
      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-3 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="flex space-x-4">
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="appearance-none border border-gray-3 rounded-lg px-4 py-2.5 pr-8 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white"
              >
                <option value="all">All Posts</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
                <option value="archived">Archived</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-3 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-3">
        <div className="px-6 py-5 border-b border-gray-3">
          <h3 className="text-lg font-bold text-gray-9 font-sans">
            Posts ({filteredPosts.length})
          </h3>
        </div>

        {error && (
          <div className="px-6 py-4 bg-danger-light border-b border-danger">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-danger" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-danger font-sans">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="divide-y divide-gray-3">
          {filteredPosts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="w-12 h-12 text-gray-5 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-6 font-sans">No posts found</p>
              <Link
                href="/admin/posts/new"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover font-sans"
              >
                Create your first post
              </Link>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="px-6 py-4 hover:bg-gray-1 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-9 font-sans truncate">{post.title}</h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium font-sans ${
                          post.status === 'published'
                            ? 'bg-success-light text-success'
                            : post.status === 'draft'
                            ? 'bg-warning-light text-warning'
                            : 'bg-gray-2 text-gray-7'
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-6 font-sans space-y-1">
                      <p>
                        {post.author?.name} • {post.word_count} words • {post.reading_time} min read
                      </p>
                      <p>
                        Created: {formatDate(post.created_at)}
                        {post.published_at && ` • Published: ${formatDate(post.published_at)}`}
                      </p>
                      {post.excerpt && (
                        <p className="mt-2 text-gray-5 line-clamp-2">{post.excerpt}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 ml-4">
                    <select
                      value={post.status}
                      onChange={(e) => handleStatusChange(post.id, e.target.value)}
                      className="text-sm border border-gray-3 rounded-lg px-3 py-1 font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="text-primary hover:text-primary-hover text-sm px-2 py-1 font-medium font-sans"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-600 hover:text-red-900 text-sm px-2 py-1 font-medium font-sans"
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
    </AdminLayout>
  )
}

const PostsWithAuth = withAdminAuth(PostsManagement)

export default function PostsManagementPage() {
  return (
    <AdminProvider>
      <PostsWithAuth />
    </AdminProvider>
  )
}
