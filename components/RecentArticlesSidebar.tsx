import Link from 'next/link'
import Image from 'next/image'
import ImagePlaceholder from 'components/ImagePlaceholder'
import { urlForImage } from 'lib/sanity.image'
import type { Post } from 'lib/sanity.queries'

interface RecentArticlesSidebarProps {
  posts: Post[]
}

export default function RecentArticlesSidebar({ posts }: RecentArticlesSidebarProps) {
  // Take only the first 3 posts for the sidebar
  const recentPosts = posts.slice(0, 3)

  return (
    <aside className="w-full">
      <div className="bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6 font-sans">Recent Articles</h2>

        {recentPosts.length > 0 ? (
          <div className="space-y-6">
            {recentPosts.map((post) => (
            <article key={post.slug} className="group">
              <Link href={`/posts/${post.slug}`}>
                <div className="space-y-3">
                  {/* Article Image - 1:1 aspect ratio */}
                  <div className="aspect-square overflow-hidden bg-gray-200">
                    {post.coverImage?.asset?._ref ? (
                      <Image
                        src={urlForImage(post.coverImage)?.width(320).height(320).url() || ''}
                        alt={post.coverImage.alt || post.title}
                        width={320}
                        height={320}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <ImagePlaceholder
                        width={320}
                        height={320}
                        aspectRatio="square"
                        text="Featured Image"
                        className="w-full h-full"
                      />
                    )}
                  </div>

                  {/* Article Title */}
                  <h3 className="text-lg font-bold text-gray-900 transition-colors duration-200 leading-tight group-hover:text-amber-600 font-sans"
                      style={{ color: post === recentPosts[0] ? '#D4A574' : undefined }}>
                    {post.title}
                  </h3>

                  {/* Article Date */}
                  <div className="text-sm uppercase tracking-wider font-medium"
                       style={{ color: '#D4A574' }}>
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
            style={{ color: '#2D5A5A' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1F4444'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#2D5A5A'}
          >
            View All Articles →
          </Link>
        </div>
      </div>
    </aside>
  )
}
