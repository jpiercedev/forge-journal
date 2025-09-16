// Tracking Initialization Utilities
// Handles initialization of tracking scripts and enhanced configuration after consent

import { getCookiePreferences, getMarketingSource } from './cookieUtils'

// Initialize enhanced tracking after consent is given
export function initializeEnhancedTracking(): void {
  if (typeof window === 'undefined') return

  const preferences = getCookiePreferences()
  if (!preferences?.analytics) {
    console.log('Analytics consent not granted, skipping enhanced tracking')
    return
  }

  // Configure Google Analytics with enhanced settings
  if (window.gtag) {
    // Set up enhanced ecommerce and custom dimensions
    window.gtag('config', 'G-EYML1CVSBS', {
      // Enhanced tracking settings
      send_page_view: false, // We handle page views manually
      allow_google_signals: preferences.marketing, // Only if marketing consent given
      allow_ad_personalization_signals: preferences.marketing,
      
      // Custom dimensions (configure these in GA4)
      custom_map: {
        'custom_parameter_1': 'marketing_source',
        'custom_parameter_2': 'content_type',
        'custom_parameter_3': 'user_engagement_level'
      },
      
      // Enhanced measurement settings
      enhanced_measurement: {
        scrolls: true,
        outbound_clicks: true,
        site_search: true,
        video_engagement: true,
        file_downloads: true
      }
    })

    // Set marketing source as custom dimension if available
    const marketingSource = getMarketingSource()
    if (marketingSource) {
      window.gtag('config', 'G-EYML1CVSBS', {
        custom_map: {
          'custom_parameter_1': marketingSource
        }
      })
    }

    console.log('Enhanced Google Analytics tracking initialized')
  }

  // Configure Meta Pixel with enhanced settings
  if (window.fbq && preferences.marketing) {
    // Enable advanced matching for better attribution
    window.fbq('init', '4064782077097627', {
      em: 'auto', // Enable automatic advanced matching
      external_id: 'auto'
    })

    // Track enhanced events
    window.fbq('track', 'PageView')
    
    console.log('Enhanced Meta Pixel tracking initialized')
  }
}

// Set up automatic scroll depth tracking
export function initializeScrollTracking(): (() => void) | void {
  if (typeof window === 'undefined') return

  const preferences = getCookiePreferences()
  if (!preferences?.analytics) return

  let scrollDepthTracked = new Set<number>()
  const scrollDepthThresholds = [25, 50, 75, 90, 100]

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercentage = Math.round((scrollTop / documentHeight) * 100)

    scrollDepthThresholds.forEach(threshold => {
      if (scrollPercentage >= threshold && !scrollDepthTracked.has(threshold)) {
        scrollDepthTracked.add(threshold)
        
        if (window.gtag) {
          window.gtag('event', 'scroll_depth', {
            event_category: 'engagement',
            event_label: `${threshold}%`,
            value: threshold,
            custom_parameters: {
              scroll_percentage: threshold,
              page_location: window.location.href
            }
          })
        }
      }
    })
  }

  // Throttled scroll handler
  let scrollTimeout: NodeJS.Timeout | null = null
  const throttledScrollHandler = () => {
    if (scrollTimeout) return
    scrollTimeout = setTimeout(() => {
      handleScroll()
      scrollTimeout = null
    }, 250)
  }

  window.addEventListener('scroll', throttledScrollHandler, { passive: true })
  
  // Cleanup function
  return () => {
    window.removeEventListener('scroll', throttledScrollHandler)
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }
  }
}

// Set up automatic outbound link tracking
export function initializeOutboundLinkTracking(): (() => void) | void {
  if (typeof window === 'undefined') return

  const preferences = getCookiePreferences()
  if (!preferences?.analytics) return

  const handleLinkClick = (event: Event) => {
    const target = event.target as HTMLAnchorElement
    if (!target || target.tagName !== 'A') return

    const href = target.href
    if (!href) return

    // Check if it's an outbound link
    const currentDomain = window.location.hostname
    const linkDomain = new URL(href).hostname

    if (linkDomain !== currentDomain && window.gtag) {
      window.gtag('event', 'click', {
        event_category: 'outbound',
        event_label: href,
        custom_parameters: {
          destination_url: href,
          link_text: target.textContent || target.innerText || '',
          link_domain: linkDomain
        }
      })
    }
  }

  document.addEventListener('click', handleLinkClick, true)
  
  // Cleanup function
  return () => {
    document.removeEventListener('click', handleLinkClick, true)
  }
}

// Set up form interaction tracking
export function initializeFormTracking(): (() => void) | void {
  if (typeof window === 'undefined') return

  const preferences = getCookiePreferences()
  if (!preferences?.analytics) return

  const trackedForms = new Set<HTMLFormElement>()

  const handleFormFocus = (event: Event) => {
    const target = event.target as HTMLElement
    const form = target.closest('form')
    
    if (form && !trackedForms.has(form)) {
      trackedForms.add(form)
      
      const formName = form.getAttribute('name') || 
                      form.getAttribute('id') || 
                      form.className || 
                      'unnamed_form'

      if (window.gtag) {
        window.gtag('event', 'form_start', {
          event_category: 'form',
          event_label: formName,
          custom_parameters: {
            form_name: formName,
            form_location: window.location.pathname
          }
        })
      }
    }
  }

  document.addEventListener('focusin', handleFormFocus, true)
  
  // Cleanup function
  return () => {
    document.removeEventListener('focusin', handleFormFocus, true)
  }
}

// Initialize all enhanced tracking features
export function initializeAllTracking(): (() => void)[] {
  const cleanupFunctions: (() => void)[] = []

  try {
    initializeEnhancedTracking()
    
    const scrollCleanup = initializeScrollTracking()
    if (scrollCleanup) cleanupFunctions.push(scrollCleanup)
    
    const linkCleanup = initializeOutboundLinkTracking()
    if (linkCleanup) cleanupFunctions.push(linkCleanup)
    
    const formCleanup = initializeFormTracking()
    if (formCleanup) cleanupFunctions.push(formCleanup)
    
    console.log('All enhanced tracking features initialized')
  } catch (error) {
    console.error('Error initializing tracking:', error)
  }

  return cleanupFunctions
}

// Utility to check if tracking should be active
export function shouldTrack(type: 'analytics' | 'marketing' = 'analytics'): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const preferences = getCookiePreferences()
    return preferences?.[type] === true
  } catch (error) {
    console.warn('Error checking tracking consent:', error)
    return false
  }
}

// Enhanced page view tracking with marketing attribution
export function trackEnhancedPageView(
  pagePath?: string,
  pageTitle?: string,
  contentGroup?: string
): void {
  if (!shouldTrack('analytics')) return

  try {
    const marketingSource = getMarketingSource()
    
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: pageTitle || document.title,
        page_location: pagePath || window.location.href,
        content_group1: contentGroup || 'website',
        custom_parameters: {
          marketing_source: marketingSource || 'direct',
          timestamp: new Date().toISOString()
        }
      })
    }

    // Also track with Meta Pixel if marketing consent given
    if (window.fbq && shouldTrack('marketing')) {
      window.fbq('track', 'PageView', {
        content_name: pageTitle || document.title,
        content_category: contentGroup || 'website'
      })
    }
  } catch (error) {
    console.error('Error tracking enhanced page view:', error)
  }
}
