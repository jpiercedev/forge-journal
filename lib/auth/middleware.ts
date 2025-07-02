// Authentication Middleware for Admin Routes

import { NextApiRequest, NextApiResponse } from 'next'
import { AdminAuth, AdminUser } from './admin-auth'

export interface AuthenticatedRequest extends NextApiRequest {
  user: AdminUser
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: string
  }
  message?: string
}

// Middleware to authenticate admin API requests
export function withAdminAuth<T = any>(
  handler: (req: AuthenticatedRequest, res: NextApiResponse<ApiResponse<T>>) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<T>>) => {
    try {
      // Get session token from Authorization header or cookie
      let sessionToken: string | undefined

      // Check Authorization header first
      const authHeader = req.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        sessionToken = authHeader.substring(7)
      }

      // Fallback to cookie
      if (!sessionToken && req.cookies.admin_session) {
        sessionToken = req.cookies.admin_session
      }

      if (!sessionToken) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication token required',
          },
        })
      }

      // Validate session
      const user = await AdminAuth.validateSession(sessionToken)
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_SESSION',
            message: 'Invalid or expired session',
          },
        })
      }

      // Add user to request object
      ;(req as AuthenticatedRequest).user = user

      // Call the actual handler
      await handler(req as AuthenticatedRequest, res)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      })
    }
  }
}

// Middleware to check specific permissions
export function withPermission(permission: string) {
  return function <T = any>(
    handler: (req: AuthenticatedRequest, res: NextApiResponse<ApiResponse<T>>) => Promise<void>
  ) {
    return withAdminAuth<T>(async (req: AuthenticatedRequest, res: NextApiResponse<ApiResponse<T>>) => {
      try {
        // Check if user has the required permission
        const hasPermission = await AdminAuth.hasPermission(req.user.id, permission)
        
        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: `Permission required: ${permission}`,
            },
          })
        }

        // Call the actual handler
        await handler(req, res)
      } catch (error) {
        console.error('Permission middleware error:', error)
        return res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
          },
        })
      }
    })
  }
}

// Helper function to extract session token from request
export function getSessionToken(req: NextApiRequest): string | null {
  // Check Authorization header first
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Fallback to cookie
  if (req.cookies.admin_session) {
    return req.cookies.admin_session
  }

  return null
}

// Helper function to set session cookie
export function setSessionCookie(res: NextApiResponse, sessionToken: string, maxAge: number = 24 * 60 * 60) {
  const isProduction = process.env.NODE_ENV === 'production'
  const secureFlag = isProduction ? 'Secure; ' : ''
  const sameSite = isProduction ? 'SameSite=Strict' : 'SameSite=Lax'

  res.setHeader('Set-Cookie', [
    `admin_session=${sessionToken}; HttpOnly; ${secureFlag}${sameSite}; Max-Age=${maxAge}; Path=/`,
  ])
}

// Helper function to clear session cookie
export function clearSessionCookie(res: NextApiResponse) {
  const isProduction = process.env.NODE_ENV === 'production'
  const secureFlag = isProduction ? 'Secure; ' : ''
  const sameSite = isProduction ? 'SameSite=Strict' : 'SameSite=Lax'

  res.setHeader('Set-Cookie', [
    `admin_session=; HttpOnly; ${secureFlag}${sameSite}; Max-Age=0; Path=/`,
  ])
}

// Validate request method
export function validateMethod(req: NextApiRequest, allowedMethods: string[]): boolean {
  return allowedMethods.includes(req.method || '')
}

// Standard error responses
export const ErrorResponses = {
  METHOD_NOT_ALLOWED: {
    success: false,
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: 'Method not allowed',
    },
  },
  VALIDATION_ERROR: (message: string) => ({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message,
    },
  }),
  NOT_FOUND: (resource: string) => ({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `${resource} not found`,
    },
  }),
  INTERNAL_ERROR: {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
  },
} as const

// Success response helper
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  }
}

// Error response helper
export function errorResponse(code: string, message: string): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
    },
  }
}
