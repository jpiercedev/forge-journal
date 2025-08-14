// Hook to automatically publish scheduled posts
// This runs in the admin interface to simulate a cron job for local development

import { useEffect, useRef } from 'react'

interface UseScheduledPostPublisherOptions {
  enabled?: boolean
  intervalMinutes?: number
}

export function useScheduledPostPublisher({ 
  enabled = true, 
  intervalMinutes = 2 
}: UseScheduledPostPublisherOptions = {}) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled) return

    const publishScheduledPosts = async () => {
      try {
        const response = await fetch('/api/cron/publish-scheduled-posts', {
          method: 'POST',
          headers: {
            'x-cron-secret': 'your-cron-secret-here',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        const data = await response.json()
        
        if (data.success && data.data.published_count > 0) {
          console.log(`✅ Auto-published ${data.data.published_count} scheduled post(s)`)
          
          // Optionally show a notification or trigger a refresh
          // You could dispatch a custom event here to notify other components
          window.dispatchEvent(new CustomEvent('scheduledPostsPublished', {
            detail: { count: data.data.published_count }
          }))
        }
      } catch (error) {
        console.error('Failed to check for scheduled posts:', error)
      }
    }

    // Run immediately on mount
    publishScheduledPosts()

    // Set up interval to run every X minutes
    intervalRef.current = setInterval(publishScheduledPosts, intervalMinutes * 60 * 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, intervalMinutes])

  // Manual trigger function
  const triggerPublish = async () => {
    try {
      const response = await fetch('/api/cron/publish-scheduled-posts', {
        method: 'POST',
        headers: {
          'x-cron-secret': 'your-cron-secret-here',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      const data = await response.json()
      
      if (data.success) {
        console.log(`✅ Manually published ${data.data.published_count} scheduled post(s)`)
        return data.data.published_count
      }
      
      return 0
    } catch (error) {
      console.error('Failed to manually publish scheduled posts:', error)
      return 0
    }
  }

  return { triggerPublish }
}
