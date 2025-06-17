import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { urlForImage } from 'lib/sanity.image'
import Image from 'next/image'

interface Props {
  asset: SanityImageSource
  alt: string
  caption?: string
  width?: number
  height?: number
}

export const SanityImage = (props: Props) => {
  const { asset, alt, caption, width = 800, height = 600 } = props

  if (!asset) return null

  const imageUrl = urlForImage(asset).width(width).height(height).url()

  return (
    <figure>
      <Image
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 800px) 100vw, 800px"
      />
      {caption && (
        <figcaption className="mt-2 text-center italic text-sm text-gray-500 dark:text-gray-400 text-pretty font-serif">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
