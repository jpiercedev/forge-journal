import ForgeHeader from 'components/ForgeHeader'
import RecentArticlesSidebar from 'components/RecentArticlesSidebar'
import AlertBanner from 'components/AlertBanner'
import type { Post } from 'lib/sanity.queries'

interface ForgeLayoutProps {
  children: React.ReactNode
  preview?: boolean
  loading?: boolean
  recentPosts?: Post[]
  showSidebar?: boolean
}

export default function ForgeLayout({
  children,
  preview = false,
  loading = false,
  recentPosts = [],
  showSidebar = true,
}: ForgeLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AlertBanner preview={preview} loading={loading} />
      <ForgeHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content Area */}
          <div className={`flex-1 ${showSidebar ? 'lg:pr-8' : ''} bg-white rounded-lg p-8 shadow-sm`}>
            {children}
          </div>

          {/* Sidebar */}
          {showSidebar && recentPosts.length > 0 && (
            <RecentArticlesSidebar posts={recentPosts} />
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              © {new Date().getFullYear()} The Forge Journal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
