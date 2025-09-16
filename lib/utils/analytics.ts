// Enhanced Analytics Utilities for Forge Journal
// Comprehensive event tracking with consent management and marketing attribution

import { getCookiePreferences } from './cookieUtils'
import { getMarketingSource } from './cookieUtils'

// Event categories for organized tracking
export const ANALYTICS_EVENTS = {
  // Page and content engagement
  PAGE_VIEW: 'page_view',
  SCROLL_DEPTH: 'scroll_depth',
  READING_TIME: 'reading_time',
  CONTENT_ENGAGEMENT: 'content_engagement',
  
  // User interactions
  CLICK: 'click',
  DOWNLOAD: 'download',
  EXTERNAL_LINK: 'external_link',
  
  // Forms and conversions
  FORM_START: 'form_start',
  FORM_SUBMIT: 'form_submit',
  FORM_ERROR: 'form_error',
  NEWSLETTER_SIGNUP: 'newsletter_signup',
  CONTACT_FORM: 'contact_form',
  
  // Social sharing
  SOCIAL_SHARE: 'social_share',
  SOCIAL_FOLLOW: 'social_follow',
  
  // Blog specific
  BLOG_POST_VIEW: 'blog_post_view',
  BLOG_POST_COMPLETE: 'blog_post_complete',
  RELATED_POST_CLICK: 'related_post_click',
  
  // Ads and monetization
  AD_VIEW: 'ad_view',
  AD_CLICK: 'ad_click',
  
  // Search and navigation
  SEARCH: 'search',
  NAVIGATION: 'navigation',
  
  // Admin actions (for internal tracking)
  ADMIN_ACTION: 'admin_action',
} as const

// Social platforms for sharing tracking
export const SOCIAL_PLATFORMS = {
  TWITTER: 'twitter',
  FACEBOOK: 'facebook',
  LINKEDIN: 'linkedin',
  EMAIL: 'email',
  COPY_LINK: 'copy_link',
} as const

// Enhanced event parameters interface
interface AnalyticsEventParams {
  event_category?: string
  event_label?: string
  value?: number
  custom_parameters?: Record<string, any>
  marketing_source?: string
  page_title?: string
  page_location?: string
  content_group1?: string // For categorizing content
  content_group2?: string // For author or topic
  content_group3?: string // For post type or format
}

// Check if user has consented to analytics tracking
function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const preferences = getCookiePreferences()
    return preferences?.analytics === true
  } catch (error) {
    console.warn('Error checking analytics consent:', error)
    return false
  }
}

// Get marketing attribution data
function getMarketingAttribution(): { source?: string; timestamp?: string } {
  if (typeof window === 'undefined') return {}
  
  try {
    const marketingSource = getMarketingSource()
    return marketingSource ? { source: marketingSource } : {}
  } catch (error) {
    console.warn('Error getting marketing attribution:', error)
    return {}
  }
}

// Enhanced gtag wrapper with consent checking
function trackEvent(
  eventName: string,
  parameters: AnalyticsEventParams = {}
): void {
  if (typeof window === 'undefined' || !window.gtag) {
    console.warn('Google Analytics not available')
    return
  }

  if (!hasAnalyticsConsent()) {
    console.log('Analytics tracking skipped - no consent')
    return
  }

  try {
    // Add marketing attribution if available
    const attribution = getMarketingAttribution()
    const enhancedParams = {
      ...parameters,
      ...attribution,
      // Add page context
      page_title: parameters.page_title || document.title,
      page_location: parameters.page_location || window.location.href,
      // Add timestamp for debugging
      timestamp: new Date().toISOString(),
    }

    // Remove undefined values
    const cleanParams = Object.fromEntries(
      Object.entries(enhancedParams).filter(([_, value]) => value !== undefined)
    )

    window.gtag('event', eventName, cleanParams)
    
    // Log in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', eventName, cleanParams)
    }
  } catch (error) {
    console.error('Error tracking analytics event:', error)
  }
}

// Page view tracking with enhanced parameters
export function trackPageView(
  pagePath?: string,
  pageTitle?: string,
  contentGroup?: string
): void {
  if (!hasAnalyticsConsent()) return

  const params: AnalyticsEventParams = {
    page_title: pageTitle || document.title,
    page_location: pagePath || window.location.href,
    content_group1: contentGroup,
  }

  // Add marketing source if available
  const attribution = getMarketingAttribution()
  if (attribution.source) {
    params.marketing_source = attribution.source
  }

  trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, params)
}

// Blog post specific tracking
export function trackBlogPostView(
  postSlug: string,
  postTitle: string,
  author?: string,
  category?: string,
  readingTime?: number
): void {
  trackEvent(ANALYTICS_EVENTS.BLOG_POST_VIEW, {
    event_category: 'blog',
    event_label: postSlug,
    content_group1: 'blog_post',
    content_group2: author,
    content_group3: category,
    custom_parameters: {
      post_slug: postSlug,
      post_title: postTitle,
      estimated_reading_time: readingTime,
    },
  })
}

