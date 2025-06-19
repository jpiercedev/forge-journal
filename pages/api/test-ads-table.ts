// Test if ads table exists - no authentication required
// This endpoint will help us debug the table issue

import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabase/client'

interface ApiResponse {
  success: boolean
  message: string
  error?: string
  data?: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    console.log('Testing ads table existence...')
    
    // Try to query the ads table
    const { data: ads, error } = await supabaseAdmin
      .from('ads')
      .select('*')
      .limit(5)

    if (error) {
      console.error('Ads table query error:', error)
      
      // Check if it's a "table doesn't exist" error
      if (error.message.includes('relation "ads" does not exist') || 
          error.message.includes('table "ads" does not exist') ||
          error.code === 'PGRST116') {
        return res.status(200).json({
          success: false,
          message: 'Ads table does not exist. You need to create it first.',
          error: error.message,
          data: {
            tableExists: false,
            errorCode: error.code,
            errorDetails: error.details
          }
        })
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error querying ads table',
        error: error.message,
        data: {
          errorCode: error.code,
          errorDetails: error.details
        }
      })
    }

    console.log('Ads table query successful, found', ads?.length || 0, 'ads')
    
    return res.status(200).json({
      success: true,
      message: `Ads table exists with ${ads?.length || 0} records`,
      data: {
        tableExists: true,
        adsCount: ads?.length || 0,
        ads: ads
      }
    })

  } catch (error) {
    console.error('Unexpected error testing ads table:', error)
    return res.status(500).json({
      success: false,
      message: 'Unexpected error',
      error: error.message,
    })
  }
}
