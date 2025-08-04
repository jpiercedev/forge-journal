// Admin Dashboard for Forge Journal SPA

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from 'components/admin/AdminLayout'
import { AdminProvider, useAdmin, withAdminAuth } from 'components/admin/AdminContext'

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

function Dashboard() {
  const { state, refreshStats } = useAdmin()
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    // Refresh stats when component mounts
    refreshStats()
  }, [refreshStats])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load recent posts
      const postsResponse = await fetch('/api/content/posts?limit=5&includeAuthor=true', {
        credentials: 'include',
      })
      const postsData = await postsResponse.json()

      if (postsData.success) {
        setRecentPosts(postsData.data)
      }

      // Load contributors
      const contributorsResponse = await fetch('/api/content/contributors', {
        credentials: 'include',
      })
      const contributorsData = await contributorsResponse.json()

      if (contributorsData.success) {
        setAuthors(contributorsData.data)
      }

      // Load categories
      const categoriesResponse = await fetch('/api/content/categories', {
        credentials: 'include',
      })
      const categoriesData = await categoriesResponse.json()

      if (categoriesData.success) {
        setCategories(categoriesData.data)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Dashboard" description="Content Management Overview" currentSection="dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forge-teal mx-auto"></div>
            <p className="mt-4 text-gray-600 font-sans">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Dashboard" description="Content Management Overview" currentSection="dashboard">
      {/* Stats Cards */}
      {state.stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 lg:gap-6 mb-8">
          {/* Total Posts Card */}
          <div className="bg-white p-5 lg:p-6 rounded-lg border border-gray-3 hover:shadow-lg transition-all duration-200 min-h-[120px] flex flex-col justify-center">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-3 bg-primary-light rounded-lg">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-gray-6 uppercase tracking-wide font-sans truncate" title="Total Posts">
                  Total Posts
                </h3>
                <p className="text-2xl font-bold text-gray-9 font-sans mt-1">{state.stats.totalPosts}</p>
              </div>
            </div>
          </div>

          {/* Published Posts Card */}
          <div className="bg-white p-5 lg:p-6 rounded-lg border border-gray-3 hover:shadow-lg transition-all duration-200 min-h-[120px] flex flex-col justify-center">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-3 bg-success-light rounded-lg">
                <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-gray-6 uppercase tracking-wide font-sans truncate" title="Published Posts">
                  Published
                </h3>
                <p className="text-2xl font-bold text-success font-sans mt-1">{state.stats.publishedPosts}</p>
              </div>
            </div>
          </div>

          {/* Draft Posts Card */}
          <div className="bg-white p-5 lg:p-6 rounded-lg border border-gray-3 hover:shadow-lg transition-all duration-200 min-h-[120px] flex flex-col justify-center">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-3 bg-warning-light rounded-lg">
                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-gray-6 uppercase tracking-wide font-sans truncate" title="Draft Posts">
                  Drafts
                </h3>
                <p className="text-2xl font-bold text-warning font-sans mt-1">{state.stats.draftPosts}</p>
              </div>
            </div>
          </div>

          {/* Contributors Card */}
          <div className="bg-white p-5 lg:p-6 rounded-lg border border-gray-3 hover:shadow-lg transition-all duration-200 min-h-[120px] flex flex-col justify-center">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-3 bg-info-light rounded-lg">
                <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-gray-6 uppercase tracking-wide font-sans truncate" title="Contributors">
                  Contributors
                </h3>
                <p className="text-2xl font-bold text-info font-sans mt-1">{state.stats.totalContributors}</p>
              </div>
            </div>
          </div>

          {/* Categories Card */}
          <div className="bg-white p-5 lg:p-6 rounded-lg border border-gray-3 hover:shadow-lg transition-all duration-200 min-h-[120px] flex flex-col justify-center">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-3 bg-primary-light rounded-lg">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-gray-6 uppercase tracking-wide font-sans truncate" title="Categories">
                  Categories
                </h3>
                <p className="text-2xl font-bold text-primary font-sans mt-1">{state.stats.totalCategories}</p>
              </div>
            </div>
          </div>

          {/* Admin Users Card */}
          <div className="bg-white p-5 lg:p-6 rounded-lg border border-gray-3 hover:shadow-lg transition-all duration-200 min-h-[120px] flex flex-col justify-center">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-3 bg-danger-light rounded-lg">
                <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-gray-6 uppercase tracking-wide font-sans truncate" title="Admin Users">
                  Admin Users
                </h3>
                <p className="text-2xl font-bold text-danger font-sans mt-1">{state.stats.totalUsers}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-3 shadow-sm mb-8">
        <div className="px-6 py-5 border-b border-gray-3">
          <h3 className="text-lg font-bold text-gray-9 font-sans">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <Link
              href="/admin/smart-import"
              className="flex items-center p-5 rounded-lg border border-gray-3 hover:border-primary hover:bg-primary-light transition-all duration-200 group min-h-[80px]"
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-gray-9 group-hover:text-primary font-sans transition-colors truncate">
                  Smart Import
                </h4>
                <p className="text-sm text-gray-6 font-sans mt-1 line-clamp-2">
                  AI-powered content import
                </p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <svg className="w-5 h-5 text-gray-5 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link
              href="/admin/posts"
              className="flex items-center p-5 rounded-lg border border-gray-3 hover:border-primary hover:bg-primary-light transition-all duration-200 group min-h-[80px]"
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-gray-9 group-hover:text-primary font-sans transition-colors truncate">
                  Manage Posts
                </h4>
                <p className="text-sm text-gray-6 font-sans mt-1 line-clamp-2">
                  Create and edit blog posts
                </p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <svg className="w-5 h-5 text-gray-5 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link
              href="/admin/contributors"
              className="flex items-center p-5 rounded-lg border border-gray-3 hover:border-primary hover:bg-primary-light transition-all duration-200 group min-h-[80px]"
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-gray-9 group-hover:text-primary font-sans transition-colors truncate">
                  Manage Contributors
                </h4>
                <p className="text-sm text-gray-6 font-sans mt-1 line-clamp-2">
                  Add and edit contributor profiles
                </p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <svg className="w-5 h-5 text-gray-5 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-3">
        <div className="px-6 py-5 border-b border-gray-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-9 font-sans">Recent Posts</h3>
            <Link
              href="/admin/posts"
              className="text-sm text-primary hover:text-primary-hover font-semibold font-sans transition-colors"
            >
              View all →
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentPosts.length > 0 ? (
            recentPosts.map((post) => (
              <div key={post.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 font-sans truncate">{post.title}</h4>
                    <div className="flex items-center mt-1 text-sm text-gray-600 font-sans">
                      <span>{post.author?.name}</span>
                      <span className="mx-2">•</span>
                      <span>{post.word_count} words</span>
                      <span className="mx-2">•</span>
                      <span>{post.reading_time} min read</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 ml-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium font-sans ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : post.status === 'draft'
                          ? 'bg-forge-gold bg-opacity-20 text-forge-gold'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {post.status}
                    </span>
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="text-forge-teal hover:text-forge-teal-hover text-sm font-medium font-sans"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 font-sans">No posts yet. Create your first post!</p>
              <Link
                href="/admin/posts"
                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-forge-teal hover:bg-forge-teal-hover font-sans"
              >
                Create Post
              </Link>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

const DashboardWithAuth = withAdminAuth(Dashboard)

export default function DashboardPage() {
  return (
    <AdminProvider>
      <DashboardWithAuth />
    </AdminProvider>
  )
}
