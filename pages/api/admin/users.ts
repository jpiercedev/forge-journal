// Admin User Management API

import { withAdminAuth, withPermission, validateMethod, successResponse, errorResponse } from '../../../lib/auth/middleware'
import { AdminAuth } from '../../../lib/auth/admin-auth'

export default withPermission('users:*')(async (req, res) => {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGetUsers(req, res)
      case 'POST':
        return await handleCreateUser(req, res)
      case 'PUT':
        return await handleUpdateUser(req, res)
      case 'DELETE':
        return await handleDeleteUser(req, res)
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
    console.error('Users API error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    })
  }
})

// GET /api/admin/users - List all admin users
async function handleGetUsers(req: any, res: any) {
  const { id } = req.query

  try {
    if (id) {
      // Get single user (not implemented in AdminAuth yet, would need to add)
      return res.status(404).json(
        errorResponse('NOT_IMPLEMENTED', 'Single user retrieval not implemented')
      )
    }

    // Get all users
    const users = await AdminAuth.getUsers()
    
    return res.status(200).json(
      successResponse(users, 'Users retrieved successfully')
    )
  } catch (error) {
    console.error('Get users error:', error)
    return res.status(500).json(
      errorResponse('FETCH_FAILED', 'Failed to fetch users')
    )
  }
}

// POST /api/admin/users - Create new admin user
async function handleCreateUser(req: any, res: any) {
  const { email, password, first_name, last_name, role_id } = req.body

  // Validate required fields
  if (!email || !password || !first_name || !last_name || !role_id) {
    return res.status(400).json(
      errorResponse('VALIDATION_ERROR', 'Email, password, first name, last name, and role are required')
    )
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json(
      errorResponse('VALIDATION_ERROR', 'Invalid email format')
    )
  }

  // Validate password strength
  if (password.length < 8) {
    return res.status(400).json(
      errorResponse('VALIDATION_ERROR', 'Password must be at least 8 characters long')
    )
  }

  try {
    const user = await AdminAuth.createUser({
      email,
      password,
      first_name,
      last_name,
      role_id,
    })

    if (!user) {
      return res.status(400).json(
        errorResponse('CREATE_FAILED', 'Failed to create user. Email may already exist.')
      )
    }

    return res.status(201).json(
      successResponse(user, 'User created successfully')
    )
  } catch (error) {
    console.error('Create user error:', error)
    return res.status(500).json(
      errorResponse('CREATE_FAILED', 'Failed to create user')
    )
  }
}

// PUT /api/admin/users - Update admin user
async function handleUpdateUser(req: any, res: any) {
  const { id } = req.query
  const updates = req.body

  if (!id) {
    return res.status(400).json(
      errorResponse('VALIDATION_ERROR', 'User ID is required')
    )
  }

  // Don't allow password updates through this endpoint
  if (updates.password || updates.password_hash) {
    return res.status(400).json(
      errorResponse('VALIDATION_ERROR', 'Use password change endpoint for password updates')
    )
  }

  try {
    const user = await AdminAuth.updateUser(id as string, updates)

    if (!user) {
      return res.status(404).json(
        errorResponse('USER_NOT_FOUND', 'User not found')
      )
    }

    return res.status(200).json(
      successResponse(user, 'User updated successfully')
    )
  } catch (error) {
    console.error('Update user error:', error)
    return res.status(500).json(
      errorResponse('UPDATE_FAILED', 'Failed to update user')
    )
  }
}

// DELETE /api/admin/users - Delete admin user
async function handleDeleteUser(req: any, res: any) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json(
      errorResponse('VALIDATION_ERROR', 'User ID is required')
    )
  }

  // Prevent users from deleting themselves
  if (id === req.user.id) {
    return res.status(400).json(
      errorResponse('VALIDATION_ERROR', 'Cannot delete your own account')
    )
  }

  try {
    const success = await AdminAuth.deleteUser(id as string)

    if (!success) {
      return res.status(404).json(
        errorResponse('USER_NOT_FOUND', 'User not found')
      )
    }

    return res.status(200).json(
      successResponse(null, 'User deleted successfully')
    )
  } catch (error) {
    console.error('Delete user error:', error)
    return res.status(500).json(
      errorResponse('DELETE_FAILED', 'Failed to delete user')
    )
  }
}
