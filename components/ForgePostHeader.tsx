import ImagePlaceholder from 'components/ImagePlaceholder'
import Image from 'next/image'
import type { Post } from 'lib/supabase/client'

interface ForgePostHeaderProps {
  post: Pick<Post, 'title' | 'author' | 'cover_image_url' | 'published_at'>
  volumeInfo?: string
}

export default function ForgePostHeader({ post, volumeInfo }: ForgePostHeaderProps) {
  const { title, published_at, author, cover_image_url } = post

  // Format date to match the design (e.g., "FEBRUARY 2025 | VOLUME 54, ISSUE 2")
  const formattedDate = published_at ? new Date(published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  }).toUpperCase() : ''

  const displayVolumeInfo = volumeInfo || `${formattedDate} | VOLUME 1, ISSUE 1`

  return (
    <div className="mb-12">
      {/* Header with Background Image */}
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

          {/* Accent Color Overlay - same as homepage */}
          <div className="absolute inset-0" style={{ backgroundColor: '#1e4356', opacity: 0.5 }}></div>

          {/* Semi-transparent Overlay - same gradient as homepage */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to right, rgba(30, 67, 86, 0.9), rgba(30, 67, 86, 0.8), rgba(30, 67, 86, 0.3))'
          }}></div>
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-end">
          <div className="p-4 sm:p-6 md:p-8 lg:p-12 w-full">
            {/* Volume and Issue Info */}
            <div className="text-xs sm:text-sm text-gray-300 uppercase tracking-wider mb-3 sm:mb-4 font-medium font-serif">
              {displayVolumeInfo}
            </div>

            {/* Article Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight mb-4 sm:mb-6 tracking-tight font-sans">
              {title}
            </h1>

            {/* Author Info */}
            {author && (
              <div className="space-y-1 sm:space-y-2">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white font-sans">
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

      {/* Separator line */}
      <div className="border-b-4 border-teal-600 w-20"></div>
    </div>
  )
}
