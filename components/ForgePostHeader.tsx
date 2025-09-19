import ImagePlaceholder from 'components/ImagePlaceholder'
import VideoEmbed from 'components/VideoEmbed'
import Image from 'next/image'
import type { Post } from 'lib/supabase/client'
import { formatForgeHeaderDate } from 'lib/utils/date-formatting'

interface ForgePostHeaderProps {
  post: Pick<Post, 'title' | 'author' | 'cover_image_url' | 'published_at' | 'video_url' | 'hide_featured_image'>
  volumeInfo?: string
}

export default function ForgePostHeader({ post, volumeInfo }: ForgePostHeaderProps) {
  const { title, published_at, author, cover_image_url, video_url, hide_featured_image } = post

  // Format date to match the design (e.g., "JULY 2024")
  const formattedDate = formatForgeHeaderDate(published_at)

  const displayVolumeInfo = volumeInfo || formattedDate

  // Determine whether to show the featured image
  const shouldShowFeaturedImage = !hide_featured_image || !video_url

  return (
    <div className="mb-12">
      {/* Header with Background Image - only show if not hidden or no video */}
      {shouldShowFeaturedImage && (
        <div className="relative overflow-hidden mb-8">
          {/* Background Image */}
          <div className="aspect-video w-full overflow-hidden bg-gray-200 relative">
            {cover_image_url ? (
              <img
                src={cover_image_url}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImagePlaceholder
                width={1200}
                height={675}
                aspectRatio="video"
                text="Featured Image"
                className="w-full h-full"
              />
            )}

            {/* Accent Color Overlay - reduced opacity to show more of the image */}
            <div className="absolute inset-0" style={{ backgroundColor: '#1e4356', opacity: 0.3 }}></div>

            {/* Semi-transparent Overlay - reduced opacity to show more of the image */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to right, rgba(30, 67, 86, 0.6), rgba(30, 67, 86, 0.5), rgba(30, 67, 86, 0.2))'
            }}></div>
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between">
            <div className="p-4 sm:p-6 md:p-8 lg:p-12 w-full flex flex-col justify-between h-full min-h-0">
              {/* Volume and Issue Info - Top */}
              <div className="text-xs sm:text-sm text-gray-300 uppercase tracking-wider font-medium font-serif flex-shrink-0">
                {displayVolumeInfo}
              </div>

              {/* Article Title - Center */}
              <div className="flex-1 flex items-center min-h-0">
                <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight tracking-tight font-sans">
                  {title}
                </h1>
              </div>

              {/* Author Info - Bottom */}
              {author && (
                <div className="space-y-1 sm:space-y-2 flex-shrink-0">
                  <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white font-sans">
                    {author.name}
                  </h2>
                  <p className="text-sm sm:text-base font-medium font-sans" style={{ color: '#be9d58' }}>
                    {author.title || 'Author'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alternative header for when featured image is hidden */}
      {!shouldShowFeaturedImage && (
        <div className="mb-8">
          {/* Volume and Issue Info */}
          <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider mb-3 sm:mb-4 font-medium font-serif">
            {displayVolumeInfo}
          </div>

          {/* Article Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 leading-tight mb-4 sm:mb-6 tracking-tight font-sans">
            {title}
          </h1>

          {/* Author Info */}
          {author && (
            <div className="space-y-1 sm:space-y-2 mb-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 font-sans">
                {author.name}
              </h2>
              <p className="text-sm sm:text-base font-medium font-sans" style={{ color: '#be9d58' }}>
                {author.title || 'Author'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Video Embed - appears below featured image or header */}
      {video_url && (
        <div className="mb-8">
          <VideoEmbed url={video_url} title={title} />
        </div>
      )}

      {/* Separator line */}
      <div className="border-b-4 border-teal-600 w-20"></div>
    </div>
  )
}
