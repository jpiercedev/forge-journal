// Single Post API - /api/content/posts/[id]

import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb, db, generateSlug, calculateReadingTime, type Post } from '../../../../lib/supabase/client'
import { withAdminAuth, validateMethod, successResponse, errorResponse, ApiResponse } from '../../../../lib/auth/middleware'

export default withAdminAuth(async (req, res) => {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: 'Valid post ID is required',
      },
    })
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetPost(req, res, id)
      case 'PUT':
        return await handleUpdatePost(req, res, id)
      case 'DELETE':
        return await handleDeletePost(req, res, id)
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
    console.error('Single post API error:', error)
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

// GET /api/content/posts/[id] - Get single post by ID
async function handleGetPost(req: any, res: NextApiResponse<ApiResponse>, id: string) {
  const { includeAuthor = 'true', includeCategories = 'true' } = req.query

  try {
    const result = await adminDb.getPostById(
      id,
      includeAuthor === 'true',
      includeCategories === 'true'
    )

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
    console.error('Get post error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch post',
      },
    })
  }
}

// PUT /api/content/posts/[id] - Update post
async function handleUpdatePost(req: any, res: NextApiResponse<ApiResponse>, id: string) {
  try {
    const {
      title,
      slug,
      content,
      excerpt,
      status,
      author_id,
      category_ids,
      cover_image_url,
      video_url,
      hide_featured_image,
    } = req.body

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title and content are required',
        },
      })
    }

    // Generate slug if not provided
    const finalSlug = slug || generateSlug(title)

    // Calculate reading time and word count
    const contentText = typeof content === 'string' ? content : JSON.stringify(content)
    const wordCount = contentText.split(/\s+/).length
    const readingTime = calculateReadingTime(contentText)

    // Prepare update data
    const updateData: Partial<Post> = {
      title,
      slug: finalSlug,
      content,
      excerpt,
      status: status || 'draft',
      author_id: author_id || null,
      word_count: wordCount,
      reading_time: readingTime,
      cover_image_url: cover_image_url || null,
      video_url: video_url || null,
      hide_featured_image: hide_featured_image || false,
      updated_at: new Date().toISOString(),
    }

    // Set published_at if status is published and it wasn't published before
    if (status === 'published') {
      // Check current status
      const currentPost = await db.getPostById(id)
      if (currentPost.data && !currentPost.error && (currentPost.data as any).status !== 'published') {
        updateData.published_at = new Date().toISOString()
      }
    }

    const result = await adminDb.updatePost(id, updateData)

    if (result.error) {
      throw result.error
    }

    // Handle category associations if provided
    if (category_ids && Array.isArray(category_ids)) {
      await adminDb.setPostCategories(id, category_ids)
    }

    // Fetch the updated post with relations
    const updatedPost = await db.getPostById(id, true, true)

    return res.status(200).json({
      success: true,
      data: updatedPost.data,
      message: 'Post updated successfully',
    })
  } catch (error) {
    console.error('Update post error:', error)
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

// DELETE /api/content/posts/[id] - Delete post
async function handleDeletePost(req: any, res: NextApiResponse<ApiResponse>, id: string) {
  try {
    const result = await adminDb.deletePost(id)

    if (result.error) {
      throw result.error
    }

    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    })
  } catch (error) {
    console.error('Delete post error:', error)
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
