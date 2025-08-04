// New Post Page - /admin/posts/new

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AdminLayout from 'components/admin/AdminLayout'
import { AdminProvider, useAdmin, withAdminAuth } from 'components/admin/AdminContext'
import LexicalEditor from 'components/admin/LexicalEditor'
import ImageUpload from 'components/ImageUpload'
import VideoEmbed, { isValidVideoUrl } from 'components/VideoEmbed'
import Alert from 'components/admin/Alert'

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

function NewPostPage() {
  const { state } = useAdmin()
  const router = useRouter()
  
  const [authors, setAuthors] = useState<Author[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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
    video_url: '',
    hide_featured_image: false,
  })

  useEffect(() => {
    loadAuthors()
    loadCategories()
  }, [])

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

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        setError('Title is required')
        return
      }

      // Check if content is empty (including empty HTML tags)
      const contentText = formData.content
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .trim()

      if (!formData.content || contentText === '') {
        setError('Content is required')
        return
      }

      // Parse content if it's JSON
      let parsedContent = formData.content
      try {
        parsedContent = JSON.parse(formData.content)
      } catch {
        // Keep as string if not valid JSON
      }

      const createData = {
        ...formData,
        content: parsedContent,
        cover_image_url: formData.cover_image, // Map cover_image to cover_image_url for database
        video_url: formData.video_url || null,
        hide_featured_image: formData.hide_featured_image,
      }

      // Remove the cover_image field since we're using cover_image_url
      delete createData.cover_image

      console.log('Creating post with data:', createData)

      const response = await fetch('/api/content/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(createData),
      })

      const data = await response.json()
      console.log('API response:', data)

      if (data.success) {
        // Redirect to the edit page for the new post
        router.push(`/admin/posts/${data.data.id}`)
      } else {
        setError(data.error?.message || data.error?.details || 'Failed to create post')
      }
    } catch (error) {
      console.error('Failed to create post:', error)
      setError('Failed to create post')
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateExcerpt = async () => {
    setGeneratingExcerpt(true)
    setError('')
    setExcerptSuccess('')

    try {
      const response = await fetch('/api/content/generate-excerpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
        }),
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

  if (loading) {
    return (
      <AdminLayout title="New Post" description="Loading..." currentSection="posts">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forge-teal mx-auto"></div>
            <p className="mt-4 text-gray-600 font-sans">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout 
      title="Create New Post" 
      description="Create a new blog post"
      currentSection="posts"
    >
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-sans">Create New Post</h2>
          <p className="text-sm text-gray-600 font-sans">
            Fill in the details below to create a new blog post
          </p>
        </div>
        <Link
          href="/admin/posts"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-sans"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Posts
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-sans">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 rounded-lg bg-green-50 p-4 border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700 font-sans">{success}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                type="button"
                onClick={() => setSuccess('')}
                className="inline-flex text-green-400 hover:text-green-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 font-sans mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 font-sans">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-forge-teal focus:border-forge-teal font-sans"
                placeholder="Enter post title..."
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 font-sans">
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-forge-teal focus:border-forge-teal font-sans"
                placeholder="auto-generated-from-title"
              />
            </div>
          </div>


        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 font-sans mb-4">Content</h3>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 font-sans mb-3">
              Post Content *
            </label>
            <LexicalEditor
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
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 font-sans">
                  Status
                </label>
                <div className="relative">
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-forge-teal focus:border-forge-teal font-sans appearance-none bg-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

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
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 font-sans">
                  Excerpt
                </label>
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
              {categories.length > 0 ? (
                categories.map((category) => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.category_ids.includes(category.id)}
                      onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                      className="h-4 w-4 text-forge-teal focus:ring-forge-teal border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 font-sans">{category.title}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500 font-sans">No categories available</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, status: 'draft' }))}
            disabled={saving}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forge-teal disabled:opacity-50 disabled:cursor-not-allowed font-sans"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-forge-teal hover:bg-forge-teal-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forge-teal disabled:opacity-50 disabled:cursor-not-allowed font-sans"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              formData.status === 'published' ? 'Create & Publish' : 'Create Post'
            )}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}

const NewPostWithAuth = withAdminAuth(NewPostPage)

export default function NewPostPageWrapper() {
  return (
    <AdminProvider>
      <NewPostWithAuth />
    </AdminProvider>
  )
}
