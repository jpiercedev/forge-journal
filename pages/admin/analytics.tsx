// Admin Analytics Page
// Displays comprehensive analytics dashboard for tracking performance

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from 'components/admin/AdminLayout'
import AnalyticsDashboard from 'components/admin/AnalyticsDashboard'
import { trackAdminAction } from 'lib/utils/analytics'



export default function AdminAnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication and permissions
    checkAccess()
  }, [])

  const checkAccess = async () => {
    try {
      // In a real implementation, this would check user authentication and permissions
      // For now, we'll simulate the check
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Track admin page access
      trackAdminAction('view_analytics_page')
      
      setLoading(false)
    } catch (err) {
      setError('Access denied')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
              {error}
            </p>
            <button
              onClick={() => router.push('/admin')}
              className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition-colors"
              style={{ fontFamily: 'Proxima Nova, sans-serif' }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                Analytics Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                Track website performance, user engagement, and marketing attribution
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={() => window.open('https://analytics.google.com', '_blank')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                style={{ fontFamily: 'Proxima Nova, sans-serif' }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Google Analytics
              </button>
              <button
                onClick={() => window.open('https://business.facebook.com', '_blank')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                style={{ fontFamily: 'Proxima Nova, sans-serif' }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Meta Business
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <AnalyticsDashboard />

        {/* Additional Analytics Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tracking Status */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
              Tracking Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                  Google Analytics 4
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                  Meta Pixel
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                  Enhanced Tracking
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Enabled
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                  Cookie Consent
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Compliant
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => trackAdminAction('export_analytics_data')}
                className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                      Export Data
                    </div>
                    <div className="text-xs text-gray-500" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                      Download analytics report
                    </div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => trackAdminAction('view_conversion_funnel')}
                className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                      Conversion Funnel
                    </div>
                    <div className="text-xs text-gray-500" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                      Analyze user journey
                    </div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => trackAdminAction('configure_goals')}
                className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                      Configure Goals
                    </div>
                    <div className="text-xs text-gray-500" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                      Set up conversion tracking
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                Enhanced Analytics Implementation
              </h3>
              <div className="mt-2 text-sm text-blue-700" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                <p>
                  This dashboard shows simulated data. In production, this would connect to:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Google Analytics 4 Reporting API for real-time metrics</li>
                  <li>Meta Conversions API for Facebook/Instagram tracking</li>
                  <li>Supabase database for custom event tracking</li>
                  <li>Marketing attribution system for source tracking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

// Use getServerSideProps to prevent static generation
export async function getServerSideProps() {
  return {
    props: {}
  }
}
