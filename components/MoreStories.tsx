import PostPreview from 'components/PostPreview'
import type { Post } from 'lib/supabase/client'

export default function MoreStories({ posts }: { posts: Post[] }) {
  return (
    <section className="px-4 md:px-0">
      <h2 className="mb-6 md:mb-8 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tighter">
        More Stories
      </h2>
      <div className="mb-16 md:mb-32 grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-x-8 lg:gap-x-16 md:gap-y-20 lg:gap-y-32">
        {posts.map((post) => (
          <PostPreview
            key={post.id}
            title={post.title}
            coverImage={post.cover_image_url}
            date={post.published_at}
            author={post.author}
            slug={post.slug}
            excerpt={post.excerpt}
          />
        ))}
      </div>
    </section>
  )
}
