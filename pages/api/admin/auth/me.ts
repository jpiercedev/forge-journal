// Get Current Admin User API Route

import { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth, validateMethod, successResponse } from '../../../../lib/auth/middleware'

export default withAdminAuth(async (req, res) => {
  // Only allow GET requests
  if (!validateMethod(req, ['GET'])) {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method not allowed',
      },
    })
  }

  try {
    // Return current user data (already validated by middleware)
    return res.status(200).json(
      successResponse(
        {
          user: req.user,
        },
        'User data retrieved successfully'
      )
    )
  } catch (error) {
    console.error('Get user API error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    })
  }
})
