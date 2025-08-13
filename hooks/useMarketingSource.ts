import { useState, useEffect } from 'react'
import { getMarketingSource, captureMarketingSource, clearMarketingSource } from 'lib/utils/cookieUtils'

export function useMarketingSource() {
  const [source, setSource] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Capture source from URL on mount
    captureMarketingSource()
    
    // Get current source
    const currentSource = getMarketingSource()
    setSource(currentSource)
    setIsLoading(false)
  }, [])

  const clearSource = () => {
    clearMarketingSource()
    setSource(null)
  }

  return {
    source,
    isLoading,
    clearSource,
  }
}
