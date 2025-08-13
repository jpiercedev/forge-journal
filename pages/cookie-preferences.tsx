import ForgeLayout from 'components/ForgeLayout'
import { db, type Post } from 'lib/supabase/client'
import { useCookieConsent } from 'hooks/useCookieConsent'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface PageProps {
  posts: Post[]
}

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

export default function CookiePreferences({ posts }: PageProps) {
  const { preferences, hasConsent, updatePreferences, revokeConsent, isLoading } = useCookieConsent()
  const [localPreferences, setLocalPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences)
    }
  }, [preferences])

  const handlePreferenceChange = (type: keyof CookiePreferences, value: boolean) => {
    if (type === 'necessary') return // Can't change necessary cookies
    setLocalPreferences(prev => ({
      ...prev,
      [type]: value
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      updatePreferences(localPreferences)
      
      // Apply preferences to tracking scripts
      if (typeof window !== 'undefined') {
        // Handle Google Analytics
        if (window.gtag) {
          window.gtag('consent', 'update', {
            analytics_storage: localPreferences.analytics ? 'granted' : 'denied'
          })
        }

        // Handle Meta Pixel
        if (window.fbq) {
          if (localPreferences.marketing) {
            window.fbq('consent', 'grant')
          } else {
            window.fbq('consent', 'revoke')
          }
        }
      }

      setSaveMessage('Your cookie preferences have been saved successfully.')
    } catch (error) {
      setSaveMessage('There was an error saving your preferences. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRevokeAll = () => {
    if (confirm('Are you sure you want to revoke all cookie consent? This will reset all your preferences.')) {
      revokeConsent()
      setLocalPreferences({
        necessary: true,
        analytics: false,
        marketing: false,
      })
      setSaveMessage('All cookie consent has been revoked.')
    }
  }

  if (isLoading) {
    return (
      <ForgeLayout 
        preview={false}
        loading={false}
        recentPosts={posts.slice(0, 3)} 
        showSidebar={true}
      >
        <div className="max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading cookie preferences...</p>
            </div>
          </div>
        </div>
      </ForgeLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Cookie Preferences - The Forge Journal</title>
        <meta name="description" content="Manage your cookie preferences for The Forge Journal. Control how we use cookies to enhance your browsing experience." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <ForgeLayout 
        preview={false}
        loading={false}
        recentPosts={posts.slice(0, 3)} 
        showSidebar={true}
      >
        <div className="max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6 font-sans">
              Cookie Preferences
            </h1>
            <div className="border-b-4 border-gray-900 w-16 mb-8"></div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <p className="text-gray-700 mb-6">
              Manage your cookie preferences below. You can change these settings at any time. 
              Learn more about how we use cookies in our{' '}
              <Link href="/privacy-policy" className="text-red-700 hover:text-red-800 underline">
                Privacy Policy
              </Link>.
            </p>

            {!hasConsent && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      You haven&apos;t set your cookie preferences yet. Please configure your preferences below and save them.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Necessary Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2 font-sans">Necessary Cookies</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Essential for the website to function properly. These cookies enable core functionality 
                    such as security, network management, and accessibility.
                  </p>
                  <p className="text-xs text-gray-500">
                    These cookies cannot be disabled as they are essential for the website to work.
                  </p>
                </div>
                <div className="ml-4">
                  <div className="w-12 h-6 bg-red-700 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2 font-sans">Analytics Cookies</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Help us understand how visitors interact with our website by collecting and 
                    reporting information anonymously. This helps us improve our content and user experience.
                  </p>
                  <p className="text-xs text-gray-500">
                    Includes Google Analytics tracking.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => handlePreferenceChange('analytics', !localPreferences.analytics)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      localPreferences.analytics ? 'bg-red-700' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      localPreferences.analytics ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2 font-sans">Marketing Cookies</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Used to track visitors across websites to display relevant advertisements and 
                    measure the effectiveness of our marketing campaigns.
                  </p>
                  <p className="text-xs text-gray-500">
                    Includes Meta Pixel (Facebook) tracking.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => handlePreferenceChange('marketing', !localPreferences.marketing)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      localPreferences.marketing ? 'bg-red-700' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      localPreferences.marketing ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
              </div>
            </div>

            {saveMessage && (
              <div className={`mt-6 p-4 rounded-lg ${
                saveMessage.includes('error') 
                  ? 'bg-red-50 border border-red-200 text-red-800' 
                  : 'bg-green-50 border border-green-200 text-green-800'
              }`}>
                {saveMessage}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-between mt-8">
              <button
                onClick={handleRevokeAll}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-white hover:bg-red-50 border border-red-300 rounded-lg transition-colors font-sans"
                disabled={isSaving}
              >
                Revoke All Consent
              </button>
              
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 text-sm font-medium text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans"
              >
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2 font-sans">Need Help?</h3>
            <p className="text-sm text-blue-800 mb-4">
              If you have questions about our cookie usage or need assistance with your preferences, 
              please don&apos;t hesitate to contact us.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800 underline"
            >
              Contact Us
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>
      </ForgeLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  try {
    if (!db || typeof db.getPosts !== 'function') {
      return {
        props: { posts: [] },
        revalidate: 60,
      }
    }

    const { data: posts, error } = await db.getPosts({
      status: 'published',
      limit: 3,
      includeAuthor: true
    })

    if (error) {
      console.error('Error fetching posts:', error)
      return {
        props: { posts: [] },
        revalidate: 60,
      }
    }

    return {
      props: {
        posts: posts || [],
      },
      revalidate: 60,
    }
  } catch (error) {
    console.error('Error in getStaticProps:', error)
    return {
      props: { posts: [] },
      revalidate: 60,
    }
  }
}
