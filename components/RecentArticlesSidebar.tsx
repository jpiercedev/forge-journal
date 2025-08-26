import ImagePlaceholder from 'components/ImagePlaceholder'
// Removed Sanity image import - now using direct URLs
import type { Post } from 'lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'

interface RecentArticlesSidebarProps {
  posts: Post[]
}

export default function RecentArticlesSidebar({ posts }: RecentArticlesSidebarProps) {
  // Take only the first 3 posts for the sidebar
  const recentPosts = posts.slice(0, 3)

  return (
    <aside className="w-full">
      <div className="bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 mb-6 font-sans uppercase tracking-wider">Recent Posts</h2>

        {recentPosts.length > 0 ? (
          <div className="space-y-6">
            {recentPosts.map((post, index) => (
            <div key={post.slug}>
              <article className="group">
              <Link href={`/posts/${post.slug}`}>
                <div className="space-y-3">
                  {/* Removed images to prevent social media crawlers from using them as thumbnails */}

                  {/* Article Title */}
                  <h3 className="text-lg font-bold text-gray-900 transition-colors duration-200 leading-tight group-hover:text-amber-600 font-sans">
                    {post.title}
                  </h3>

                  {/* Article Date */}
                  <div className="text-sm uppercase tracking-wider font-medium"
                       style={{ color: '#be9d58' }}>
                    {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Draft'}
                  </div>
                </div>
              </Link>
              </article>

              {/* Subtle Divider - only show between articles, not after the last one */}
              {index < recentPosts.length - 1 && (
                <div className="border-t border-gray-200 mt-6"></div>
              )}
            </div>
          ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No recent articles available</p>
          </div>
        )}

        {/* View All Articles Link */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/"
            className="font-semibold text-sm uppercase tracking-wider transition-colors duration-200"
            style={{ color: '#1e4356' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#152e3f'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#1e4356'}
          >
            View All Articles →
          </Link>
        </div>
      </div>
    </aside>
  )
}
