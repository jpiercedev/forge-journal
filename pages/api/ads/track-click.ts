// API endpoint to track ad clicks
// POST /api/ads/track-click

import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase/client'
import type { AdClickData, AdApiResponse } from '../../../types/ads'

interface TrackClickRequest extends NextApiRequest {
  body: AdClickData
}

export default async function handler(
  req: TrackClickRequest,
  res: NextApiResponse<AdApiResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method not allowed',
      },
    })
  }

  try {
    const { ad_id, user_ip, user_agent, referrer, page_url } = req.body

    // Validate required fields
    if (!ad_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ad_id is required',
        },
      })
    }

    // Verify the ad exists
    const { data: ad, error: adError } = await supabase
      .from('ads')
      .select('id')
      .eq('id', ad_id)
      .single()

    if (adError || !ad) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'AD_NOT_FOUND',
          message: 'Ad not found',
        },
      })
    }

    // Get client IP from headers if not provided
    const clientIp = user_ip || 
      req.headers['x-forwarded-for'] || 
      req.headers['x-real-ip'] || 
      req.connection?.remoteAddress || 
      'unknown'

    // Get user agent from headers if not provided
    const clientUserAgent = user_agent || req.headers['user-agent'] || 'unknown'

    // Insert click record (this will automatically increment the click count via trigger)
    const { data: clickData, error: clickError } = await supabase
      .from('ad_clicks')
      .insert({
        ad_id,
        user_ip: Array.isArray(clientIp) ? clientIp[0] : clientIp,
        user_agent: clientUserAgent,
        referrer: referrer || req.headers.referer || null,
        page_url: page_url || null,
      })
      .select()
      .single()

    if (clickError) {
      console.error('Error tracking ad click:', clickError)
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to track ad click',
          details: clickError.message,
        },
      })
    }

    // Get updated ad with new click count
    const { data: updatedAd, error: updateError } = await supabase
      .from('ads')
      .select('id, click_count')
      .eq('id', ad_id)
      .single()

    if (updateError) {
      console.error('Error fetching updated ad:', updateError)
      // Still return success since the click was tracked
    }

    return res.status(200).json({
      success: true,
      data: {
        click_id: clickData.id,
        ad_id,
        click_count: updatedAd?.click_count || null,
      },
      message: 'Ad click tracked successfully',
    })

  } catch (error) {
    console.error('Ad click tracking error:', error)
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    })
  }
}
