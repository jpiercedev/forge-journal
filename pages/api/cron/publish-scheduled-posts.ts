// Cron Job API - /api/cron/publish-scheduled-posts
// This endpoint should be called periodically (e.g., every 5 minutes) to publish scheduled posts

import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase/client'

interface ApiResponse {
  success: boolean
  data?: any
  error?: {
    code: string
    message: string
    details?: string
  }
  message?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method not allowed',
      },
    })
  }

  // Basic security: check for a cron secret or API key
  const cronSecret = req.headers['x-cron-secret'] || req.headers['authorization']
  const expectedSecret = process.env.CRON_SECRET || 'your-cron-secret-here'
  
  if (cronSecret !== expectedSecret) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Unauthorized access',
      },
    })
  }

  try {
    // Call the database function to publish scheduled posts
    const { data: publishedCount, error } = await supabaseAdmin
      .rpc('publish_scheduled_posts')

    if (error) {
      console.error('Error publishing scheduled posts:', error)
      return res.status(500).json({
        success: false,
        error: {
          code: 'PUBLISH_FAILED',
          message: 'Failed to publish scheduled posts',
          details: error.message,
        },
      })
    }

    const count = publishedCount || 0
    
    return res.status(200).json({
      success: true,
      data: {
        published_count: count,
        timestamp: new Date().toISOString(),
      },
      message: count > 0 
        ? `Successfully published ${count} scheduled post${count === 1 ? '' : 's'}`
        : 'No posts were scheduled for publishing at this time',
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { details: error.message }),
      },
    })
  }
}

// Example usage:
// curl -X POST http://localhost:3000/api/cron/publish-scheduled-posts \
//   -H "x-cron-secret: your-cron-secret-here"
//
// Or set up a cron job to call this endpoint every 5 minutes:
// */5 * * * * curl -X POST https://yourdomain.com/api/cron/publish-scheduled-posts -H "x-cron-secret: your-secret"
