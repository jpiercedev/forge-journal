// Post Edit Page - /admin/posts/[id]

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AdminLayout from 'components/admin/AdminLayout'
import { AdminProvider, useAdmin, withAdminAuth } from 'components/admin/AdminContext'
import LexicalEditor from 'components/admin/LexicalEditor'
import ImageUpload from 'components/ImageUpload'
import VideoEmbed, { isValidVideoUrl } from 'components/VideoEmbed'
import Alert from 'components/admin/Alert'
import PostScheduler from 'components/admin/PostScheduler'

interface Post {
  id: string
  title: string
  slug: string
  content: any
  excerpt?: string
  status: 'draft' | 'published' | 'archived'
  published_at?: string
  scheduled_publish_at?: string
  created_at: string
  updated_at: string
  author_id?: string
  video_url?: string
  hide_featured_image?: boolean
  cover_image_url?: string
  og_image_url?: string
  author?: {
    id: string
    name: string
    title?: string
  }
  categories?: Array<{
    id: string
    title: string
    slug: string
  }>
  word_count: number
  reading_time: number
}

interface Author {
  id: string
  name: string
  title?: string
}

interface Category {
  id: string
  title: string
  slug: string
}

function PostEditPage() {
  const { state } = useAdmin()
  const router = useRouter()
  const { id } = router.query
  
  const [post, setPost] = useState<Post | null>(null)
  const [authors, setAuthors] = useState<Author[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formatting, setFormatting] = useState(false)
  const [formatSuccess, setFormatSuccess] = useState('')
  const [editorKey, setEditorKey] = useState(0)
  const [generatingExcerpt, setGeneratingExcerpt] = useState(false)
  const [excerptSuccess, setExcerptSuccess] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    author_id: '',
    category_ids: [] as string[],
    cover_image: '',
    og_image: '',
    video_url: '',
    hide_featured_image: false,
  })

  const loadPost = useCallback(async () => {
    try {
      const response = await fetch(`/api/content/posts/${id}`, {
        credentials: 'include',
      })
      const data = await response.json()

      if (data.success) {
        setPost(data.data)
      } else {
        setError('Failed to load post')
      }
    } catch (error) {
      console.error('Failed to load post:', error)
      setError('Failed to load post')
    }
  }, [id])

  useEffect(() => {
    if (id) {
      loadPost()
      loadAuthors()
      loadCategories()
    }
  }, [id, loadPost])

  useEffect(() => {
    if (post) {
      // Handle content - if it's an object, convert to HTML, otherwise use as string
      let contentValue = ''
      if (typeof post.content === 'string') {
        contentValue = post.content
      } else if (post.content && typeof post.content === 'object') {
        // If content is stored as JSON, convert to a readable format
        contentValue = JSON.stringify(post.content, null, 2)
      }

      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: contentValue,
        status: post.status || 'draft',
        author_id: post.author_id || '',
        category_ids: post.categories?.map(c => c.id) || [],
        cover_image: post.cover_image_url || '',
        og_image: post.og_image_url || '',
        video_url: post.video_url || '',
        hide_featured_image: post.hide_featured_image || false,
      })
    }
  }, [post])

  const loadAuthors = async () => {
    try {
      const response = await fetch('/api/content/contributors', {
        credentials: 'include',
      })
      const data = await response.json()

      if (data.success) {
        setAuthors(data.data)
      }
    } catch (error) {
      console.error('Failed to load contributors:', error)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/content/categories', {
        credentials: 'include',
      })
      const data = await response.json()

      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      category_ids: checked
        ? [...prev.category_ids, categoryId]
        : prev.category_ids.filter(id => id !== categoryId)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const updateData = {
        ...formData,
        content: formData.content, // Lexical provides HTML content
        cover_image_url: formData.cover_image, // Map cover_image to cover_image_url for database
        og_image_url: formData.og_image || null, // Map og_image to og_image_url for database
        video_url: formData.video_url || null,
        hide_featured_image: formData.hide_featured_image,
      }

      // Remove the form fields since we're using database field names
      delete updateData.cover_image
      delete updateData.og_image

      const response = await fetch(`/api/content/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Post updated successfully!')
        // Reload the post to get updated data
        await loadPost()
      } else {
        setError(data.error?.message || 'Failed to update post')
      }
    } catch (error) {
      console.error('Failed to update post:', error)
      setError('Failed to update post')
    } finally {
      setSaving(false)
    }
  }

  const handleAIFormat = async () => {
    if (!post?.id) return

    setFormatting(true)
    setError('')
    setFormatSuccess('')

    try {
      const response = await fetch(`/api/content/posts/${post.id}/ai-format`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success) {
        setFormatSuccess(`AI Formatter applied successfully! Made ${data.data.changes.length} formatting improvements.`)

        // Update the form data directly with the formatted content
        const formattedContent = data.data.formattedContent
        let contentValue = ''

        if (formattedContent && typeof formattedContent === 'object') {
          // Use the structured content as a compact JSON string for the editor
          // The Lexical editor will parse this and convert to proper nodes
          contentValue = JSON.stringify(formattedContent)
        } else {
          contentValue = formattedContent || ''
        }

        setFormData(prev => ({ ...prev, content: contentValue }))

        // Force editor to re-initialize with new content
        setEditorKey(prev => prev + 1)

        // Also reload the post to sync with database
        await loadPost()
      } else {
        setError(data.error?.message || 'Failed to format post with AI')
      }
    } catch (error) {
      console.error('Failed to format post:', error)
      setError('Failed to format post with AI')
    } finally {
      setFormatting(false)
    }
  }

  const handleGenerateExcerpt = async () => {
    if (!post?.id) return

    setGeneratingExcerpt(true)
    setError('')
    setExcerptSuccess('')

    try {
      const response = await fetch(`/api/content/posts/${post.id}/generate-excerpt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success && data.data?.excerpt) {
        setExcerptSuccess('Excerpt generated successfully!')
        setFormData(prev => ({ ...prev, excerpt: data.data.excerpt }))
      } else {
        setError(data.error?.message || 'Failed to generate excerpt')
      }
    } catch (error) {
      console.error('Failed to generate excerpt:', error)
      setError('Failed to generate excerpt')
    } finally {
      setGeneratingExcerpt(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/content/posts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success) {
        router.push('/admin/posts')
      } else {
        setError(data.error?.message || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
      setError('Failed to delete post')
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Edit Post" description="Loading post..." currentSection="posts">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forge-teal mx-auto"></div>
            <p className="mt-4 text-gray-600 font-sans">Loading post...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!post) {
    return (
      <AdminLayout title="Post Not Found" description="The requested post could not be found" currentSection="posts">
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 font-sans mb-2">Post Not Found</h2>
          <p className="text-gray-600 font-sans mb-4">The post you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
          <Link
            href="/admin/posts"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-forge-teal hover:bg-forge-teal-hover font-sans"
          >
            Back to Posts
          </Link>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout 
      title={`Edit: ${post.title}`} 
      description="Edit post content, metadata, and settings"
      currentSection="posts"
    >
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-sans">Edit Post</h2>
          <p className="text-sm text-gray-600 font-sans">
            Last updated: {new Date(post.updated_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/admin/posts"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-sans"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Posts
          </Link>
          <Link
            href={`/posts/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-sans"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Post
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 font-sans"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Post
          </button>
          <button
            type="submit"
            form="edit-post-form"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-forge-teal hover:bg-forge-teal-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forge-teal disabled:opacity-50 disabled:cursor-not-allowed font-sans"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 14 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
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

      {/* Edit Form */}
      <form id="edit-post-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Status and Scheduling Section */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 font-sans mb-2">
                Status
              </label>
              <div className="relative">
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-forge-teal focus:border-forge-teal font-sans appearance-none bg-white text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              {/* Post Scheduler */}
              <PostScheduler
                postId={post?.id || ''}
                currentStatus={formData.status}
                scheduledPublishAt={post?.scheduled_publish_at}
                onScheduleSuccess={() => {
                  setSuccess('Post scheduled for publishing successfully!')
                  // Refresh the post data to get updated scheduled_publish_at
                  loadPost()
                }}
                onCancelSuccess={() => {
                  setSuccess('Scheduled publishing canceled successfully!')
                  // Refresh the post data to clear scheduled_publish_at
                  loadPost()
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 font-sans mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 font-sans">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-forge-teal focus:border-forge-teal font-sans"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 font-sans">
                Slug
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-forge-teal focus:border-forge-teal font-sans"
              />
            </div>
          </div>


        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 font-sans">Content</h3>
            <button
              type="button"
              onClick={handleAIFormat}
              disabled={formatting || !post?.id}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
            >
              {formatting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Formatting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI Format
                </>
              )}
            </button>
          </div>

          {formatSuccess && (
            <Alert
              type="success"
              message={formatSuccess}
              onDismiss={() => setFormatSuccess('')}
            />
          )}

          {excerptSuccess && (
            <Alert
              type="success"
              message={excerptSuccess}
              onDismiss={() => setExcerptSuccess('')}
            />
          )}

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 font-sans mb-3">
              Post Content
              <span className="text-xs text-gray-500 ml-2">
                (Use AI Format to automatically detect headings, quotes, and structure without changing your text)
              </span>
            </label>
            <LexicalEditor
              key={editorKey}
              value={formData.content}
              onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
              placeholder="Start writing your post content..."
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 md:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 font-sans mb-4">Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="author_id" className="block text-sm font-medium text-gray-700 font-sans">
                  Author
                </label>
                <div className="relative">
                  <select
                    id="author_id"
                    name="author_id"
                    value={formData.author_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-forge-teal focus:border-forge-teal font-sans appearance-none bg-white"
                  >
                    <option value="">Select an author</option>
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.name} {author.title && `(${author.title})`}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <ImageUpload
                  label="Cover Image"
                  value={formData.cover_image}
                  onChange={(url) => setFormData(prev => ({ ...prev, cover_image: url }))}
                  onError={(error) => setError(error)}
                  onSuccess={(message) => setSuccess(message)}
                  folder="posts"
                  placeholder="Upload a cover image for your post"
                  maxSize={5 * 1024 * 1024} // 5MB
                  showPreview={true}
                  showOptimizationStats={true}
                />

                {/* Unsplash Quick Link */}
                <div className="mt-3">
                  <a
                    href="https://unsplash.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors font-sans"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Need an image for your post?
                  </a>
                </div>
              </div>

              <div>
                <ImageUpload
                  label="Social Media Image (OG Image)"
                  value={formData.og_image}
                  onChange={(url) => setFormData(prev => ({ ...prev, og_image: url }))}
                  onError={(error) => setError(error)}
                  onSuccess={(message) => setSuccess(message)}
                  folder="posts"
                  placeholder="Upload a custom image for social media sharing (optional - will use cover image if not set)"
                  maxSize={5 * 1024 * 1024} // 5MB
                  showPreview={true}
                  showOptimizationStats={true}
                />
                <p className="text-xs text-gray-500 mt-1 font-sans">
                  Recommended size: 1200x630px. If not set, the system will use the cover image or generate one automatically.
                </p>
              </div>

              <div>
                <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 font-sans mb-2">
                  Video URL
                  <span className="text-xs text-gray-500 ml-2">
                    (YouTube, Vimeo, Wistia, Loom, or Twitch)
                  </span>
                </label>
                <input
                  type="url"
                  id="video_url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-forge-teal focus:border-forge-teal font-sans"
                  placeholder="https://www.youtube.com/watch?v=..."
                />

                {formData.video_url && (
                  <div className="mt-3">
                    {isValidVideoUrl(formData.video_url) ? (
                      <VideoEmbed url={formData.video_url} title={formData.title || 'Video Preview'} />
                    ) : (
                      <div className="text-sm text-red-600 font-sans">
                        Invalid video URL. Please check the URL and try again.
                      </div>
                    )}
                  </div>
                )}

                {formData.video_url && (
                  <div className="mt-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.hide_featured_image}
                        onChange={(e) => setFormData(prev => ({ ...prev, hide_featured_image: e.target.checked }))}
                        className="rounded border-gray-300 text-forge-teal focus:ring-forge-teal"
                      />
                      <span className="ml-2 text-sm text-gray-700 font-sans">
                        Hide featured image when video is present
                      </span>
                    </label>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 font-sans">
                    Excerpt
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateExcerpt}
                    disabled={generatingExcerpt || !post?.id || !formData.content}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
                  >
                    {generatingExcerpt ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="-ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate with AI
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  rows={3}
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-forge-teal focus:border-forge-teal font-sans"
                  placeholder="Brief summary of the post..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 md:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 font-sans mb-4">Categories</h3>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.category_ids.includes(category.id)}
                    onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                    className="h-4 w-4 text-forge-teal focus:ring-forge-teal border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 font-sans">{category.title}</span>
                </label>
              ))}
            </div>
          </div>
        </div>




      </form>
    </AdminLayout>
  )
}

const PostEditWithAuth = withAdminAuth(PostEditPage)

export default function PostEditPageWrapper() {
  return (
    <AdminProvider>
      <PostEditWithAuth />
    </AdminProvider>
  )
}
