import Avatar from 'components/AuthorAvatar'
import CoverImage from 'components/CoverImage'
import Date from 'components/PostDate'
import type { Post } from 'lib/supabase/client'
import Link from 'next/link'

export default function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
}: {
  title: string
  coverImage?: string
  date?: string
  excerpt?: string
  author?: { name: string; picture?: string }
  slug: string
}) {
  return (
    <div className="px-4 md:px-0">
      <div className="mb-4 md:mb-5">
        <CoverImage
          slug={slug}
          title={title}
          image={coverImage}
          priority={false}
        />
      </div>
      <h3 className="mb-3 text-xl md:text-2xl lg:text-3xl leading-snug text-balance font-sans">
        <Link href={`/posts/${slug}`} className="hover:underline">
          {title}
        </Link>
      </h3>
      <div className="mb-3 md:mb-4 text-base md:text-lg">
        <Date dateString={date} />
      </div>
      {excerpt && (
        <p className="mb-3 md:mb-4 text-base md:text-lg leading-relaxed text-pretty font-sans">{excerpt}</p>
      )}
      {author && <Avatar name={author.name} picture={author.picture} />}
    </div>
  )
}
