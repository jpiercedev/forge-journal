// Admin Submissions API - Get subscribers and contact submissions
import { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '../../../lib/auth/middleware'
import { supabaseAdmin } from '../../../lib/supabase/client'

interface Subscriber {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  sms_opt_in: boolean
  virtuous_contact_id?: string
  is_existing: boolean
  source: string
  created_at: string
  updated_at: string
}

interface ContactSubmission {
  id: string
  name: string
  email: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  created_at: string
  updated_at: string
}

interface SubmissionsResponse {
  success: boolean
  data?: {
    subscribers: Subscriber[]
    contactSubmissions: ContactSubmission[]
    stats: {
      totalSubscribers: number
      totalContactSubmissions: number
      newContactSubmissions: number
    }
  }
  error?: string
}

export default withAdminAuth(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method not allowed'
      }
    })
  }

  try {
    // Get query parameters for pagination and filtering
    const { 
      page = '1', 
      limit = '50', 
      type = 'all', // 'subscribers', 'contacts', or 'all'
      status = 'all' // for contact submissions
    } = req.query

    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)
    const offset = (pageNum - 1) * limitNum

    let subscribers: Subscriber[] = []
    let contactSubmissions: ContactSubmission[] = []

    // Fetch subscribers if requested
    if (type === 'all' || type === 'subscribers') {
      const { data: subscribersData, error: subscribersError } = await supabaseAdmin
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limitNum - 1)

      if (subscribersError) {
        console.error('Error fetching subscribers:', subscribersError)
        return res.status(500).json({
          success: false,
          error: {
            code: 'FETCH_FAILED',
            message: 'Failed to fetch subscribers'
          }
        })
      }

      subscribers = subscribersData || []
    }

    // Fetch contact submissions if requested
    if (type === 'all' || type === 'contacts') {
      let query = supabaseAdmin
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply status filter if specified
      if (status !== 'all') {
        query = query.eq('status', status)
      }

      const { data: contactsData, error: contactsError } = await query
        .range(offset, offset + limitNum - 1)

      if (contactsError) {
        console.error('Error fetching contact submissions:', contactsError)
        return res.status(500).json({
          success: false,
          error: {
            code: 'FETCH_FAILED',
            message: 'Failed to fetch contact submissions'
          }
        })
      }

      contactSubmissions = contactsData || []
    }

    // Get stats
    const [subscribersCount, contactsCount, newContactsCount] = await Promise.all([
      supabaseAdmin
        .from('subscribers')
        .select('id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('contact_submissions')
        .select('id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('contact_submissions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new')
    ])

    const stats = {
      totalSubscribers: subscribersCount.count || 0,
      totalContactSubmissions: contactsCount.count || 0,
      newContactSubmissions: newContactsCount.count || 0
    }

    return res.status(200).json({
      success: true,
      data: {
        subscribers,
        contactSubmissions,
        stats
      }
    })

  } catch (error) {
    console.error('Submissions API error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    })
  }
})
