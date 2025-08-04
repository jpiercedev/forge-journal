// Admin Notification Recipients API - Manage email notification recipients
import { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '../../../lib/auth/middleware'
import { supabaseAdmin } from '../../../lib/supabase/client'

interface NotificationRecipient {
  id: string
  email: string
  name: string
  notification_types: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CreateRecipientRequest {
  email: string
  name: string
  notification_types: string[]
  is_active?: boolean
}

interface UpdateRecipientRequest {
  email?: string
  name?: string
  notification_types?: string[]
  is_active?: boolean
}

export default withAdminAuth(async (req, res) => {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGetRecipients(req, res)
      case 'POST':
        return await handleCreateRecipient(req, res)
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
    console.error('Notification recipients API error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    })
  }
})

async function handleGetRecipients(req: NextApiRequest, res: NextApiResponse) {
  const { data: recipients, error } = await supabaseAdmin
    .from('notification_recipients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching notification recipients:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch notification recipients'
      }
    })
  }

  return res.status(200).json({
    success: true,
    data: recipients || []
  })
}

async function handleCreateRecipient(req: NextApiRequest, res: NextApiResponse) {
  const recipientData: CreateRecipientRequest = req.body

  // Validate required fields
  if (!recipientData.email || !recipientData.name || !recipientData.notification_types) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'Email, name, and notification_types are required'
      }
    })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(recipientData.email)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_EMAIL',
        message: 'Invalid email format'
      }
    })
  }

  // Validate notification types
  const validTypes = ['subscription', 'contact']
  const invalidTypes = recipientData.notification_types.filter(type => !validTypes.includes(type))
  if (invalidTypes.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_NOTIFICATION_TYPES',
        message: `Invalid notification types: ${invalidTypes.join(', ')}`
      }
    })
  }

  const { data: recipient, error } = await supabaseAdmin
    .from('notification_recipients')
    .insert({
      email: recipientData.email.trim().toLowerCase(),
      name: recipientData.name.trim(),
      notification_types: recipientData.notification_types,
      is_active: recipientData.is_active ?? true
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating notification recipient:', error)
    
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
        code: 'CREATE_FAILED',
        message: 'Failed to create notification recipient'
      }
    })
  }

  return res.status(201).json({
    success: true,
    data: recipient
  })
}
