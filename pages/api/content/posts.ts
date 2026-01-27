// Content Management API - Posts CRUD

import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb, db, generateSlug, calculateReadingTime, type Post } from '../../../lib/supabase/client'
import { withAdminAuth, validateMethod, successResponse, errorResponse, ApiResponse } from '../../../lib/auth/middleware'

// Helper function to extract plain text from structured content
function extractPlainTextFromContent(content: any): string {
  if (typeof content === 'string') return content

  if (content.content && Array.isArray(content.content)) {
    return content.content.map((block: any) => extractPlainTextFromContent(block)).join(' ')
  }

  if (content.text) return content.text

  return ''
}

export default withAdminAuth(async (req, res) => {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGetPosts(req, res)
      case 'POST':
        return await handleCreatePost(req, res)
      case 'PUT':
        return await handleUpdatePost(req, res)
      case 'DELETE':
        return await handleDeletePost(req, res)
      default:
        return res.status(405).json({
          success: false,
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: 'Method not allowed',
          },
        })
    }
  } catch (error) {
    console.error('Posts API error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { details: error.message }),
      },
    })
  }
})

// GET /api/content/posts - List posts with optional filters
async function handleGetPosts(req: any, res: NextApiResponse<ApiResponse>) {
  const { 
    status, 
    limit = '10', 
    offset = '0', 
    includeAuthor = 'true', 
    includeCategories = 'true',
    id,
    slug
  } = req.query

  // Get single post by ID or slug
  if (id || slug) {
    try {
      let result
      if (id) {
        result = await db.getPostById(
          id as string, 
          includeAuthor === 'true', 
          includeCategories === 'true'
        )
      } else {
        result = await db.getPostBySlug(
          slug as string, 
          includeAuthor === 'true', 
          includeCategories === 'true'
        )
      }

      if (result.error) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Post not found',
          },
        })
      }

      return res.status(200).json({
        success: true,
        data: result.data,
        message: 'Post retrieved successfully',
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch post',
        },
      })
    }
  }

  // List posts
  try {
    const result = await db.getPosts({
      status: status as 'draft' | 'published' | 'archived',
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      includeAuthor: includeAuthor === 'true',
      includeCategories: includeCategories === 'true',
    })

    if (result.error) {
      throw result.error
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      message: 'Posts retrieved successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch posts',
      },
    })
  }
}

// POST /api/content/posts - Create new post
async function handleCreatePost(req: any, res: NextApiResponse<ApiResponse>) {
  try {
    const postData = req.body

    // Validate required fields
    if (!postData.title || !postData.content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Title and content are required',
        },
      })
    }

    // Generate slug if not provided
    if (!postData.slug) {
      postData.slug = generateSlug(postData.title)
    }

    // Calculate content metrics
    const plainText = extractPlainTextFromContent(postData.content)
    postData.word_count = plainText.split(/\s+/).length
    postData.reading_time = calculateReadingTime(plainText)

    // Set default status
    if (!postData.status) {
      postData.status = 'draft'
    }

    // Set published_at for published posts
    if (postData.status === 'published' && !postData.published_at) {
      postData.published_at = new Date().toISOString()
    }

    // Extract category_ids before creating the post
    const categoryIds = postData.category_ids || []

    // Remove category_ids from postData since it's not a column in the posts table
    const { category_ids, ...postDataWithoutCategories } = postData

    // Handle empty string values for UUID fields (convert to null)
    if (postDataWithoutCategories.author_id === '') {
      postDataWithoutCategories.author_id = null
    }

    const result = await adminDb.createPost(postDataWithoutCategories)

    if (result.error) {
      throw result.error
    }

    // Set post categories if any were provided
    if (categoryIds.length > 0 && result.data?.id) {
      const categoryResult = await adminDb.setPostCategories(result.data.id, categoryIds)
      if (categoryResult.error) {
        console.error('Error setting post categories:', categoryResult.error)
        // Don't fail the entire operation, just log the error
      }
    }

    // Trigger revalidation for published posts
    if (postData.status === 'published' && result.data?.slug) {
      try {
        const pathsToRevalidate = [
          `/posts/${result.data.slug}`,
          '/',
          '/topics'
        ]
        for (const path of pathsToRevalidate) {
          await res.revalidate(path)
        }
        console.log(`Revalidated paths for new post: ${result.data.slug}`)
      } catch (revalidateError) {
        // Log but don't fail the request if revalidation fails
        console.error('Revalidation error:', revalidateError)
      }
    }

    return res.status(201).json({
      success: true,
      data: result.data,
      message: 'Post created successfully',
    })
  } catch (error) {
    console.error('Error in handleCreatePost:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_FAILED',
        message: 'Failed to create post',
        ...(process.env.NODE_ENV === 'development' && { details: error.message }),
      },
    })
  }
}

// PUT /api/content/posts - Update existing post
async function handleUpdatePost(req: any, res: NextApiResponse<ApiResponse>) {
  const { id } = req.query
  const updateData = req.body

  if (!id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Post ID is required',
      },
    })
  }

  try {
    // Update slug if title changed
    if (updateData.title && !updateData.slug) {
      updateData.slug = generateSlug(updateData.title)
    }

    // Recalculate content metrics if content changed
    if (updateData.content) {
      const plainText = extractPlainTextFromContent(updateData.content)
      updateData.word_count = plainText.split(/\s+/).length
      updateData.reading_time = calculateReadingTime(plainText)
    }

    // Set published_at when publishing
    if (updateData.status === 'published' && !updateData.published_at) {
      updateData.published_at = new Date().toISOString()
    }

    // Extract category_ids before updating the post
    const categoryIds = updateData.category_ids

    // Remove category_ids from updateData since it's not a column in the posts table
    const { category_ids, ...updateDataWithoutCategories } = updateData

    // Handle empty string values for UUID fields (convert to null)
    if (updateDataWithoutCategories.author_id === '') {
      updateDataWithoutCategories.author_id = null
    }

    const result = await adminDb.updatePost(id as string, updateDataWithoutCategories)

    if (result.error) {
      throw result.error
    }

    // Update post categories if category_ids were provided
    if (categoryIds !== undefined) {
      const categoryResult = await adminDb.setPostCategories(id as string, categoryIds || [])
      if (categoryResult.error) {
        console.error('Error updating post categories:', categoryResult.error)
        // Don't fail the entire operation, just log the error
      }
    }

    // Trigger revalidation for published posts
    if (updateData.status === 'published' && result.data?.slug) {
      try {
        const pathsToRevalidate = [
          `/posts/${result.data.slug}`,
          '/',
          '/topics'
        ]
        for (const path of pathsToRevalidate) {
          await res.revalidate(path)
        }
        console.log(`Revalidated paths for updated post: ${result.data.slug}`)
      } catch (revalidateError) {
        // Log but don't fail the request if revalidation fails
        console.error('Revalidation error:', revalidateError)
      }
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      message: 'Post updated successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: 'Failed to update post',
        ...(process.env.NODE_ENV === 'development' && { details: error.message }),
      },
    })
  }
}

// DELETE /api/content/posts - Delete post
async function handleDeletePost(req: any, res: NextApiResponse<ApiResponse>) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Post ID is required',
      },
    })
  }

  try {
    const result = await adminDb.deletePost(id as string)

    if (result.error) {
      throw result.error
    }

    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: 'Failed to delete post',
        ...(process.env.NODE_ENV === 'development' && { details: error.message }),
      },
    })
  }
}
