import ForgeHeader from 'components/ForgeHeader'
import RecentArticlesSidebar from 'components/RecentArticlesSidebar'
import AuthorSidebar from 'components/AuthorSidebar'
import AlertBanner from 'components/AlertBanner'
import FooterAlert from 'components/FooterAlert'
import type { Post } from 'lib/sanity.queries'

interface ForgeLayoutProps {
  children: React.ReactNode
  preview?: boolean
  loading?: boolean
  recentPosts?: Post[]
  showSidebar?: boolean
  post?: Post
  showTagline?: boolean
}

export default function ForgeLayout({
  children,
  preview = false,
  loading = false,
  recentPosts = [],
  showSidebar = true,
  post,
  showTagline = false,
}: ForgeLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AlertBanner preview={preview} loading={loading} />
      <ForgeHeader />



      <main className="w-[90%] mx-auto py-12 max-w-[1280px]">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content Area - 3/4 width */}
          <div className={`${showSidebar ? 'lg:w-3/4' : 'w-full'}`}>
            {children}
          </div>

          {/* Sidebar - 1/4 width */}
          {showSidebar && (
            <div className="lg:w-1/4 space-y-6">
              {/* Tagline Section - Sidebar */}
              {showTagline && (
                <div className="bg-white p-6 shadow-sm text-center" style={{ backgroundColor: '#2D5A5A' }}>
                  <h2 className="text-xl md:text-2xl font-normal text-white leading-tight font-serif">
                    Shaping leaders and Pastors that shape the Nation.
                  </h2>
                </div>
              )}

              {/* Author Sidebar - only show on single post pages */}
              {post?.author && (
                <AuthorSidebar author={post.author} />
              )}
              <RecentArticlesSidebar posts={recentPosts} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="w-[90%] mx-auto py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              © {new Date().getFullYear()} The Forge Journal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Footer Alert */}
      <FooterAlert />
    </div>
  )
}
