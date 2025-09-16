// Analytics Dashboard Component for Admin Interface
// Displays Google Analytics data, conversion metrics, and marketing attribution

import { useState, useEffect } from 'react'
import { trackAdminAction } from 'lib/utils/analytics'

interface AnalyticsData {
  pageViews: number
  sessions: number
  users: number
  bounceRate: number
  avgSessionDuration: number
  conversions: {
    newsletterSignups: number
    contactForms: number
    totalConversions: number
  }
  marketingSources: {
    source: string
    sessions: number
    conversions: number
    conversionRate: number
  }[]
  topPages: {
    page: string
    views: number
    uniqueViews: number
  }[]
  recentActivity: {
    timestamp: string
    event: string
    details: string
  }[]
}

interface AnalyticsDashboardProps {
  className?: string
}

export default function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('7d') // 7d, 30d, 90d

  useEffect(() => {
    loadAnalyticsData()
    trackAdminAction('view_analytics_dashboard')
  }, [dateRange])

  const loadAnalyticsData = async () => {
    setLoading(true)
    setError(null)

    try {
      // In a real implementation, this would call Google Analytics API
      // For now, we'll simulate the data structure
      const mockData: AnalyticsData = {
        pageViews: 12543,
        sessions: 8932,
        users: 6721,
        bounceRate: 42.3,
        avgSessionDuration: 185, // seconds
        conversions: {
          newsletterSignups: 234,
          contactForms: 67,
          totalConversions: 301
        },
        marketingSources: [
          { source: 'organic', sessions: 4521, conversions: 156, conversionRate: 3.45 },
          { source: 'direct', sessions: 2341, conversions: 89, conversionRate: 3.80 },
          { source: 'social', sessions: 1234, conversions: 34, conversionRate: 2.76 },
          { source: 'email', sessions: 836, conversions: 22, conversionRate: 2.63 }
        ],
        topPages: [
          { page: '/', views: 3421, uniqueViews: 2876 },
          { page: '/posts/leadership-principles', views: 1234, uniqueViews: 1098 },
          { page: '/posts/pastoral-care', views: 987, uniqueViews: 834 },
          { page: '/contributors', views: 654, uniqueViews: 543 }
        ],
        recentActivity: [
          { timestamp: '2024-01-15T10:30:00Z', event: 'Newsletter Signup', details: 'Source: organic search' },
          { timestamp: '2024-01-15T10:25:00Z', event: 'Blog Post View', details: '/posts/leadership-principles' },
          { timestamp: '2024-01-15T10:20:00Z', event: 'Social Share', details: 'Twitter - Leadership article' },
          { timestamp: '2024-01-15T10:15:00Z', event: 'Contact Form', details: 'General inquiry' }
        ]
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAnalyticsData(mockData)
    } catch (err) {
      setError('Failed to load analytics data')
      console.error('Analytics loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatDate = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString()
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
            Analytics Unavailable
          </h3>
          <p className="text-gray-600 mb-4" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
            {error}
          </p>
          <button
            onClick={loadAnalyticsData}
            className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition-colors"
            style={{ fontFamily: 'Proxima Nova, sans-serif' }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!analyticsData) return null

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
          Analytics Dashboard
        </h2>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
          style={{ fontFamily: 'Proxima Nova, sans-serif' }}
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{analyticsData.pageViews.toLocaleString()}</div>
          <div className="text-sm text-blue-800" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>Page Views</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{analyticsData.users.toLocaleString()}</div>
          <div className="text-sm text-green-800" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>Users</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{analyticsData.conversions.totalConversions}</div>
          <div className="text-sm text-purple-800" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>Conversions</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{analyticsData.bounceRate}%</div>
          <div className="text-sm text-orange-800" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>Bounce Rate</div>
        </div>
      </div>

      {/* Marketing Sources */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
          Marketing Sources
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                  Sessions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                  Conversions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                  Conv. Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.marketingSources.map((source, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                    {source.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                    {source.sessions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                    {source.conversions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                    {source.conversionRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Pages */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
          Top Pages
        </h3>
        <div className="space-y-2">
          {analyticsData.topPages.map((page, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                  {page.page}
                </div>
                <div className="text-xs text-gray-500" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                  {page.uniqueViews} unique views
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                {page.views.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
          Recent Activity
        </h3>
        <div className="space-y-3">
          {analyticsData.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                  {activity.event}
                </div>
                <div className="text-xs text-gray-500" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                  {activity.details}
                </div>
                <div className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                  {formatDate(activity.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
