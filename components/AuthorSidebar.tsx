import ImagePlaceholder from 'components/ImagePlaceholder'
import Image from 'next/image'
import { useState } from 'react'
import type { Author } from 'lib/supabase/client'

interface AuthorSidebarProps {
  author: Author
}

export default function AuthorSidebar({ author }: AuthorSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!author) return null

  // Function to truncate bio text
  const truncateBio = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  const shouldShowReadMore = author.bio && author.bio.length > 150

  return (
    <div className="bg-white p-6 shadow-sm mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4 font-sans">About the Author</h2>
      
      {/* Temporarily removed author images to prevent social media crawlers from using them as thumbnails */}
      
      {/* Author Name */}
      <h3 className="text-lg font-bold text-gray-900 mb-2 font-sans">{author.name}</h3>
      
      {/* Author Bio */}
      <div className="text-sm text-gray-700 leading-relaxed font-sans">
        {author.bio ? (
          <div>
            <p className="whitespace-pre-line">
              {isExpanded ? author.bio : truncateBio(author.bio)}
            </p>
            {shouldShowReadMore && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200 focus:outline-none focus:underline"
              >
                {isExpanded ? 'Read Less' : 'Read More'}
              </button>
            )}
          </div>
        ) : (
          <p>
            {author.name} is a contributor to The Forge Journal,
            helping to shape leaders and pastors that shape the nation.
          </p>
        )}
      </div>
    </div>
  )
}
