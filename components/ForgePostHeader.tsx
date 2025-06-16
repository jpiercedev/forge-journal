import Image from 'next/image'
import ImagePlaceholder from 'components/ImagePlaceholder'
import { urlForImage } from 'lib/sanity.image'
import type { Post } from 'lib/sanity.queries'

interface ForgePostHeaderProps {
  post: Pick<Post, 'title' | 'date' | 'author'>
  volumeInfo?: string
}

export default function ForgePostHeader({ post, volumeInfo }: ForgePostHeaderProps) {
  const { title, date, author } = post

  // Format date to match the design (e.g., "FEBRUARY 2025 | VOLUME 54, ISSUE 2")
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  }).toUpperCase()

  const displayVolumeInfo = volumeInfo || `${formattedDate} | VOLUME 1, ISSUE 1`

  return (
    <div className="mb-12">
      {/* Volume and Issue Info */}
      <div className="text-sm text-gray-500 uppercase tracking-wider mb-6 font-medium">
        {displayVolumeInfo}
      </div>

      {/* Article Title */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-8 tracking-tight">
        {title}
      </h1>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
        {/* Author Info */}
        <div className="flex-1">
          {author && (
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {author.name}
              </h2>
              {/* Author title/bio could go here */}
              <p className="text-base font-medium" style={{ color: '#D4A574' }}>
                Author Title Goes Here
              </p>
            </div>
          )}
        </div>


      </div>

      {/* Separator line */}
      <div className="mt-12 border-b-4 border-teal-600 w-20"></div>
    </div>
  )
}
