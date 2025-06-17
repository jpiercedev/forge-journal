import Image from 'next/image'
import ImagePlaceholder from 'components/ImagePlaceholder'
import { urlForImage } from 'lib/sanity.image'
import type { Post } from 'lib/sanity.queries'

interface ForgePostHeaderProps {
  post: Pick<Post, 'title' | 'date' | 'author' | 'coverImage'>
  volumeInfo?: string
}

export default function ForgePostHeader({ post, volumeInfo }: ForgePostHeaderProps) {
  const { title, date, author, coverImage } = post

  // Format date to match the design (e.g., "FEBRUARY 2025 | VOLUME 54, ISSUE 2")
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  }).toUpperCase()

  const displayVolumeInfo = volumeInfo || `${formattedDate} | VOLUME 1, ISSUE 1`

  return (
    <div className="mb-12">
      {/* Header with Background Image */}
      <div className="relative overflow-hidden mb-8">
        {/* Background Image */}
        <div className="aspect-video w-full overflow-hidden bg-gray-200">
          {coverImage?.asset?._ref ? (
            <Image
              src={urlForImage(coverImage)?.width(1200).height(675).url() || ''}
              alt={coverImage.alt || title}
              width={1200}
              height={675}
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
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

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
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white font-serif">
                  {author.name}
                </h2>
                <p className="text-sm sm:text-base font-medium font-serif" style={{ color: '#be9d58' }}>
                  Author Title Goes Here
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
