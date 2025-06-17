import ImagePlaceholder from 'components/ImagePlaceholder'
import { urlForImage } from 'lib/image'
import type { Post } from 'lib/sanity.queries'
import Image from 'next/image'

interface AuthorSidebarProps {
  author: Post['author']
}

export default function AuthorSidebar({ author }: AuthorSidebarProps) {
  if (!author) return null

  return (
    <div className="bg-white p-6 shadow-sm mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4 font-sans">About the Author</h2>
      
      {/* Author Image */}
      <div className="w-full h-48 overflow-hidden bg-gray-200 mb-4">
        {author.picture?.asset?._ref ? (
          <Image
            src={urlForImage(author.picture)?.width(280).height(192).url() || '/placeholder-author.jpg'}
            alt={author.name}
            width={280}
            height={192}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImagePlaceholder
            width={280}
            height={192}
            aspectRatio="landscape"
            text="Author Photo"
            className="w-full h-full"
          />
        )}
      </div>
      
      {/* Author Name */}
      <h3 className="text-lg font-bold text-gray-900 mb-2 font-serif">{author.name}</h3>
      
      {/* Author Bio */}
      <div className="text-sm text-gray-700 leading-relaxed font-sans">
        <p>
          {author.name} holds a PhD in Church History,
          focusing on historical theology and mentoring
          future leaders.
        </p>
      </div>
    </div>
  )
}
