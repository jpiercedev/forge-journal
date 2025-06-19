// Setup ads table and sample data
// This endpoint will create sample ads if the table exists

import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase/client'

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
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    })
  }

  try {
    // First, let's check if the ads table exists by trying to query it
    const { data: existingAds, error: queryError } = await supabaseAdmin
      .from('ads')
      .select('*')
      .limit(1)

    if (queryError) {
      // Table likely doesn't exist
      return res.status(500).json({
        success: false,
        message: 'Ads table does not exist. Please create it manually in Supabase dashboard.',
        error: queryError.message,
      })
    }

    // Table exists, let's check if we have any ads
    const { data: allAds, error: countError } = await supabaseAdmin
      .from('ads')
      .select('*')

    if (countError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to query ads table',
        error: countError.message,
      })
    }

    if (allAds && allAds.length > 0) {
      return res.status(200).json({
        success: true,
        message: `Ads table already has ${allAds.length} ads`,
        data: allAds,
      })
    }

    // No ads exist, let's create sample data
    const sampleAds = [
      {
        title: 'Forge Pastors Training Banner',
        type: 'banner',
        headline: 'FORGE PASTORS TRAINING',
        subheading: 'Equipping Leaders to Shape the Nation • Next Cohort Starting Soon',
        background_image_url: 'https://images.unsplash.com/photo-1606768666853-403c90a981ad?w=800&h=200&fit=crop&crop=center',
        cta_text: 'SIGN UP NOW',
        cta_link: 'https://forgejournal.com/training',
        is_active: true,
        display_order: 1
      },
      {
        title: 'Leadership Resources Sidebar',
        type: 'sidebar',
        headline: 'LEADERSHIP RESOURCES',
        subheading: 'Download our free guide to pastoral leadership in challenging times',
        background_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=center',
        cta_text: 'DOWNLOAD FREE',
        cta_link: 'https://forgejournal.com/resources',
        is_active: true,
        display_order: 1
      }
    ]

    const { data: insertedAds, error: insertError } = await supabaseAdmin
      .from('ads')
      .insert(sampleAds)
      .select()

    if (insertError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to insert sample ads',
        error: insertError.message,
      })
    }

    return res.status(200).json({
      success: true,
      message: `Successfully created ${insertedAds.length} sample ads`,
      data: insertedAds,
    })

  } catch (error) {
    console.error('Setup error:', error)
    return res.status(500).json({
      success: false,
      message: 'Setup failed',
      error: error.message,
    })
  }
}
