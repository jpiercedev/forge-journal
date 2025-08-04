// API endpoint to get ad analytics
// GET /api/ads/analytics?ad_id=optional

import type { NextApiRequest, NextApiResponse } from 'next'
import { adminDb, supabaseAdmin } from '../../../lib/supabase/client'
import { withAdminAuth, AuthenticatedRequest } from '../../../lib/auth/middleware'
import type { AdApiResponse } from '../../../types/ads'

interface AnalyticsQuery {
  ad_id?: string
  days?: string
}

interface AnalyticsData {
  totalClicks: number
  clicksByAd: Array<{
    ad_id: string
    title: string
    headline: string
    type: string
    click_count: number
  }>
  clicksByDate: Array<{
    date: string
    clicks: number
  }>
  topPerformingAds: Array<{
    ad_id: string
    title: string
    headline: string
    type: string
    click_count: number
  }>
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<AdApiResponse<AnalyticsData>>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method not allowed',
      },
    })
  }

  try {
    const { ad_id, days = '30' } = req.query as AnalyticsQuery
    const daysNumber = parseInt(days, 10) || 30

    // Get date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysNumber)

    // Get all ads with their click counts
    const { data: ads, error: adsError } = await adminDb.getAds(undefined, false)

    if (adsError) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch ads',
          details: adsError.message,
        },
      })
    }

    // Get click data for the date range using Supabase client
    let clickQuery = supabaseAdmin
      .from('ad_clicks')
      .select('ad_id, clicked_at')
      .gte('clicked_at', startDate.toISOString())
      .lte('clicked_at', endDate.toISOString())
      .order('clicked_at', { ascending: false })

    if (ad_id) {
      clickQuery = clickQuery.eq('ad_id', ad_id)
    }

    const { data: clickData, error: clickError } = await clickQuery

    // Calculate analytics
    const totalClicks = ads?.reduce((sum, ad) => sum + (ad.click_count || 0), 0) || 0

    const clicksByAd = ads?.map(ad => ({
      ad_id: ad.id,
      title: ad.title,
      headline: ad.headline,
      type: ad.type,
      click_count: ad.click_count || 0,
    })) || []

    // Get top performing ads (sorted by click count)
    const topPerformingAds = [...clicksByAd]
      .sort((a, b) => b.click_count - a.click_count)
      .slice(0, 5)

    // Process clicks by date
    const clicksByDate: Array<{ date: string; clicks: number }> = []
    
    // Create a map of all dates in the range
    const dateMap = new Map<string, number>()
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      dateMap.set(dateStr, 0)
    }

    // Fill in actual click data
    if (clickData && !clickError) {
      clickData.forEach((row: any) => {
        const clickDate = new Date(row.clicked_at)
        const dateStr = clickDate.toISOString().split('T')[0]
        dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1)
      })
    }

    // Convert map to array
    dateMap.forEach((clicks, date) => {
      clicksByDate.push({ date, clicks })
    })

    // Sort by date (most recent first)
    clicksByDate.sort((a, b) => b.date.localeCompare(a.date))

    const analyticsData: AnalyticsData = {
      totalClicks,
      clicksByAd,
      clicksByDate,
      topPerformingAds,
    }

    return res.status(200).json({
      success: true,
      data: analyticsData,
      message: 'Analytics retrieved successfully',
    })

  } catch (error) {
    console.error('Ad analytics error:', error)
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

export default withAdminAuth(handler)
