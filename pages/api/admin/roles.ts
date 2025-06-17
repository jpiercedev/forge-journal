// Admin Roles API

import { withAdminAuth, validateMethod, successResponse, errorResponse } from '../../../lib/auth/middleware'
import { AdminAuth } from '../../../lib/auth/admin-auth'

export default withAdminAuth(async (req, res) => {
  // Only allow GET requests for now
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
    const roles = await AdminAuth.getRoles()
    
    return res.status(200).json(
      successResponse(roles, 'Roles retrieved successfully')
    )
  } catch (error) {
    console.error('Get roles error:', error)
    return res.status(500).json(
      errorResponse('FETCH_FAILED', 'Failed to fetch roles')
    )
  }
})
