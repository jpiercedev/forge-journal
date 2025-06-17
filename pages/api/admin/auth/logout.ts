// Admin Logout API Route

import { NextApiRequest, NextApiResponse } from 'next'
import { AdminAuth } from '../../../../lib/auth/admin-auth'
import { getSessionToken, clearSessionCookie, validateMethod, successResponse, errorResponse } from '../../../../lib/auth/middleware'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (!validateMethod(req, ['POST'])) {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method not allowed',
      },
    })
  }

  try {
    // Get session token
    const sessionToken = getSessionToken(req)

    if (sessionToken) {
      // Invalidate session in database
      await AdminAuth.logout(sessionToken)
    }

    // Clear session cookie
    clearSessionCookie(res)

    return res.status(200).json(
      successResponse(null, 'Logout successful')
    )
  } catch (error) {
    console.error('Logout API error:', error)
    
    // Still clear the cookie even if there's an error
    clearSessionCookie(res)
    
    return res.status(500).json(
      errorResponse('INTERNAL_ERROR', 'Internal server error')
    )
  }
}
