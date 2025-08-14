// Post Scheduling API - /api/content/posts/[id]/schedule

import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../../../lib/supabase/client'
import { withAdminAuth, ApiResponse } from '../../../../../lib/auth/middleware'

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
      case 'POST':
        return await handleSchedulePost(req, res, id)
      case 'DELETE':
        return await handleCancelSchedule(req, res, id)
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
    console.error('Post scheduling API error:', error)
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

// POST /api/content/posts/[id]/schedule - Schedule a post for publishing
async function handleSchedulePost(req: any, res: NextApiResponse<ApiResponse>, postId: string) {
  const { scheduled_at } = req.body

  if (!scheduled_at) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'Scheduled publish time is required',
      },
    })
  }

  // Validate that the scheduled time is in the future
  const scheduledDate = new Date(scheduled_at)
  const now = new Date()
  
  if (scheduledDate <= now) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_DATE',
        message: 'Scheduled time must be in the future',
      },
    })
  }

  try {
    // Verify the post exists and is a draft
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('id, title, status')
      .eq('id', postId)
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

    if (post.status !== 'draft') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Only draft posts can be scheduled for publishing',
        },
      })
    }

    // Schedule the post using the database function
    const { data, error } = await supabaseAdmin
      .rpc('schedule_post_publish', {
        p_post_id: postId,
        p_scheduled_at: scheduled_at,
      })

    if (error) {
      console.error('Error scheduling post:', error)
      return res.status(500).json({
        success: false,
        error: {
          code: 'SCHEDULE_FAILED',
          message: 'Failed to schedule post',
        },
      })
    }

    if (!data) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SCHEDULE_FAILED',
          message: 'Post could not be scheduled (may not be a draft)',
        },
      })
    }

    return res.status(200).json({
      success: true,
      data: { 
        post_id: postId, 
        scheduled_at,
        message: 'Post scheduled successfully'
      },
      message: 'Post scheduled for publishing',
    })
  } catch (error) {
    console.error('Schedule post error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'SCHEDULE_FAILED',
        message: 'Failed to schedule post',
      },
    })
  }
}

// DELETE /api/content/posts/[id]/schedule - Cancel scheduled publishing
async function handleCancelSchedule(req: any, res: NextApiResponse<ApiResponse>, postId: string) {
  try {
    // Cancel the scheduled publishing using the database function
    const { data, error } = await supabaseAdmin
      .rpc('cancel_scheduled_publish', {
        p_post_id: postId,
      })

    if (error) {
      console.error('Error canceling scheduled publish:', error)
      return res.status(500).json({
        success: false,
        error: {
          code: 'CANCEL_FAILED',
          message: 'Failed to cancel scheduled publishing',
        },
      })
    }

    return res.status(200).json({
      success: true,
      data: { 
        post_id: postId,
        message: 'Scheduled publishing canceled'
      },
      message: 'Scheduled publishing canceled successfully',
    })
  } catch (error) {
    console.error('Cancel schedule error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'CANCEL_FAILED',
        message: 'Failed to cancel scheduled publishing',
      },
    })
  }
}
