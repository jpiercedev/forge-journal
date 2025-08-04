// Admin Notification Recipient Detail API - Update/Delete individual recipients
import { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '../../../../lib/auth/middleware'
import { supabaseAdmin } from '../../../../lib/supabase/client'

interface UpdateRecipientRequest {
  email?: string
  name?: string
  notification_types?: string[]
  is_active?: boolean
}

export default withAdminAuth(async (req, res) => {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: 'Invalid recipient ID'
      }
    })
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetRecipient(req, res, id)
      case 'PATCH':
        return await handleUpdateRecipient(req, res, id)
      case 'DELETE':
        return await handleDeleteRecipient(req, res, id)
      default:
        return res.status(405).json({
          success: false,
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: 'Method not allowed'
          }
        })
    }
  } catch (error) {
    console.error('Notification recipient detail API error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    })
  }
})

async function handleGetRecipient(req: NextApiRequest, res: NextApiResponse, id: string) {
  const { data: recipient, error } = await supabaseAdmin
    .from('notification_recipients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching notification recipient:', error)
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Notification recipient not found'
      }
    })
  }

  return res.status(200).json({
    success: true,
    data: recipient
  })
}

async function handleUpdateRecipient(req: NextApiRequest, res: NextApiResponse, id: string) {
  const updateData: UpdateRecipientRequest = req.body

  // Validate email format if provided
  if (updateData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(updateData.email)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Invalid email format'
        }
      })
    }
  }

  // Validate notification types if provided
  if (updateData.notification_types) {
    const validTypes = ['subscription', 'contact']
    const invalidTypes = updateData.notification_types.filter(type => !validTypes.includes(type))
    if (invalidTypes.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_NOTIFICATION_TYPES',
          message: `Invalid notification types: ${invalidTypes.join(', ')}`
        }
      })
    }
  }

  // Build update object
  const updateObject: any = {}
  if (updateData.email) updateObject.email = updateData.email.trim().toLowerCase()
  if (updateData.name) updateObject.name = updateData.name.trim()
  if (updateData.notification_types) updateObject.notification_types = updateData.notification_types
  if (updateData.is_active !== undefined) updateObject.is_active = updateData.is_active

  const { data: recipient, error } = await supabaseAdmin
    .from('notification_recipients')
    .update(updateObject)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating notification recipient:', error)
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'A recipient with this email already exists'
        }
      })
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: 'Failed to update notification recipient'
      }
    })
  }

  if (!recipient) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Notification recipient not found'
      }
    })
  }

  return res.status(200).json({
    success: true,
    data: recipient
  })
}

async function handleDeleteRecipient(req: NextApiRequest, res: NextApiResponse, id: string) {
  const { data: recipient, error } = await supabaseAdmin
    .from('notification_recipients')
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error deleting notification recipient:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: 'Failed to delete notification recipient'
      }
    })
  }

  if (!recipient) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Notification recipient not found'
      }
    })
  }

  return res.status(200).json({
    success: true,
    data: recipient
  })
}
