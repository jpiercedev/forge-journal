// Dynamic Banner Component - Displays active banner ads from database

import { useState, useEffect } from 'react'
import type { Ad } from '../types/ads'

interface DynamicBannerProps {
  className?: string
}

export default function DynamicBanner({ className = '' }: DynamicBannerProps) {
  const [bannerAd, setBannerAd] = useState<Ad | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBannerAd()
  }, [])

  const loadBannerAd = async () => {
    try {
      const response = await fetch('/api/content/ads?type=banner&active=true')
      const data = await response.json()

      if (data.success && data.data && data.data.length > 0) {
        // Randomly select a banner ad from all active banners
        const randomIndex = Math.floor(Math.random() * data.data.length)
        const selectedAd = data.data[randomIndex]

        setBannerAd(selectedAd)
      }
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  const handleAdClick = async () => {
    if (!bannerAd?.cta_link) return

    // Track the click
    try {
      await fetch('/api/ads/track-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ad_id: bannerAd.id,
          page_url: window.location.href,
          referrer: document.referrer,
        }),
      })
    } catch (error) {
      console.error('Failed to track ad click:', error)
      // Don't block the user's click if tracking fails
    }

    // Open the link
    window.open(bannerAd.cta_link, '_blank', 'noopener,noreferrer')
  }

  // Don't render anything if loading or no ad
  if (loading || !bannerAd) {
    return null
  }

  return (
    <div className={`w-full h-[70px] md:h-[90px] bg-gray-100 ${className}`}>
      <div className="w-full px-4 sm:w-[95%] md:w-[90%] mx-auto max-w-[1280px] h-full">
        <div className="flex items-center justify-center h-full py-2">
          <div
            key={bannerAd.id}
            className="w-full h-full relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 group"
            style={{
              backgroundImage: bannerAd.image_url ? `url("${bannerAd.image_url}?t=${Date.now()}")` : 'linear-gradient(to right, #1e3a8a, #991b1b, #1e3a8a)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            onClick={handleAdClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleAdClick()
              }
            }}
            aria-label={`${bannerAd.headline} - ${bannerAd.cta_text}`}
          >
            {/* Overlay for better text readability - lighter so background image shows through */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 via-red-800/50 to-blue-900/60"></div>

            {/* Ad Content */}
            <div className="relative z-10 flex items-center justify-between h-full px-3 md:px-6">
              {/* Left Side - Main Message */}
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="text-white font-bold text-sm md:text-lg font-sans tracking-wide truncate">
                  {bannerAd.headline}
                </h3>
                {bannerAd.subheading && (
                  <p className="text-blue-100 text-xs md:text-sm font-sans truncate">
                    {bannerAd.subheading}
                  </p>
                )}

              </div>

              {/* Right Side - CTA */}
              <div className="flex-shrink-0 ml-2 md:ml-4">
                <div className="bg-white text-[#1e4356] px-2 md:px-4 py-1 md:py-2 font-bold text-xs md:text-sm font-sans uppercase tracking-wider hover:bg-[#f0f4f6] transition-colors duration-200 group-hover:scale-105 transform transition-transform whitespace-nowrap">
                  {bannerAd.cta_text}
                </div>
              </div>
            </div>

            {/* Subtle stars pattern overlay */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-2 left-8 text-white text-xs">★</div>
              <div className="absolute top-4 right-12 text-white text-xs">★</div>
              <div className="absolute bottom-3 left-16 text-white text-xs">★</div>
              <div className="absolute bottom-2 right-20 text-white text-xs">★</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
