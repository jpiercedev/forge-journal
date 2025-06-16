import Link from 'next/link'
import Image from 'next/image'
import { urlForImage } from 'lib/sanity.image'
import type { Post } from 'lib/sanity.queries'

interface RecentArticlesSidebarProps {
  posts: Post[]
}

export default function RecentArticlesSidebar({ posts }: RecentArticlesSidebarProps) {
  // Take only the first 3 posts for the sidebar
  const recentPosts = posts.slice(0, 3)

  return (
    <aside className="w-full lg:w-80 lg:flex-shrink-0">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Articles</h2>

        <div className="space-y-6">
          {recentPosts.map((post) => (
            <article key={post.slug} className="group">
              <Link href={`/posts/${post.slug}`}>
                <div className="space-y-3">
                  {/* Article Image */}
                  {post.coverImage && (
                    <div className="aspect-video overflow-hidden bg-gray-200 rounded-lg">
                      <Image
                        src={urlForImage(post.coverImage)?.width(320).height(180).url() || ''}
                        alt={post.coverImage.alt || post.title}
                        width={320}
                        height={180}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}

                  {/* Article Title */}
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-500 transition-colors duration-200 leading-tight">
                    {post.title}
                  </h3>

                  {/* Article Date */}
                  <div className="text-sm text-orange-500 uppercase tracking-wider font-medium">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* View All Articles Link */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/"
            className="text-teal-600 hover:text-teal-700 font-semibold text-sm uppercase tracking-wider transition-colors duration-200"
          >
            View All Articles →
          </Link>
        </div>
      </div>
    </aside>
  )
}
