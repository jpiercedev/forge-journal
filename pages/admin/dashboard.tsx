// Admin Dashboard for Forge Journal

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Head from 'next/head'

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

interface AdminUser {
  id: string
  email: string
  first_name: string
  last_name: string
  role?: {
    name: string
    description?: string
  }
}

export default function Dashboard() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const router = useRouter()

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/admin/auth/me', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.data.user)
          loadDashboardData()
        } else {
          router.push('/admin')
        }
      } else {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/admin')
    }
  }

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load posts
      const postsResponse = await fetch('/api/content/posts?limit=5&includeAuthor=true', {
        credentials: 'include',
      })
      const postsData = await postsResponse.json()

      if (postsData.success) {
        setRecentPosts(postsData.data)
      }

      // Load authors
      const authorsResponse = await fetch('/api/content/authors', {
        credentials: 'include',
      })
      const authorsData = await authorsResponse.json()

      if (authorsData.success) {
        setAuthors(authorsData.data)
      }

      // Load categories
      const categoriesResponse = await fetch('/api/content/categories', {
        credentials: 'include',
      })
      const categoriesData = await categoriesResponse.json()

      if (categoriesData.success) {
        setCategories(categoriesData.data)
      }

      // Calculate stats
      const allPostsResponse = await fetch('/api/content/posts?limit=1000', {
        credentials: 'include',
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

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always redirect to login page
      router.push('/admin')
    }
  }

  if (!user) {
    // This will redirect to login page via useEffect
    return null
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
    <>
      <Head>
        <title>Admin Dashboard - Forge Journal</title>
        <meta name="description" content="Admin dashboard for Forge Journal content management" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Merriweather, serif' }}>
                  Forge Journal Admin
                </h1>
                <p className="text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Content Management Dashboard
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Welcome, {user.first_name} {user.last_name}
                  {user.role && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {user.role.name}
                    </span>
                  )}
                </div>
                <Link
                  href="/admin/smart-import"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Smart Import
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            href="/admin/posts"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center mb-3">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Merriweather, serif' }}>
              Manage Posts
            </h3>
            <p className="text-gray-600 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Create, edit, and manage blog posts
            </p>
          </Link>

          <Link
            href="/admin/authors"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center mb-3">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Merriweather, serif' }}>
              Manage Authors
            </h3>
            <p className="text-gray-600 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Add and edit author profiles
            </p>
          </Link>

          <Link
            href="/admin/categories"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center mb-3">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Merriweather, serif' }}>
              Categories
            </h3>
            <p className="text-gray-600 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Organize content with categories
            </p>
          </Link>

          <Link
            href="/admin/users"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center mb-3">
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Merriweather, serif' }}>
              Admin Users
            </h3>
            <p className="text-gray-600 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Manage admin users and permissions
            </p>
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
    </>
  )
}
