import AlertBanner from 'components/AlertBanner'
import AuthorSidebar from 'components/AuthorSidebar'
import CookieConsent from 'components/CookieConsent'
import FooterAlert from 'components/FooterAlert'
import ForgeHeader from 'components/ForgeHeader'
import DynamicBanner from 'components/DynamicBanner'
import RecentArticlesSidebar from 'components/RecentArticlesSidebar'
import SidebarAd from 'components/SidebarAd'
import SubscribeModal from 'components/SubscribeModal'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import type { Post } from 'lib/supabase/client'
import { captureMarketingSource } from 'lib/utils/cookieUtils'
import { trackPageView } from 'lib/utils/analytics'

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
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false)

  // Capture marketing source from URL parameters on mount and track page view
  useEffect(() => {
    captureMarketingSource()

    // Track page view with content type
    const contentType = post ? 'blog_post' : 'website'
    trackPageView(undefined, undefined, contentType)
  }, [post])
  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">
      <AlertBanner preview={preview} loading={loading} />
      <ForgeHeader />

      <div className="pt-3">
        <DynamicBanner />
      </div>

      <main className="w-full px-4 sm:w-[95%] md:w-[90%] mx-auto pt-3 pb-6 max-w-[1280px]">
        <div
          className={`${showSidebar ? 'lg:grid lg:grid-cols-4 lg:gap-6' : ''} flex flex-col lg:flex-row gap-4 lg:gap-6`}
        >
          {/* Main Content Area - 3/4 width - MOVED TO APPEAR FIRST IN DOM */}
          <div
            className={`${showSidebar ? 'lg:col-span-3 lg:order-1' : 'w-full'} min-w-0 order-1`}
          >
            {children}
          </div>

          {/* Sidebar - 1/4 width - MOVED TO APPEAR SECOND IN DOM */}
          {showSidebar && (
            <div className="lg:col-span-1 space-y-4 lg:space-y-6 min-w-0 order-2 lg:order-2">
              {/* Tagline Section - Sidebar */}
              {showTagline && (
                <div
                  className="bg-white p-6 shadow-sm text-center relative overflow-hidden"
                  style={{
                    backgroundColor: '#1e4356',
                    backgroundImage:
                      'url(https://kaypark.com/wp-content/uploads/2018/04/AmericanFlag.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  {/* Overlay to maintain color and readability */}
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: '#1e4356', opacity: 0.85 }}
                  ></div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h2 className="text-sm md:text-base font-normal text-white leading-tight font-sans uppercase tracking-widest">
                      Shaping leaders and Pastors that shape the Nation.
                    </h2>
                  </div>
                </div>
              )}

              {/* Search Bar - Sidebar */}
              {searchBar && <div>{searchBar}</div>}

              {/* Author Sidebar - only show on single post pages */}
              {post?.author && <AuthorSidebar author={post.author} />}

              {/* Sidebar Ad */}
              <SidebarAd />

              <RecentArticlesSidebar posts={recentPosts} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-8 md:mt-16">
        <div className="w-full px-4 sm:w-[95%] md:w-[90%] mx-auto py-8 md:py-12 max-w-[1280px]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand & Mission */}
            <div className="md:col-span-2">
              <div className="mb-4">
                <img
                  src="https://uvnbfnobyqbonuxztjuz.supabase.co/storage/v1/object/public/assets/logo-horizontal.png"
                  alt="The Forge Journal"
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-gray-600 text-sm mb-4 max-w-md font-sans">
                Shaping leaders and pastors who shape the nation. Biblical
                insights and practical wisdom for ministry leadership.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setIsSubscribeModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 bg-red-700 text-white text-sm font-medium hover:bg-red-800 transition-colors font-sans"
                >
                  Subscribe
                </button>
                <Link
                  href="/support"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors font-sans"
                >
                  Support
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4 font-sans">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/topics"
                    className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                  >
                    Topics
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contributors"
                    className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                  >
                    Contributors
                  </Link>
                </li>
                <li>
                  <Link
                    href="/forge-pastors"
                    className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                  >
                    Forge Pastors
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources & Legal */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4 font-sans">
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/rss.xml"
                    className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                  >
                    RSS Feed
                  </a>
                </li>
                <li>
                  <a
                    href="/sitemap.xml"
                    className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                  >
                    Sitemap
                  </a>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookie-preferences"
                    className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                  >
                    Cookie Preferences
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/what-we-believe"
                    className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                  >
                    Statement of Faith
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-center items-center">
              <p className="text-gray-500 text-sm font-sans">
                © {new Date().getFullYear()} The Forge Journal. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'The Forge Journal',
              description:
                'Shaping leaders and pastors who shape the nation. Biblical insights and practical wisdom for ministry leadership.',
              url: 'https://theforgejournal.com',
              logo: 'https://uvnbfnobyqbonuxztjuz.supabase.co/storage/v1/object/public/assets/logo-horizontal.png',
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                url: 'https://theforgejournal.com/contact',
              },
            }),
          }}
        />
      </footer>

      {/* Footer Alert - Subscribe Banner */}
      <FooterAlert />

      {/* Subscribe Modal */}
      <SubscribeModal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
      />

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  )
}
