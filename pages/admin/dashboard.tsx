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

  // Featured post sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [publishedPosts, setPublishedPosts] = useState<Post[]>([])
  const [currentFeaturedPost, setCurrentFeaturedPost] = useState<Post | null>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [isImmediate, setIsImmediate] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const loadPublishedPosts = async () => {
    try {
      const response = await fetch('/api/content/posts?status=published&includeAuthor=true&limit=50', {
        credentials: 'include',
      })
      const data = await response.json()

      if (data.success) {
        setPublishedPosts(data.data)
      }
    } catch (error) {
      console.error('Failed to load published posts:', error)
    }
  }

  const loadCurrentFeaturedPost = async () => {
    try {
      const response = await fetch('/api/content/featured-post', {
        credentials: 'include',
      })
      const data = await response.json()

      if (data.success && data.data) {
        setCurrentFeaturedPost(data.data)
      }
    } catch (error) {
      console.error('Failed to load current featured post:', error)
    }
  }

  const handleOpenFeaturedPostSidebar = async () => {
    setSidebarOpen(true)
    await loadPublishedPosts()
    await loadCurrentFeaturedPost()
  }

  const handleCloseSidebar = () => {
    setSidebarOpen(false)
    setSelectedPost(null)
    setScheduleDate('')
    setIsImmediate(true)
  }

  const handleSetFeaturedPost = async () => {
    if (!selectedPost) return

    setIsSubmitting(true)
    try {
      const scheduledAt = isImmediate ? new Date().toISOString() : new Date(scheduleDate).toISOString()

      const response = await fetch('/api/content/featured-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          post_id: selectedPost.id,
          scheduled_at: scheduledAt,
        }),
      })

      const data = await response.json()

      if (data.success) {
        await loadCurrentFeaturedPost()
        handleCloseSidebar()
        // Show success message (you could add a toast notification here)
        alert('Featured post updated successfully!')
      } else {
        throw new Error(data.error?.message || 'Failed to set featured post')
      }
    } catch (error) {
      console.error('Failed to set featured post:', error)
      alert('Failed to set featured post. Please try again.')
    } finally {
      setIsSubmitting(false)
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {/* Total Posts Card */}
          <div className="bg-white p-3 rounded-lg border border-gray-3 hover:shadow-md transition-all duration-200 min-h-[80px] flex flex-col justify-center">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 p-2 bg-primary-light rounded-lg">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-gray-6 uppercase tracking-wide font-sans truncate" title="Total Posts">
                  Total Posts
                </h3>
                <p className="text-lg font-bold text-gray-9 font-sans">{state.stats.totalPosts}</p>
              </div>
            </div>
          </div>

          {/* Published Posts Card */}
          <div className="bg-white p-3 rounded-lg border border-gray-3 hover:shadow-md transition-all duration-200 min-h-[80px] flex flex-col justify-center">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 p-2 bg-success-light rounded-lg">
                <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-gray-6 uppercase tracking-wide font-sans truncate" title="Published Posts">
                  Published
                </h3>
                <p className="text-lg font-bold text-success font-sans">{state.stats.publishedPosts}</p>
              </div>
            </div>
          </div>

          {/* Draft Posts Card */}
          <div className="bg-white p-3 rounded-lg border border-gray-3 hover:shadow-md transition-all duration-200 min-h-[80px] flex flex-col justify-center">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 p-2 bg-warning-light rounded-lg">
                <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-gray-6 uppercase tracking-wide font-sans truncate" title="Draft Posts">
                  Drafts
                </h3>
                <p className="text-lg font-bold text-warning font-sans">{state.stats.draftPosts}</p>
              </div>
            </div>
          </div>

          {/* Contributors Card */}
          <div className="bg-white p-3 rounded-lg border border-gray-3 hover:shadow-md transition-all duration-200 min-h-[80px] flex flex-col justify-center">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 p-2 bg-info-light rounded-lg">
                <svg className="w-4 h-4 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-gray-6 uppercase tracking-wide font-sans truncate" title="Contributors">
                  Contributors
                </h3>
                <p className="text-lg font-bold text-info font-sans">{state.stats.totalContributors}</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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

            <button
              onClick={handleOpenFeaturedPostSidebar}
              className="flex items-center p-5 rounded-lg border border-gray-3 hover:border-primary hover:bg-primary-light transition-all duration-200 group min-h-[80px] text-left"
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-gray-9 group-hover:text-primary font-sans transition-colors truncate">
                  Select Featured Post
                </h4>
                <p className="text-sm text-gray-6 font-sans mt-1 line-clamp-2">
                  Choose which post appears featured on homepage
                </p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <svg className="w-5 h-5 text-gray-5 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </button>
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

      {/* Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/5 z-40 transition-opacity duration-300 ease-in-out backdrop-blur-[0.5px]"
          onClick={handleCloseSidebar}
        />
      )}

      {/* Featured Post Selection Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-3 shadow-xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-3 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-9 font-sans">Featured Post</h3>
                <p className="text-xs text-gray-6 font-sans">Manage homepage featured content</p>
              </div>
            </div>
            <button
              onClick={handleCloseSidebar}
              className="p-2 hover:bg-gray-2 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Current Featured Post */}
            {currentFeaturedPost ? (
              <div className="bg-gradient-to-r from-primary-light to-primary-light/50 rounded-xl border border-primary/20 p-5">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-white font-sans">
                        Currently Featured
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-9 font-sans line-clamp-2 mb-1">
                      {currentFeaturedPost.title}
                    </h4>
                    {currentFeaturedPost.author && (
                      <p className="text-xs text-gray-6 font-sans">by {currentFeaturedPost.author.name}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 font-sans">No featured post selected</p>
                <p className="text-xs text-gray-500 font-sans mt-1">Choose a post below to feature on the homepage</p>
              </div>
            )}

            {/* Scheduling Options */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h4 className="text-sm font-semibold text-gray-9 font-sans mb-4 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                When to apply change
              </h4>
              <div className="space-y-3">
                <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  isImmediate
                    ? 'border-primary bg-primary-light'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="schedule"
                    checked={isImmediate}
                    onChange={() => setIsImmediate(true)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                    isImmediate ? 'border-primary' : 'border-gray-300'
                  }`}>
                    {isImmediate && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-9 font-sans">Apply immediately</span>
                    <p className="text-xs text-gray-600 font-sans mt-1">Changes will take effect right away</p>
                  </div>
                  <svg className={`w-5 h-5 ${isImmediate ? 'text-primary' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </label>

                <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  !isImmediate
                    ? 'border-primary bg-primary-light'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="schedule"
                    checked={!isImmediate}
                    onChange={() => setIsImmediate(false)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                    !isImmediate ? 'border-primary' : 'border-gray-300'
                  }`}>
                    {!isImmediate && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-9 font-sans">Schedule for later</span>
                    <p className="text-xs text-gray-600 font-sans mt-1">Set a specific date and time</p>
                  </div>
                  <svg className={`w-5 h-5 ${!isImmediate ? 'text-primary' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </label>
              </div>

              {!isImmediate && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 font-sans mb-2">
                    Select date and time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-sans text-sm transition-colors"
                  />
                  <p className="text-xs text-gray-500 font-sans mt-2">
                    The featured post will change at the specified time
                  </p>
                </div>
              )}
            </div>

            {/* Post Selection */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-5 border-b border-gray-200">
                <h4 className="text-sm font-semibold text-gray-9 font-sans flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Choose a post to feature
                </h4>
                <p className="text-xs text-gray-600 font-sans mt-1">Select from your published posts</p>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {publishedPosts.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {publishedPosts.map((post) => (
                      <button
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className={`w-full text-left p-4 transition-all duration-200 hover:bg-gray-50 ${
                          selectedPost?.id === post.id
                            ? 'bg-primary-light border-l-4 border-primary'
                            : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-2 ${
                            selectedPost?.id === post.id ? 'bg-primary' : 'bg-gray-300'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-gray-9 font-sans line-clamp-2 mb-1">
                              {post.title}
                            </h5>
                            <div className="flex items-center space-x-3 text-xs text-gray-600 font-sans">
                              {post.author && (
                                <span className="flex items-center">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  {post.author.name}
                                </span>
                              )}
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                {post.reading_time} min read
                              </span>
                            </div>
                          </div>
                          {selectedPost?.id === post.id && (
                            <div className="flex-shrink-0">
                              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 font-sans">No published posts available</p>
                    <p className="text-xs text-gray-500 font-sans mt-1">Create and publish posts to feature them</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex space-x-3">
              <button
                onClick={handleCloseSidebar}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 font-sans text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSetFeaturedPost}
                disabled={!selectedPost || isSubmitting}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-sans text-sm font-medium shadow-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Setting...
                  </span>
                ) : (
                  'Set Featured Post'
                )}
              </button>
            </div>
            {selectedPost && (
              <p className="text-xs text-gray-600 font-sans mt-3 text-center">
                &ldquo;{selectedPost.title}&rdquo; will become the featured post
              </p>
            )}
          </div>
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
