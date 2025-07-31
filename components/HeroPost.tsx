import AuthorAvatar from 'components/AuthorAvatar'
import CoverImage from 'components/CoverImage'
import Date from 'components/PostDate'
import type { Post } from 'lib/supabase/client'
import Link from 'next/link'

export default function HeroPost(
  props: Pick<
    Post,
    'title' | 'cover_image_url' | 'published_at' | 'excerpt' | 'author' | 'slug'
  >,
) {
  const { title, cover_image_url, published_at, excerpt, author, slug } = props
  return (
    <section className="px-4 md:px-0">
      <div className="mb-6 md:mb-8 lg:mb-16">
        <CoverImage slug={slug} title={title} image={cover_image_url} priority />
      </div>
      <div className="mb-12 md:mb-20 lg:mb-28 md:grid md:grid-cols-2 md:gap-x-12 lg:gap-x-16 xl:gap-x-8">
        <div>
          <h3 className="mb-4 text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl leading-tight text-balance">
            <Link href={`/posts/${slug}`} className="hover:underline">
              {title || 'Untitled'}
            </Link>
          </h3>
          <div className="mb-4 text-base md:text-lg md:mb-0">
            <Date dateString={published_at || ''} />
          </div>
        </div>
        <div>
          {excerpt && (
            <p className="mb-4 text-base md:text-lg leading-relaxed text-pretty">
              {excerpt}
            </p>
          )}
          {author && (
            <AuthorAvatar name={author.name} picture={author.image_url} />
          )}
        </div>
      </div>
    </section>
  )
}
