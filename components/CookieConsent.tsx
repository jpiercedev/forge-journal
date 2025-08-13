import { useState, useEffect } from 'react'
import Link from 'next/link'

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

const COOKIE_CONSENT_KEY = 'forge-journal-cookie-consent'
const COOKIE_PREFERENCES_KEY = 'forge-journal-cookie-preferences'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      // Load saved preferences
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY)
      if (savedPreferences) {
        try {
          const parsed = JSON.parse(savedPreferences)
          setPreferences(parsed)
          // Apply preferences to tracking scripts
          applyTrackingPreferences(parsed)
        } catch (error) {
          console.error('Error parsing cookie preferences:', error)
        }
      }
    }
  }, [])

  const applyTrackingPreferences = (prefs: CookiePreferences) => {
    // Handle Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      if (prefs.analytics) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted'
        })
      } else {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied'
        })
      }
    }

    // Handle Meta Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      if (prefs.marketing) {
        window.fbq('consent', 'grant')
      } else {
        window.fbq('consent', 'revoke')
      }
    }
  }

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    }
    
    saveConsent(allAccepted)
    applyTrackingPreferences(allAccepted)
    setIsVisible(false)
  }

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
    }
    
    saveConsent(onlyNecessary)
    applyTrackingPreferences(onlyNecessary)
    setIsVisible(false)
  }

  const handleSavePreferences = () => {
    saveConsent(preferences)
    applyTrackingPreferences(preferences)
    setIsVisible(false)
    setShowPreferences(false)
  }

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true')
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs))
    localStorage.setItem('forge-journal-consent-date', new Date().toISOString())

    // Dispatch custom event to notify other components that consent was given
    window.dispatchEvent(new CustomEvent('cookieConsentChanged'))
  }

  const handlePreferenceChange = (type: keyof CookiePreferences, value: boolean) => {
    if (type === 'necessary') return // Can't change necessary cookies
    setPreferences(prev => ({
      ...prev,
      [type]: value
    }))
  }

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      />
      
      {/* Cookie Banner */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-red-700 shadow-2xl z-50 font-sans"
        data-testid="cookie-banner"
      >
        <div className="max-w-7xl mx-auto p-6">
          {!showPreferences ? (
            // Main consent banner
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  We Value Your Privacy
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                  By clicking &quot;Accept All&quot;, you consent to our use of cookies. You can customize your preferences or learn more in our{' '}
                  <Link href="/privacy-policy" className="text-red-700 hover:text-red-800 underline">
                    Privacy Policy
                  </Link>.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 lg:ml-6">
                <button
                  onClick={() => setShowPreferences(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors"
                >
                  Customize
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
                >
                  Reject All
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2 text-sm font-medium text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors"
                >
                  Accept All
                </button>
              </div>
            </div>
          ) : (
            // Preferences panel
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Cookie Preferences
                </h3>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close preferences"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                {/* Necessary Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Necessary Cookies</h4>
                    <p className="text-sm text-gray-600">
                      Essential for the website to function properly. These cannot be disabled.
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
                    <h4 className="font-semibold text-gray-900 mb-1">Analytics Cookies</h4>
                    <p className="text-sm text-gray-600">
                      Help us understand how visitors interact with our website by collecting anonymous information.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handlePreferenceChange('analytics', !preferences.analytics)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        preferences.analytics ? 'bg-red-700' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        preferences.analytics ? 'translate-x-6' : 'translate-x-0.5'
                      }`}></div>
                    </button>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Marketing Cookies</h4>
                    <p className="text-sm text-gray-600">
                      Used to track visitors across websites to display relevant advertisements.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handlePreferenceChange('marketing', !preferences.marketing)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        preferences.marketing ? 'bg-red-700' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        preferences.marketing ? 'translate-x-6' : 'translate-x-0.5'
                      }`}></div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
                >
                  Reject All
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-6 py-2 text-sm font-medium text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Utility function to check if user has consented to a specific cookie type
export function hasConsentFor(type: keyof CookiePreferences): boolean {
  if (typeof window === 'undefined') return false
  
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
  if (!consent) return false
  
  const preferences = localStorage.getItem(COOKIE_PREFERENCES_KEY)
  if (!preferences) return false
  
  try {
    const parsed = JSON.parse(preferences)
    return parsed[type] === true
  } catch {
    return false
  }
}

// Utility function to get all cookie preferences
export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') return null
  
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
  if (!consent) return null
  
  const preferences = localStorage.getItem(COOKIE_PREFERENCES_KEY)
  if (!preferences) return null
  
  try {
    return JSON.parse(preferences)
  } catch {
    return null
  }
}
