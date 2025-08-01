// Admin Submission Detail API - Update contact submission status
import { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '../../../../lib/auth/middleware'
import { supabaseAdmin } from '../../../../lib/supabase/client'

interface UpdateSubmissionRequest {
  status?: 'new' | 'read' | 'replied' | 'archived'
}

interface SubmissionResponse {
  success: boolean
  data?: any
  error?: string
}

export default withAdminAuth(async (req, res) => {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: 'Invalid submission ID'
      }
    })
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetSubmission(req, res, id)
      case 'PATCH':
        return await handleUpdateSubmission(req, res, id)
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
    console.error('Submission detail API error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    })
  }
})

async function handleGetSubmission(req: any, res: any, id: string) {
  // Check if it's a contact submission or subscriber
  const { data: contactSubmission, error: contactError } = await supabaseAdmin
    .from('contact_submissions')
    .select('*')
    .eq('id', id)
    .single()

  if (!contactError && contactSubmission) {
    return res.status(200).json({
      success: true,
      data: {
        type: 'contact',
        ...contactSubmission
      }
    })
  }

  // Check if it's a subscriber
  const { data: subscriber, error: subscriberError } = await supabaseAdmin
    .from('subscribers')
    .select('*')
    .eq('id', id)
    .single()

  if (!subscriberError && subscriber) {
    return res.status(200).json({
      success: true,
      data: {
        type: 'subscriber',
        ...subscriber
      }
    })
  }

  return res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Submission not found'
    }
  })
}

async function handleUpdateSubmission(req: any, res: any, id: string) {
  const updateData: UpdateSubmissionRequest = req.body

  if (!updateData.status) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELD',
        message: 'Status is required'
      }
    })
  }

  // Only contact submissions can have their status updated
  const { data: updatedSubmission, error } = await supabaseAdmin
    .from('contact_submissions')
    .update({
      status: updateData.status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating contact submission:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: 'Failed to update submission'
      }
    })
  }

  if (!updatedSubmission) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Contact submission not found'
      }
    })
  }

  return res.status(200).json({
    success: true,
    data: updatedSubmission
  })
}
