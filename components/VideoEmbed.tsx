import React from 'react'

interface VideoEmbedProps {
  url: string
  className?: string
  title?: string
}

// Video platform detection and embed URL generation
function getEmbedUrl(url: string): { embedUrl: string; platform: string } | null {
  if (!url) return null

  // YouTube patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const youtubeMatch = url.match(youtubeRegex)
  if (youtubeMatch) {
    return {
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`,
      platform: 'youtube'
    }
  }

  // Vimeo patterns
  const vimeoRegex = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/
  const vimeoMatch = url.match(vimeoRegex)
  if (vimeoMatch) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?byline=0&portrait=0`,
      platform: 'vimeo'
    }
  }

  // Wistia patterns
  const wistiaRegex = /(?:wistia\.com\/medias\/|wi\.st\/)([a-zA-Z0-9]+)/
  const wistiaMatch = url.match(wistiaRegex)
  if (wistiaMatch) {
    return {
      embedUrl: `https://fast.wistia.net/embed/iframe/${wistiaMatch[1]}`,
      platform: 'wistia'
    }
  }

  // Loom patterns
  const loomRegex = /(?:loom\.com\/share\/)([a-zA-Z0-9]+)/
  const loomMatch = url.match(loomRegex)
  if (loomMatch) {
    return {
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
      platform: 'loom'
    }
  }

  // Twitch patterns
  const twitchRegex = /(?:twitch\.tv\/videos\/)(\d+)/
  const twitchMatch = url.match(twitchRegex)
  if (twitchMatch) {
    return {
      embedUrl: `https://player.twitch.tv/?video=${twitchMatch[1]}&parent=${window.location.hostname}`,
      platform: 'twitch'
    }
  }

  return null
}

export default function VideoEmbed({ url, className = '', title = 'Video' }: VideoEmbedProps) {
  if (!url) return null

  const embedData = getEmbedUrl(url)
  
  if (!embedData) {
    return (
      <div className={`bg-gray-100 border border-gray-300 rounded-lg p-6 text-center ${className}`}>
        <div className="text-gray-500 mb-2">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm text-gray-600 font-sans">
          Unable to embed video from this URL
        </p>
        <p className="text-xs text-gray-500 mt-1 font-sans">
          Supported platforms: YouTube, Vimeo, Wistia, Loom, Twitch
        </p>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-800 underline font-sans"
        >
          View Video
        </a>
      </div>
    )
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* Responsive aspect ratio container */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
        <iframe
          src={embedData.embedUrl}
          title={title}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      
      {/* Platform indicator */}
      <div className="mt-2 text-xs text-gray-500 font-sans">
        <span className="capitalize">{embedData.platform}</span> video
      </div>
    </div>
  )
}

// Utility function to validate if a URL can be embedded
export function isValidVideoUrl(url: string): boolean {
  if (!url) return false
  return getEmbedUrl(url) !== null
}

// Utility function to get video platform name
export function getVideoPlatform(url: string): string | null {
  if (!url) return null
  const embedData = getEmbedUrl(url)
  return embedData ? embedData.platform : null
}
