// Cookie Consent Utilities for Forge Journal

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

const COOKIE_CONSENT_KEY = 'forge-journal-cookie-consent'
const COOKIE_PREFERENCES_KEY = 'forge-journal-cookie-preferences'
const CONSENT_DATE_KEY = 'forge-journal-consent-date'

/**
 * Check if user has given consent for cookies
 */
export function hasGivenConsent(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(COOKIE_CONSENT_KEY) === 'true'
}

/**
 * Get current cookie preferences
 */
export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') return null
  
  try {
    const preferences = localStorage.getItem(COOKIE_PREFERENCES_KEY)
    return preferences ? JSON.parse(preferences) : null
  } catch {
    return null
  }
}

/**
 * Check if user has consented to a specific cookie type
 */
export function hasConsentFor(type: keyof CookiePreferences): boolean {
  const preferences = getCookiePreferences()
  return preferences ? preferences[type] === true : false
}

/**
 * Get the date when consent was given
 */
export function getConsentDate(): Date | null {
  if (typeof window === 'undefined') return null
  
  try {
    const dateStr = localStorage.getItem(CONSENT_DATE_KEY)
    return dateStr ? new Date(dateStr) : null
  } catch {
    return null
  }
}

/**
 * Check if consent is expired (older than 1 year)
 */
export function isConsentExpired(): boolean {
  const consentDate = getConsentDate()
  if (!consentDate) return true
  
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  
  return consentDate < oneYearAgo
}

/**
 * Clear all cookie consent data
 */
export function clearCookieConsent(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(COOKIE_CONSENT_KEY)
  localStorage.removeItem(COOKIE_PREFERENCES_KEY)
  localStorage.removeItem(CONSENT_DATE_KEY)
}

/**
 * Set cookie preferences programmatically
 */
export function setCookiePreferences(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(COOKIE_CONSENT_KEY, 'true')
  localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences))
  localStorage.setItem(CONSENT_DATE_KEY, new Date().toISOString())
  
  // Apply to tracking scripts
  applyTrackingConsent(preferences)
}

/**
 * Apply consent preferences to tracking scripts
 */
export function applyTrackingConsent(preferences: CookiePreferences): void {
  if (typeof window === 'undefined') return
  
  // Google Analytics
  if (window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: preferences.analytics ? 'granted' : 'denied',
      ad_storage: preferences.marketing ? 'granted' : 'denied'
    })
  }
  
  // Meta Pixel
  if (window.fbq) {
    if (preferences.marketing) {
      window.fbq('consent', 'grant')
    } else {
      window.fbq('consent', 'revoke')
    }
  }
}

/**
 * Initialize tracking scripts with current consent
 * Call this after page load to ensure tracking respects saved preferences
 */
export function initializeTrackingWithConsent(): void {
  if (!hasGivenConsent()) return
  
  const preferences = getCookiePreferences()
  if (preferences) {
    applyTrackingConsent(preferences)
  }
}

/**
 * Check if we should show the cookie banner
 * Returns true if no consent given or consent is expired
 */
export function shouldShowCookieBanner(): boolean {
  return !hasGivenConsent() || isConsentExpired()
}

// Marketing Source Tracking Utilities
const MARKETING_SOURCE_KEY = 'forge-journal-marketing-source'
const MARKETING_SOURCE_EXPIRY_DAYS = 30

/**
 * Set marketing source from URL parameter
 * This will store the source for attribution tracking
 */
export function setMarketingSource(source: string): void {
  if (typeof window === 'undefined') return

  try {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + MARKETING_SOURCE_EXPIRY_DAYS)

    const sourceData = {
      source: source,
      timestamp: new Date().toISOString(),
      expires: expiryDate.toISOString()
    }

    localStorage.setItem(MARKETING_SOURCE_KEY, JSON.stringify(sourceData))
    console.log('Marketing source set:', source)
  } catch (error) {
    console.error('Error setting marketing source:', error)
  }
}

/**
 * Get the current marketing source
 * Returns null if no source is set or if expired
 */
export function getMarketingSource(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(MARKETING_SOURCE_KEY)
    if (!stored) return null

    const sourceData = JSON.parse(stored)
    const now = new Date()
    const expires = new Date(sourceData.expires)

    // Check if expired
    if (now > expires) {
      localStorage.removeItem(MARKETING_SOURCE_KEY)
      return null
    }

    return sourceData.source
  } catch (error) {
    console.error('Error getting marketing source:', error)
    return null
  }
}

/**
 * Clear the marketing source
 */
export function clearMarketingSource(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(MARKETING_SOURCE_KEY)
    console.log('Marketing source cleared')
  } catch (error) {
    console.error('Error clearing marketing source:', error)
  }
}

/**
 * Check and set marketing source from URL parameters
 * Call this on page load to capture source attribution
 */
export function captureMarketingSource(): void {
  if (typeof window === 'undefined') return

  try {
    const urlParams = new URLSearchParams(window.location.search)
    const source = urlParams.get('src')

    if (source) {
      setMarketingSource(source)
    }
  } catch (error) {
    console.error('Error capturing marketing source:', error)
  }
}

/**
 * Get a summary of current cookie consent status
 */
export function getConsentSummary(): {
  hasConsent: boolean
  preferences: CookiePreferences | null
  consentDate: Date | null
  isExpired: boolean
} {
  return {
    hasConsent: hasGivenConsent(),
    preferences: getCookiePreferences(),
    consentDate: getConsentDate(),
    isExpired: isConsentExpired()
  }
}
