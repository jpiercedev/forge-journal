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
import { trackPageView, trackClick } from 'lib/utils/analytics'

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
        <div className={`${showSidebar ? 'lg:grid lg:grid-cols-4 lg:gap-6' : ''} flex flex-col lg:flex-row gap-4 lg:gap-6`}>
          {/* Main Content Area - 3/4 width - MOVED TO APPEAR FIRST IN DOM */}
          <div className={`${showSidebar ? 'lg:col-span-3 lg:order-1' : 'w-full'} min-w-0 order-1`}>
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
                    <h2 className="text-sm md:text-base font-normal text-white leading-tight font-sans uppercase tracking-widest">
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
                Shaping leaders and pastors who shape the nation. Biblical insights and practical wisdom for ministry leadership.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setIsSubscribeModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 bg-red-700 text-white text-sm font-medium hover:bg-red-800 transition-colors font-sans"
                >
                  Subscribe
                </button>
                <a
                  href="https://gracewoodlands.givevirtuous.org/donate/the-forge-journal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors font-sans"
                >
                  Support
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4 font-sans">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/topics" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                    Topics
                  </Link>
                </li>
                <li>
                  <Link href="/contributors" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                    Contributors
                  </Link>
                </li>
                <li>
                  <Link href="/forge-pastors" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
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
                  <a href="/rss.xml" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                    RSS Feed
                  </a>
                </li>
                <li>
                  <a href="/sitemap.xml" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                    Sitemap
                  </a>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cookie-preferences" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                    Cookie Preferences
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/what-we-believe" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                    Statement of Faith
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm font-sans">
                © {new Date().getFullYear()} The Forge Journal. All rights reserved.
              </p>

              {/* Social Links */}
              <div className="mt-4 md:mt-0 flex space-x-4">
                <a
                  href="https://x.com/ForgeJournalX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Follow us on X"
                  onClick={() => trackClick('social_follow', 'footer_twitter', 'Follow us on X', 'https://x.com/ForgeJournalX')}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href="https://facebook.com/forgejournal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Follow us on Facebook"
                  onClick={() => trackClick('social_follow', 'footer_facebook', 'Follow us on Facebook', 'https://facebook.com/forgejournal')}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://instagram.com/forgejournal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Follow us on Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "The Forge Journal",
              "description": "Shaping leaders and pastors who shape the nation. Biblical insights and practical wisdom for ministry leadership.",
              "url": "https://theforgejournal.com",
              "logo": "https://uvnbfnobyqbonuxztjuz.supabase.co/storage/v1/object/public/assets/logo-horizontal.png",
              "sameAs": [
                "https://x.com/ForgeJournalX",
                "https://facebook.com/forgejournal",
                "https://instagram.com/forgejournal"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": "https://theforgejournal.com/contact"
              }
            })
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
