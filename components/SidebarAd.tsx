// Sidebar Ad Component - Displays active sidebar ads from database

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { Ad } from '../types/ads'

interface SidebarAdProps {
  className?: string
}

export default function SidebarAd({ className = '' }: SidebarAdProps) {
  const [sidebarAd, setSidebarAd] = useState<Ad | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSidebarAd()
  }, [])

  const loadSidebarAd = async () => {
    try {
      const response = await fetch('/api/content/ads?type=sidebar&active=true')
      const data = await response.json()

      if (data.success && data.data && data.data.length > 0) {
        // Randomly select a sidebar ad from all active sidebar ads
        const randomIndex = Math.floor(Math.random() * data.data.length)
        setSidebarAd(data.data[randomIndex])
      }
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  const handleAdClick = () => {
    if (sidebarAd?.cta_link) {
      window.open(sidebarAd.cta_link, '_blank', 'noopener,noreferrer')
    }
  }

  // Don't render anything if loading or no ad
  if (loading || !sidebarAd) {
    return null
  }

  return (
    <div className={`w-full ${className}`}>
      <div 
        className="bg-white shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-300 group"
        onClick={handleAdClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleAdClick()
          }
        }}
        aria-label={`${sidebarAd.headline} - ${sidebarAd.cta_text}`}
      >
        {/* Ad Image */}
        {sidebarAd.image_url && (
          <div className="aspect-[4/3] overflow-hidden bg-gray-200">
            <Image
              src={sidebarAd.image_url}
              alt={sidebarAd.image_alt || sidebarAd.headline}
              width={400}
              height={300}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Ad Content */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 font-sans mb-2 group-hover:text-forge-teal transition-colors">
            {sidebarAd.headline}
          </h3>
          
          {sidebarAd.subheading && (
            <p className="text-gray-600 text-sm font-sans mb-4 leading-relaxed">
              {sidebarAd.subheading}
            </p>
          )}

          {/* CTA Button */}
          <div className="inline-flex items-center px-4 py-2 bg-forge-teal text-white text-sm font-medium font-sans rounded-lg hover:bg-forge-teal-hover transition-colors duration-200 group-hover:scale-105 transform transition-transform">
            {sidebarAd.cta_text}
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
