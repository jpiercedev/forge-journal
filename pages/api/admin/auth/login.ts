// Admin Login API Route

import { NextApiRequest, NextApiResponse } from 'next'
import { AdminAuth } from '../../../../lib/auth/admin-auth'
import { setSessionCookie, validateMethod, successResponse, errorResponse } from '../../../../lib/auth/middleware'

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
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json(
        errorResponse('VALIDATION_ERROR', 'Email and password are required')
      )
    }

    // Attempt login
    const result = await AdminAuth.login({ email, password })

    if (!result) {
      return res.status(401).json(
        errorResponse('INVALID_CREDENTIALS', 'Invalid email or password')
      )
    }

    // Set session cookie
    setSessionCookie(res, result.session.session_token)

    // Return success response with user data (no session token in response for security)
    return res.status(200).json(
      successResponse(
        {
          user: result.user,
        },
        'Login successful'
      )
    )
  } catch (error) {
    console.error('Login API error:', error)
    return res.status(500).json(
      errorResponse('INTERNAL_ERROR', 'Internal server error')
    )
  }
}
