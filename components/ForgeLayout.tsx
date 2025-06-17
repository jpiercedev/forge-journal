import AlertBanner from 'components/AlertBanner'
import AuthorSidebar from 'components/AuthorSidebar'
import FooterAlert from 'components/FooterAlert'
import ForgeHeader from 'components/ForgeHeader'
import RecentArticlesSidebar from 'components/RecentArticlesSidebar'
// Define types for Supabase data
interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string
  cover_image_url?: string
  cover_image_alt?: string
  published_at: string
  author?: {
    name: string
    title?: string
    avatar_url?: string
  }
}

interface ForgeLayoutProps {
  children: React.ReactNode
  preview?: boolean
  loading?: boolean
  recentPosts?: Post[]
  showSidebar?: boolean
  post?: Post
  showTagline?: boolean
  searchBar?: React.ReactNode
}

export default function ForgeLayout({
  children,
  preview = false,
  loading = false,
  recentPosts = [],
  showSidebar = true,
  post,
  showTagline = false,
  searchBar,
}: ForgeLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AlertBanner preview={preview} loading={loading} />
      <ForgeHeader />



      <main className="w-[90%] mx-auto py-12 max-w-[1280px]">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Area - 3/4 width */}
          <div className={`${showSidebar ? 'lg:w-3/4' : 'w-full'}`}>
            {children}
          </div>

          {/* Sidebar - 1/4 width */}
          {showSidebar && (
            <div className="lg:w-1/4 space-y-6">
              {/* Tagline Section - Sidebar */}
              {showTagline && (
                <div
                  className="bg-white p-6 shadow-sm text-center relative overflow-hidden"
                  style={{
                    backgroundColor: '#1e4356',
                    backgroundImage: 'url(https://kaypark.com/wp-content/uploads/2018/04/AmericanFlag.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  {/* Overlay to maintain color and readability */}
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: '#1e4356', opacity: 0.85 }}
                  ></div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h2 className="text-sm md:text-base font-normal text-white leading-tight font-serif uppercase tracking-widest">
                      Shaping leaders and Pastors that shape the Nation.
                    </h2>
                  </div>
                </div>
              )}

              {/* Search Bar - Sidebar */}
              {searchBar && (
                <div>
                  {searchBar}
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
