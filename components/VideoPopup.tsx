'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface VideoPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function VideoPopup({ isOpen, onClose }: VideoPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Prevent body scroll when popup is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    setIsVisible(false)
    if (videoRef.current) {
      videoRef.current.pause()
    }
    setTimeout(onClose, 300) // Wait for animation
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      onClick={handleBackdropClick}
    >
      <div
        className={`relative w-full max-w-3xl bg-white shadow-2xl transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors z-10"
          aria-label="Close video"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video Container */}
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            controls
            autoPlay
            playsInline
          >
            <source src="/video/forge-journal-compressed.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Thank You Message and Partner Button */}
        <div className="p-6 bg-white">
          <p className="text-center text-gray-700 mb-4 font-serif text-lg leading-relaxed">
            Thank you for subscribing to the Forge Journal and for supporting the Forge mission: Shaping pastors who will shape the nation.
          </p>
          <Link
            href="/support"
            onClick={handleClose}
            className="block w-full text-center text-white px-8 py-4 text-lg font-bold uppercase tracking-wider transition-all duration-200 font-sans border-2 shadow-lg hover:bg-transparent"
            style={{ backgroundColor: '#B91C1C', borderColor: '#B91C1C' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#B91C1C'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#B91C1C'
              e.currentTarget.style.color = 'white'
            }}
          >
            Partner with FORGE
          </Link>
        </div>
      </div>
    </div>
  )
}

