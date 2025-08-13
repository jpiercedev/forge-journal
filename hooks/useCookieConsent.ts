import { useState, useEffect } from 'react'

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

const COOKIE_CONSENT_KEY = 'forge-journal-cookie-consent'
const COOKIE_PREFERENCES_KEY = 'forge-journal-cookie-preferences'

export function useCookieConsent() {
  const [hasConsent, setHasConsent] = useState<boolean>(false)
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY)

      if (consent && savedPreferences) {
        const parsed = JSON.parse(savedPreferences)
        setHasConsent(true)
        setPreferences(parsed)
      } else {
        setHasConsent(false)
        setPreferences(null)
      }
    } catch (error) {
      console.error('Error loading cookie preferences:', error)
      setHasConsent(false)
      setPreferences(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const hasConsentFor = (type: keyof CookiePreferences): boolean => {
    if (!hasConsent || !preferences) return false
    return preferences[type] === true
  }

  const updatePreferences = (newPreferences: CookiePreferences) => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'true')
      localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(newPreferences))
      localStorage.setItem('forge-journal-consent-date', new Date().toISOString())
      
      setHasConsent(true)
      setPreferences(newPreferences)
    } catch (error) {
      console.error('Error saving cookie preferences:', error)
    }
  }

  const revokeConsent = () => {
    try {
      localStorage.removeItem(COOKIE_CONSENT_KEY)
      localStorage.removeItem(COOKIE_PREFERENCES_KEY)
      localStorage.removeItem('forge-journal-consent-date')
      
      setHasConsent(false)
      setPreferences(null)
    } catch (error) {
      console.error('Error revoking consent:', error)
    }
  }

  return {
    hasConsent,
    preferences,
    isLoading,
    hasConsentFor,
    updatePreferences,
    revokeConsent,
  }
}

// Standalone utility functions for use outside of React components
export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') return null
  
  try {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    const preferences = localStorage.getItem(COOKIE_PREFERENCES_KEY)
    
    if (consent && preferences) {
      return JSON.parse(preferences)
    }
  } catch (error) {
    console.error('Error getting cookie preferences:', error)
  }
  
  return null
}

export function hasConsentFor(type: keyof CookiePreferences): boolean {
  const preferences = getCookiePreferences()
  return preferences ? preferences[type] === true : false
}