// Social sharing tracking
export function trackSocialShare(
  platform: string,
  contentType: string,
  contentId?: string,
  contentTitle?: string
): void {
  trackEvent(ANALYTICS_EVENTS.SOCIAL_SHARE, {
    event_category: 'social',
    event_label: platform,
    custom_parameters: {
      platform,
      content_type: contentType,
      content_id: contentId,
      content_title: contentTitle,
    },
  })
}

// Form interaction tracking
export function trackFormStart(
  formName: string,
  formLocation?: string
): void {
  trackEvent(ANALYTICS_EVENTS.FORM_START, {
    event_category: 'form',
    event_label: formName,
    custom_parameters: {
      form_name: formName,
      form_location: formLocation || window.location.pathname,
    },
  })
}

export function trackFormSubmit(
  formName: string,
  success: boolean,
  errorMessage?: string,
  marketingSource?: string
): void {
  trackEvent(ANALYTICS_EVENTS.FORM_SUBMIT, {
    event_category: 'form',
    event_label: formName,
    value: success ? 1 : 0,
    marketing_source: marketingSource,
    custom_parameters: {
      form_name: formName,
      success,
      error_message: errorMessage,
      marketing_source: marketingSource,
    },
  })
}

// Newsletter signup specific tracking
export function trackNewsletterSignup(
  source: string,
  isExisting: boolean = false,
  marketingSource?: string
): void {
  trackEvent(ANALYTICS_EVENTS.NEWSLETTER_SIGNUP, {
    event_category: 'conversion',
    event_label: source,
    value: isExisting ? 0 : 1, // Only count new signups as conversions
    marketing_source: marketingSource,
    custom_parameters: {
      signup_source: source,
      is_existing_subscriber: isExisting,
      marketing_source: marketingSource,
    },
  })
}

// Click tracking for important elements
export function trackClick(
  elementType: string,
  elementId?: string,
  elementText?: string,
  destination?: string
): void {
  trackEvent(ANALYTICS_EVENTS.CLICK, {
    event_category: 'engagement',
    event_label: elementType,
    custom_parameters: {
      element_type: elementType,
      element_id: elementId,
      element_text: elementText,
      destination,
    },
  })
}

// External link tracking
export function trackExternalLink(
  url: string,
  linkText?: string,
  context?: string
): void {
  trackEvent(ANALYTICS_EVENTS.EXTERNAL_LINK, {
    event_category: 'outbound',
    event_label: url,
    custom_parameters: {
      destination_url: url,
      link_text: linkText,
      context,
    },
  })
}

// Scroll depth tracking
export function trackScrollDepth(
  percentage: number,
  contentType?: string,
  contentId?: string
): void {
  trackEvent(ANALYTICS_EVENTS.SCROLL_DEPTH, {
    event_category: 'engagement',
    event_label: `${percentage}%`,
    value: percentage,
    custom_parameters: {
      scroll_percentage: percentage,
      content_type: contentType,
      content_id: contentId,
    },
  })
}

// Reading time tracking
export function trackReadingTime(
  timeSpent: number,
  contentType: string,
  contentId?: string,
  completed: boolean = false
): void {
  trackEvent(completed ? ANALYTICS_EVENTS.BLOG_POST_COMPLETE : ANALYTICS_EVENTS.READING_TIME, {
    event_category: 'engagement',
    event_label: contentType,
    value: Math.round(timeSpent),
    custom_parameters: {
      time_spent_seconds: Math.round(timeSpent),
      content_type: contentType,
      content_id: contentId,
      reading_completed: completed,
    },
  })
}

// Ad interaction tracking
export function trackAdView(
  adId: string,
  adType: string,
  placement: string
): void {
  trackEvent(ANALYTICS_EVENTS.AD_VIEW, {
    event_category: 'ads',
    event_label: adType,
    custom_parameters: {
      ad_id: adId,
      ad_type: adType,
      placement,
    },
  })
}

export function trackAdClick(
  adId: string,
  adType: string,
  placement: string,
  destination?: string
): void {
  trackEvent(ANALYTICS_EVENTS.AD_CLICK, {
    event_category: 'ads',
    event_label: adType,
    value: 1,
    custom_parameters: {
      ad_id: adId,
      ad_type: adType,
      placement,
      destination,
    },
  })
}

// Search tracking
export function trackSearch(
  searchTerm: string,
  resultsCount?: number,
  source?: string
): void {
  trackEvent(ANALYTICS_EVENTS.SEARCH, {
    event_category: 'search',
    event_label: searchTerm,
    value: resultsCount,
    custom_parameters: {
      search_term: searchTerm,
      results_count: resultsCount,
      search_source: source,
    },
  })
}

// Admin action tracking (for internal analytics)
export function trackAdminAction(
  action: string,
  resource?: string,
  resourceId?: string
): void {
  trackEvent(ANALYTICS_EVENTS.ADMIN_ACTION, {
    event_category: 'admin',
    event_label: action,
    custom_parameters: {
      admin_action: action,
      resource_type: resource,
      resource_id: resourceId,
    },
  })
}

// Utility to track custom events with full flexibility
export function trackCustomEvent(
  eventName: string,
  category: string,
  label?: string,
  value?: number,
  customParams?: Record<string, any>
): void {
  trackEvent(eventName, {
    event_category: category,
    event_label: label,
    value,
    custom_parameters: customParams,
  })
}
