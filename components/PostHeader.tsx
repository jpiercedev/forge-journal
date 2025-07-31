import Avatar from 'components/AuthorAvatar'
import CoverImage from 'components/CoverImage'
import Date from 'components/PostDate'
import PostTitle from 'components/PostTitle'
import type { Post } from 'lib/supabase/client'

export default function PostHeader(
  props: Pick<Post, 'title' | 'cover_image_url' | 'published_at' | 'author' | 'slug'>,
) {
  const { title, cover_image_url, published_at, author, slug } = props
  return (
    <div className="px-4 md:px-0">
      <PostTitle>{title}</PostTitle>
      <div className="hidden md:mb-12 md:block">
        {author && <Avatar name={author.name} picture={author.image_url} />}
      </div>
      <div className="mb-6 md:mb-8 sm:mx-0 lg:mb-16">
        <CoverImage title={title} image={cover_image_url} priority slug={slug} />
      </div>
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 md:mb-6 block md:hidden">
          {author && <Avatar name={author.name} picture={author.image_url} />}
        </div>
        <div className="mb-4 md:mb-6 text-base md:text-lg">
          <Date dateString={published_at || ''} />
        </div>
      </div>
    </div>
  )
}
