// Blog Post Engagement Tracking Hook
// Tracks scroll depth, reading time, and content engagement metrics

import { useEffect, useRef, useState, useCallback } from 'react'
import { trackScrollDepth, trackReadingTime, trackBlogPostView } from 'lib/utils/analytics'

interface BlogEngagementOptions {
  postSlug: string
  postTitle: string
  author?: string
  category?: string
  estimatedReadingTime?: number // in minutes
  contentSelector?: string // CSS selector for main content area
  enableScrollTracking?: boolean
  enableReadingTimeTracking?: boolean
  scrollDepthThresholds?: number[] // percentages to track
}

interface BlogEngagementData {
  scrollDepth: number
  timeSpent: number
  isReading: boolean
  hasStartedReading: boolean
  hasCompletedReading: boolean
}

// Default thresholds as a stable reference
const DEFAULT_SCROLL_THRESHOLDS = [25, 50, 75, 90, 100]

export function useBlogEngagement(options: BlogEngagementOptions) {
  const {
    postSlug,
    postTitle,
    author,
    category,
    estimatedReadingTime,
    contentSelector = 'article, .post-content, main',
    enableScrollTracking = true,
    enableReadingTimeTracking = true,
    scrollDepthThresholds = DEFAULT_SCROLL_THRESHOLDS
  } = options

  const [engagementData, setEngagementData] = useState<BlogEngagementData>({
    scrollDepth: 0,
    timeSpent: 0,
    isReading: false,
    hasStartedReading: false,
    hasCompletedReading: false
  })

  // Store thresholds in a ref to avoid recreating callbacks
  const scrollDepthThresholdsRef = useRef(scrollDepthThresholds)
  scrollDepthThresholdsRef.current = scrollDepthThresholds

  const startTimeRef = useRef<number>(Date.now())
  const lastActiveTimeRef = useRef<number>(Date.now())
  const trackedScrollDepthsRef = useRef<Set<number>>(new Set())
  const readingTimeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isVisibleRef = useRef<boolean>(true)
  const hasTrackedViewRef = useRef<boolean>(false)

  // Track initial blog post view
  useEffect(() => {
    if (!hasTrackedViewRef.current) {
      trackBlogPostView(postSlug, postTitle, author, category, estimatedReadingTime)
      hasTrackedViewRef.current = true
    }
  }, [postSlug, postTitle, author, category, estimatedReadingTime])

  // Calculate scroll depth
  const calculateScrollDepth = useCallback((): number => {
    const contentElement = document.querySelector(contentSelector)
    if (!contentElement) return 0

    const contentRect = contentElement.getBoundingClientRect()
    const contentHeight = contentElement.scrollHeight
    const viewportHeight = window.innerHeight
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    // Calculate how much of the content is visible
    const contentTop = contentRect.top + scrollTop
    const contentBottom = contentTop + contentHeight
    const viewportTop = scrollTop
    const viewportBottom = scrollTop + viewportHeight

    // If content hasn't entered viewport yet
    if (viewportBottom < contentTop) return 0
    
    // If content has completely passed viewport
    if (viewportTop > contentBottom) return 100

    // Calculate percentage of content that has been scrolled through
    const scrolledPastTop = Math.max(0, viewportTop - contentTop)
    const scrollDepthPercentage = Math.min(100, (scrolledPastTop / contentHeight) * 100)

    return Math.round(scrollDepthPercentage)
  }, [contentSelector])

  // Handle scroll tracking - use refs to avoid dependency issues
  const handleScroll = useCallback(() => {
    if (!enableScrollTracking) return

    const currentScrollDepth = calculateScrollDepth()

    setEngagementData(prev => ({
      ...prev,
      scrollDepth: currentScrollDepth,
      hasStartedReading: prev.hasStartedReading || currentScrollDepth > 5,
      hasCompletedReading: prev.hasCompletedReading || currentScrollDepth >= 90
    }))

    // Track scroll depth milestones - use ref to avoid recreating callback
    scrollDepthThresholdsRef.current.forEach(threshold => {
      if (currentScrollDepth >= threshold && !trackedScrollDepthsRef.current.has(threshold)) {
        trackedScrollDepthsRef.current.add(threshold)
        trackScrollDepth(threshold, 'blog_post', postSlug)
      }
    })

    // Update last active time when scrolling
    lastActiveTimeRef.current = Date.now()
  }, [enableScrollTracking, calculateScrollDepth, postSlug])

  // Handle visibility change (tab switching, etc.)
  const handleVisibilityChange = useCallback(() => {
    const isVisible = !document.hidden
    isVisibleRef.current = isVisible
    
    if (isVisible) {
      lastActiveTimeRef.current = Date.now()
    }

    setEngagementData(prev => ({
      ...prev,
      isReading: isVisible && prev.hasStartedReading && !prev.hasCompletedReading
    }))
  }, [])

  // Update reading time
  const updateReadingTime = useCallback(() => {
    if (!enableReadingTimeTracking || !isVisibleRef.current) return

    const now = Date.now()
    const timeSinceLastActive = now - lastActiveTimeRef.current
    
    // Only count as reading time if user was active within last 30 seconds
    if (timeSinceLastActive < 30000) {
      const totalTimeSpent = (now - startTimeRef.current) / 1000 // Convert to seconds
      
      setEngagementData(prev => ({
        ...prev,
        timeSpent: totalTimeSpent
      }))
    }
  }, [enableReadingTimeTracking])

  // Set up event listeners and intervals
  useEffect(() => {
    // Scroll tracking
    if (enableScrollTracking) {
      const throttledScrollHandler = throttle(handleScroll, 250)
      window.addEventListener('scroll', throttledScrollHandler, { passive: true })
      
      // Initial scroll calculation
      handleScroll()
      
      return () => {
        window.removeEventListener('scroll', throttledScrollHandler)
      }
    }
  }, [enableScrollTracking, handleScroll])

  useEffect(() => {
    // Visibility tracking
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [handleVisibilityChange])

  useEffect(() => {
    // Reading time tracking
    if (enableReadingTimeTracking) {
      readingTimeIntervalRef.current = setInterval(updateReadingTime, 5000) // Update every 5 seconds
      
      return () => {
        if (readingTimeIntervalRef.current) {
          clearInterval(readingTimeIntervalRef.current)
        }
      }
    }
  }, [enableReadingTimeTracking, updateReadingTime])

  // Track reading completion and time spent on unmount
  useEffect(() => {
    return () => {
      const finalTimeSpent = (Date.now() - startTimeRef.current) / 1000
      const finalScrollDepth = calculateScrollDepth()
      const completed = finalScrollDepth >= 90 || engagementData.hasCompletedReading

      // Track final reading time
      if (finalTimeSpent > 10) { // Only track if spent more than 10 seconds
        trackReadingTime(finalTimeSpent, 'blog_post', postSlug, completed)
      }
    }
  }, []) // Empty dependency array - only run on unmount

  // Use refs to track reading state without causing re-renders
  const hasStartedReadingRef = useRef(false)
  const hasCompletedReadingRef = useRef(false)

  // Keep refs in sync with state
  useEffect(() => {
    hasStartedReadingRef.current = engagementData.hasStartedReading
    hasCompletedReadingRef.current = engagementData.hasCompletedReading
  }, [engagementData.hasStartedReading, engagementData.hasCompletedReading])

  // Periodic reading time tracking (every 30 seconds for active readers)
  useEffect(() => {
    if (!enableReadingTimeTracking) return

    const interval = setInterval(() => {
      const currentTimeSpent = (Date.now() - startTimeRef.current) / 1000

      // Track reading time every 30 seconds for engaged users
      // Use refs instead of state to avoid dependency loop
      if (currentTimeSpent > 30 &&
          hasStartedReadingRef.current &&
          !hasCompletedReadingRef.current &&
          isVisibleRef.current) {
        trackReadingTime(currentTimeSpent, 'blog_post', postSlug, false)
      }
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [enableReadingTimeTracking, postSlug])

  return engagementData
}

// Throttle utility function
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Hook for tracking specific content interactions
export function useContentInteraction() {
  const trackContentClick = useCallback((
    elementType: string,
    elementId?: string,
    elementText?: string,
    context?: string
  ) => {
    // Import here to avoid circular dependencies
    import('lib/utils/analytics').then(({ trackClick }) => {
      trackClick(elementType, elementId, elementText, context)
    })
  }, [])

  const trackContentView = useCallback((
    contentType: string,
    contentId: string,
    contentTitle?: string
  ) => {
    import('lib/utils/analytics').then(({ trackCustomEvent }) => {
      trackCustomEvent('content_view', 'engagement', contentType, 1, {
        content_id: contentId,
        content_title: contentTitle
      })
    })
  }, [])

  return {
    trackContentClick,
    trackContentView
  }
}
