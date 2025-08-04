// Ad Analytics Component for Admin Dashboard
import { useState, useEffect, useCallback } from 'react'
import type { Ad } from '../../types/ads'

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

interface AdAnalyticsProps {
  className?: string
}

export default function AdAnalytics({ className = '' }: AdAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeRange, setTimeRange] = useState('30') // days

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`/api/ads/analytics?days=${timeRange}`, {
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success) {
        setAnalytics(data.data)
      } else {
        setError(data.error?.message || 'Failed to load analytics')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-forge-teal"></div>
          <span className="ml-3 text-gray-600 font-sans">Loading analytics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <p className="text-red-600 font-sans">{error}</p>
          <button
            onClick={loadAnalytics}
            className="mt-4 px-4 py-2 bg-forge-teal text-white rounded-lg hover:bg-forge-teal-hover transition-colors font-sans"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 font-sans">Ad Analytics</h3>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-forge-teal focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600 font-sans">Total Clicks</p>
                <p className="text-2xl font-bold text-blue-900 font-sans">{analytics.totalClicks}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600 font-sans">Active Ads</p>
                <p className="text-2xl font-bold text-green-900 font-sans">
                  {analytics.clicksByAd.filter(ad => ad.click_count > 0).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600 font-sans">Top Performer</p>
                <p className="text-lg font-bold text-purple-900 font-sans">
                  {analytics.topPerformingAds[0]?.click_count || 0} clicks
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Ads */}
        <div className="mb-8">
          <h4 className="text-md font-semibold text-gray-900 font-sans mb-4">Top Performing Ads</h4>
          <div className="space-y-3">
            {analytics.topPerformingAds.slice(0, 5).map((ad, index) => (
              <div key={ad.ad_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-forge-teal text-white text-xs font-bold rounded-full font-sans">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 font-sans">{ad.title}</p>
                    <p className="text-xs text-gray-500 font-sans">
                      {ad.type} • {ad.headline}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 font-sans">{ad.click_count}</p>
                  <p className="text-xs text-gray-500 font-sans">clicks</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 font-sans mb-4">Recent Activity</h4>
          <div className="space-y-2">
            {analytics.clicksByDate.slice(0, 7).map((day) => (
              <div key={day.date} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600 font-sans">
                  {new Date(day.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <span className="text-sm font-medium text-gray-900 font-sans">
                  {day.clicks} clicks
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
