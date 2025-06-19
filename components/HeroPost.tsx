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
    <section>
      <div className="mb-8 md:mb-16">
        <CoverImage slug={slug} title={title} image={cover_image_url} priority />
      </div>
      <div className="mb-20 md:mb-28 md:grid md:grid-cols-2 md:gap-x-16 lg:gap-x-8">
        <div>
          <h3 className="mb-4 text-4xl leading-tight lg:text-6xl text-balance">
            <Link href={`/posts/${slug}`} className="hover:underline">
              {title || 'Untitled'}
            </Link>
          </h3>
          <div className="mb-4 text-lg md:mb-0">
            <Date dateString={published_at || ''} />
          </div>
        </div>
        <div>
          {excerpt && (
            <p className="mb-4 text-lg leading-relaxed text-pretty">
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
