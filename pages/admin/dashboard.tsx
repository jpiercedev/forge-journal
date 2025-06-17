// Content Management Dashboard

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
  author?: {
    name: string
  }
  word_count: number
  reading_time: number
}

interface Author {
  id: string
  name: string
  title?: string
  created_at: string
}

interface Category {
  id: string
  title: string
  slug: string
  created_at: string
}

interface DashboardStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalAuthors: number
  totalCategories: number
}

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authToken, setAuthToken] = useState('')
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const router = useRouter()

  useEffect(() => {
    // Check for stored token
    const storedToken = localStorage.getItem('supabase_admin_token')
    if (storedToken) {
      setAuthToken(storedToken)
      setIsAuthenticated(true)
      loadDashboardData(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')

    if (!authToken.trim()) {
      setAuthError('Please enter your Supabase service role key')
      return
    }

    try {
      // Test the token by making a simple API call
      const response = await fetch('/api/content/posts?limit=1', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      if (response.status === 401) {
        setAuthError('Invalid service role key. Please check your token and try again.')
        return
      }

      if (!response.ok) {
        setAuthError('Failed to validate token. Please try again.')
        return
      }

      // Save token and authenticate
      localStorage.setItem('supabase_admin_token', authToken)
      setIsAuthenticated(true)
      loadDashboardData(authToken)
    } catch (error) {
      setAuthError('Failed to validate token. Please try again.')
    }
  }

  const loadDashboardData = async (token: string) => {
    setLoading(true)
    try {
      // Load posts
      const postsResponse = await fetch('/api/content/posts?limit=5&includeAuthor=true', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const postsData = await postsResponse.json()
      
      if (postsData.success) {
        setRecentPosts(postsData.data)
      }

      // Load authors
      const authorsResponse = await fetch('/api/content/authors', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const authorsData = await authorsResponse.json()
      
      if (authorsData.success) {
        setAuthors(authorsData.data)
      }

      // Load categories
      const categoriesResponse = await fetch('/api/content/categories', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const categoriesData = await categoriesResponse.json()
      
      if (categoriesData.success) {
        setCategories(categoriesData.data)
      }

      // Calculate stats
      const allPostsResponse = await fetch('/api/content/posts?limit=1000', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const allPostsData = await allPostsResponse.json()
      
      if (allPostsData.success) {
        const posts = allPostsData.data
        setStats({
          totalPosts: posts.length,
          publishedPosts: posts.filter((p: Post) => p.status === 'published').length,
          draftPosts: posts.filter((p: Post) => p.status === 'draft').length,
          totalAuthors: authorsData.data?.length || 0,
          totalCategories: categoriesData.data?.length || 0,
        })
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('supabase_admin_token')
    setIsAuthenticated(false)
    setAuthToken('')
    setStats(null)
    setRecentPosts([])
    setAuthors([])
    setCategories([])
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Content Management Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your Supabase service role key to access the dashboard
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                  Supabase Service Role Key
                </label>
                <div className="mt-1">
                  <input
                    id="token"
                    name="token"
                    type="password"
                    required
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your service role key"
                  />
                </div>
              </div>

              {authError && (
                <div className="text-red-600 text-sm">{authError}</div>
              )}

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Access Dashboard
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="text-sm text-gray-600">
                <p className="mb-2">You can find your service role key in:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Your Supabase project dashboard</li>
                  <li>Settings → API</li>
                  <li>Copy the "service_role" key</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Content Dashboard</h1>
              <p className="text-gray-600">Forge Journal Content Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/smart-import"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Smart Import
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Total Posts</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalPosts}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Published</h3>
              <p className="text-3xl font-bold text-green-600">{stats.publishedPosts}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Drafts</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.draftPosts}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Authors</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.totalAuthors}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Categories</h3>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalCategories}</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/posts"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Posts</h3>
            <p className="text-gray-600">Create, edit, and manage blog posts</p>
          </Link>
          <Link
            href="/admin/authors"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Authors</h3>
            <p className="text-gray-600">Add and edit author profiles</p>
          </Link>
          <Link
            href="/admin/categories"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Categories</h3>
            <p className="text-gray-600">Organize content with categories</p>
          </Link>
        </div>

        {/* Recent Posts */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Posts</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentPosts.map((post) => (
              <div key={post.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{post.title}</h4>
                    <p className="text-sm text-gray-600">
                      {post.author?.name} • {post.word_count} words • {post.reading_time} min read
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
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
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
