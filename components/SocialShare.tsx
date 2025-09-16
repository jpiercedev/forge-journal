// Social Sharing Component with Analytics Tracking
// Provides sharing buttons for Twitter/X, Facebook, LinkedIn, and email with comprehensive tracking

import { useState } from 'react'
import { trackSocialShare, trackClick, SOCIAL_PLATFORMS } from 'lib/utils/analytics'

interface SocialShareProps {
  url: string
  title: string
  description?: string
  hashtags?: string[]
  via?: string // Twitter handle without @
  contentType?: string // 'blog_post', 'homepage', etc.
  contentId?: string // post slug or identifier
  className?: string
  showLabels?: boolean
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'minimal' | 'rounded'
}

export default function SocialShare({
  url,
  title,
  description = '',
  hashtags = [],
  via = 'ForgeJournalX',
  contentType = 'content',
  contentId,
  className = '',
  showLabels = false,
  size = 'medium',
  variant = 'default'
}: SocialShareProps) {
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)

  // Size classes
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  }

  // Variant classes
  const variantClasses = {
    default: 'hover:bg-gray-100 border border-gray-200',
    minimal: 'hover:bg-gray-50',
    rounded: 'rounded-full hover:bg-gray-100 border border-gray-200'
  }

  const iconSize = size === 'small' ? 'w-4 h-4' : size === 'medium' ? 'w-5 h-5' : 'w-6 h-6'

  // Generate sharing URLs
  const getTwitterUrl = () => {
    const params = new URLSearchParams({
      url,
      text: title,
      via,
      ...(hashtags.length > 0 && { hashtags: hashtags.join(',') })
    })
    return `https://twitter.com/intent/tweet?${params.toString()}`
  }

  const getFacebookUrl = () => {
    const params = new URLSearchParams({
      u: url,
      quote: title
    })
    return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`
  }

  const getLinkedInUrl = () => {
    const params = new URLSearchParams({
      url,
      title,
      summary: description
    })
    return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`
  }

  const getEmailUrl = () => {
    const subject = `Check out: ${title}`
    const body = `I thought you might be interested in this article:\n\n${title}\n\n${description}\n\n${url}`
    
    const params = new URLSearchParams({
      subject,
      body
    })
    return `mailto:?${params.toString()}`
  }

  // Handle sharing with analytics tracking
  const handleShare = (platform: string, shareUrl: string) => {
    // Track the share event
    trackSocialShare(platform, contentType, contentId, title)
    
    // Track the click
    trackClick('social_share_button', `share_${platform}`, title, shareUrl)

    // Open sharing window for social platforms
    if (platform !== SOCIAL_PLATFORMS.EMAIL) {
      const windowFeatures = 'width=600,height=400,scrollbars=yes,resizable=yes'
      window.open(shareUrl, '_blank', windowFeatures)
    } else {
      // For email, use the default mailto handler
      window.location.href = shareUrl
    }
  }

  // Handle copy to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedToClipboard(true)
      
      // Track the copy action
      trackSocialShare(SOCIAL_PLATFORMS.COPY_LINK, contentType, contentId, title)
      trackClick('copy_link_button', 'copy_link', title, url)
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedToClipboard(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      // Fallback: select the URL text if copy fails
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedToClipboard(true)
      setTimeout(() => setCopiedToClipboard(false), 2000)
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabels && (
        <span className="text-sm font-medium text-gray-700 mr-2" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
          Share:
        </span>
      )}

      {/* Twitter/X Share */}
      <button
        onClick={() => handleShare(SOCIAL_PLATFORMS.TWITTER, getTwitterUrl())}
        className={`${sizeClasses[size]} ${variantClasses[variant]} flex items-center justify-center transition-colors group`}
        aria-label="Share on X (Twitter)"
        title="Share on X"
      >
        <svg className={`${iconSize} text-gray-600 group-hover:text-black transition-colors`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </button>

      {/* Facebook Share */}
      <button
        onClick={() => handleShare(SOCIAL_PLATFORMS.FACEBOOK, getFacebookUrl())}
        className={`${sizeClasses[size]} ${variantClasses[variant]} flex items-center justify-center transition-colors group`}
        aria-label="Share on Facebook"
        title="Share on Facebook"
      >
        <svg className={`${iconSize} text-gray-600 group-hover:text-blue-600 transition-colors`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </button>

      {/* LinkedIn Share */}
      <button
        onClick={() => handleShare(SOCIAL_PLATFORMS.LINKEDIN, getLinkedInUrl())}
        className={`${sizeClasses[size]} ${variantClasses[variant]} flex items-center justify-center transition-colors group`}
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
      >
        <svg className={`${iconSize} text-gray-600 group-hover:text-blue-700 transition-colors`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </button>

      {/* Email Share */}
      <button
        onClick={() => handleShare(SOCIAL_PLATFORMS.EMAIL, getEmailUrl())}
        className={`${sizeClasses[size]} ${variantClasses[variant]} flex items-center justify-center transition-colors group`}
        aria-label="Share via Email"
        title="Share via Email"
      >
        <svg className={`${iconSize} text-gray-600 group-hover:text-green-600 transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className={`${sizeClasses[size]} ${variantClasses[variant]} flex items-center justify-center transition-colors group relative`}
        aria-label="Copy Link"
        title={copiedToClipboard ? "Copied!" : "Copy Link"}
      >
        {copiedToClipboard ? (
          <svg className={`${iconSize} text-green-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className={`${iconSize} text-gray-600 group-hover:text-gray-800 transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>

      {/* Labels version */}
      {showLabels && (
        <div className="flex items-center gap-3 ml-2">
          <button
            onClick={() => handleShare(SOCIAL_PLATFORMS.TWITTER, getTwitterUrl())}
            className="text-sm text-gray-600 hover:text-black transition-colors font-medium"
            style={{ fontFamily: 'Proxima Nova, sans-serif' }}
          >
            X
          </button>
          <button
            onClick={() => handleShare(SOCIAL_PLATFORMS.FACEBOOK, getFacebookUrl())}
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium"
            style={{ fontFamily: 'Proxima Nova, sans-serif' }}
          >
            Facebook
          </button>
          <button
            onClick={() => handleShare(SOCIAL_PLATFORMS.LINKEDIN, getLinkedInUrl())}
            className="text-sm text-gray-600 hover:text-blue-700 transition-colors font-medium"
            style={{ fontFamily: 'Proxima Nova, sans-serif' }}
          >
            LinkedIn
          </button>
          <button
            onClick={() => handleShare(SOCIAL_PLATFORMS.EMAIL, getEmailUrl())}
            className="text-sm text-gray-600 hover:text-green-600 transition-colors font-medium"
            style={{ fontFamily: 'Proxima Nova, sans-serif' }}
          >
            Email
          </button>
        </div>
      )}
    </div>
  )
}
