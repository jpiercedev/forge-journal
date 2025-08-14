// Featured Post API - /api/content/featured-post

import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb, supabaseAdmin } from '../../../lib/supabase/client'
import { withAdminAuth, validateMethod, successResponse, errorResponse, ApiResponse } from '../../../lib/auth/middleware'

export default withAdminAuth(async (req, res) => {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGetFeaturedPost(req, res)
      case 'POST':
        return await handleSetFeaturedPost(req, res)
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
    console.error('Featured Post API error:', error)
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

// GET /api/content/featured-post - Get current featured post
async function handleGetFeaturedPost(req: any, res: NextApiResponse<ApiResponse>) {
  try {
    const { data, error } = await supabaseAdmin
      .rpc('get_current_featured_post')

    if (error) {
      console.error('Error getting featured post:', error)
      return res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch featured post',
        },
      })
    }

    // If no featured post found, return null
    const featuredPost = data && data.length > 0 ? data[0] : null

    return res.status(200).json({
      success: true,
      data: featuredPost,
      message: featuredPost ? 'Featured post retrieved successfully' : 'No featured post found',
    })
  } catch (error) {
    console.error('Get featured post error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch featured post',
      },
    })
  }
}

// POST /api/content/featured-post - Set featured post
async function handleSetFeaturedPost(req: any, res: NextApiResponse<ApiResponse>) {
  const { post_id, scheduled_at } = req.body

  if (!post_id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'Post ID is required',
      },
    })
  }

  try {
    // Verify the post exists and is published
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('id, title, status')
      .eq('id', post_id)
      .single()

    if (postError || !post) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'POST_NOT_FOUND',
          message: 'Post not found',
        },
      })
    }

    if (post.status !== 'published') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'POST_NOT_PUBLISHED',
          message: 'Only published posts can be featured',
        },
      })
    }

    // Set the featured post using the database function
    const { data, error } = await supabaseAdmin
      .rpc('set_featured_post', {
        p_post_id: post_id,
        p_scheduled_at: scheduled_at || new Date().toISOString(),
      })

    if (error) {
      console.error('Error setting featured post:', error)
      return res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: 'Failed to set featured post',
        },
      })
    }

    return res.status(200).json({
      success: true,
      data: { id: data, post_id, scheduled_at },
      message: 'Featured post set successfully',
    })
  } catch (error) {
    console.error('Set featured post error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: 'Failed to set featured post',
      },
    })
  }
}
