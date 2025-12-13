import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { db } from 'lib/supabase/client'
import type { Post, Author } from 'lib/supabase/client'
import { getMarketingSource } from 'lib/utils/cookieUtils'

interface PageProps {
  posts: Post[]
  author: Author | null
  siteUrl: string
}

export default function PDFDownloadAlternate({ posts, author, siteUrl }: PageProps) {

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [showDownloadButton, setShowDownloadButton] = useState(true)
  const [isUpdate, setIsUpdate] = useState(false)

  // Hide download button when form is in view on mobile
  useEffect(() => {
    const handleScroll = () => {
      const formElement = document.getElementById('download-form')
      if (formElement) {
        const rect = formElement.getBoundingClientRect()
        // Hide button when form is visible in viewport
        const isFormVisible = rect.top < window.innerHeight && rect.bottom > 0
        setShowDownloadButton(!isFormVisible)
      }
    }

    // Only add scroll listener on mobile
    if (window.innerWidth < 1024) { // lg breakpoint
      window.addEventListener('scroll', handleScroll)
      handleScroll() // Check initial state

      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const marketingSource = getMarketingSource()

      const response = await fetch('/api/pdf-download/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          marketingSource
        })
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        setIsUpdate(result.isUpdate || false)

        // Trigger PDF download via API endpoint
        const link = document.createElement('a')
        link.href = '/api/pdf-download'
        link.download = 'The Forge Journal – Who Is The Holy Spirit.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          zip: ''
        })
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error || 'Failed to submit form')
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('Network error. Please try again.')
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>Download Free PDF: Who Is The Holy Spirit? - The Forge Journal</title>
        <meta name="description" content="Download your free copy of 'Who Is The Holy Spirit?' - A comprehensive guide to understanding the Holy Spirit's role in your life and ministry." />
        <meta property="og:title" content="Download Free PDF: Who Is The Holy Spirit? - The Forge Journal" />
        <meta property="og:description" content="Download your free copy of 'Who Is The Holy Spirit?' - A comprehensive guide to understanding the Holy Spirit's role in your life and ministry." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${siteUrl}/download-mockup.jpeg`} />
        <meta property="og:image:secure_url" content={`${siteUrl}/download-mockup.jpeg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Download Free PDF: Who Is The Holy Spirit? - The Forge Journal" />
        <meta name="twitter:description" content="Download your free copy of 'Who Is The Holy Spirit?' - A comprehensive guide to understanding the Holy Spirit's role in your life and ministry." />
        <meta name="twitter:image" content={`${siteUrl}/download-mockup.jpeg`} />
      </Head>

      {/* Main Split Layout - Salesforce Style */}
      {/* Mobile Sticky Download Button */}
      {showDownloadButton && (
        <a
          href="#download-form"
          onClick={(e) => {
            e.preventDefault()
            const formElement = document.getElementById('download-form')
            if (formElement) {
              formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          }}
          className="lg:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-8 py-4 text-white text-sm font-bold uppercase tracking-wider shadow-2xl transition-all duration-200"
          style={{ backgroundColor: '#be9d58', fontFamily: 'proxima-nova, sans-serif' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a8894e'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#be9d58'}
        >
          Download Now
        </a>
      )}

      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Content */}
        <div className="flex-1 flex flex-col lg:p-12 xl:p-16 lg:mr-[480px] xl:mr-[520px]" style={{ backgroundColor: '#f9fafb' }}>
          {/* Logo - Full Width Gray Background on Mobile Only */}
          <div className="lg:hidden w-full bg-gray-300 py-6">
            <div className="px-8">
              <Link href="/" className="flex justify-center">
                <img
                  src="https://uvnbfnobyqbonuxztjuz.supabase.co/storage/v1/object/public/assets/logo-horizontal.png"
                  alt="The Forge Journal"
                  className="h-8 w-auto"
                />
              </Link>
            </div>
          </div>

          {/* Logo - Desktop Only */}
          <div className="hidden lg:block mb-8">
            <Link href="/">
              <img
                src="https://uvnbfnobyqbonuxztjuz.supabase.co/storage/v1/object/public/assets/logo-horizontal.png"
                alt="The Forge Journal"
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Main Content - Centered Vertically */}
          <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto lg:mx-0 px-8 lg:px-0 py-8 lg:py-0">

          {/* Main Content - Centered Vertically */}
          <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto lg:mx-0">
            <h1 className="text-2xl sm:text-base md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-black leading-tight mb-6 sm:mb-4 tracking-tight font-sans" style={{ color: '#1e4356' }}>
              THE TRINITY IS THE HIGHEST, GREATEST, MOST PERPLEXING AND PROFOUNDLY COMPLEX CONCEPT IN ALL OF EXISTENCE.
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-base sm:text-sm md:text-base text-gray-400 mb-6 sm:mb-5 md:mb-6 font-sans space-y-1 sm:space-y-0"><span className="font-medium uppercase tracking-wider">Unpack the mystery — get your free copy of &ldquo;Who Is the Holy Spirit?&rdquo; today.</span></div>
            {/* <p className="font-medium uppercase tracking-wider" style={{ color: '#374151', fontFamily: 'proxima-nova, sans-serif' }}>
              Unpack the mystery — get your free copy of "Who Is the Holy Spirit?" today.
            </p> */}

            {/* Divider Line */}
            <div className="w-16 h-1 mb-6 sm:mb-5 md:mb-6" style={{ backgroundColor: '#be9d58' }}></div>

            {/* Author Information */}
            {author && (
              <div className="flex items-center space-x-4 mb-8 sm:mb-6">
                {author.image_url && (
                  <div className="flex-shrink-0">
                    <Image
                      src={author.image_url}
                      alt={author.name}
                      width={60}
                      height={60}
                      className="w-12 h-12 md:w-15 md:h-15 rounded-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#be9d58', fontFamily: 'proxima-nova, sans-serif' }}>
                    Written By
                  </p>
                  <p className="text-sm font-bold mb-1" style={{ color: '#1e4356', fontFamily: 'proxima-nova, sans-serif' }}>
                    {author.name}
                  </p>
                  {author.title && (
                    <p className="text-xs leading-tight" style={{ color: '#374151', fontFamily: 'proxima-nova, sans-serif' }}>
                      {author.title.split(' | ')[0].trim()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Sample Content Section */}
            <div className="my-8 p-6 bg-white shadow-sm border-l-4" style={{ borderColor: '#be9d58' }}>
              <p className="mb-4 text-base leading-relaxed" style={{ color: '#374151', fontFamily: 'proxima-nova, sans-serif' }}>
                When was the last time you took a few moments to look up at the night sky and stare? The other night, I spent about 10 minutes just gazing at the moon. While I was moon gazing, Psalm 19:1 came to my mind. It says, &ldquo;The heavens declare the glory of God; the skies proclaim the work of His hands.&rdquo;
              </p>
              <p className="mb-4 text-base leading-relaxed" style={{ color: '#374151', fontFamily: 'proxima-nova, sans-serif' }}>
                The moon was magnificent and seemed so close, even though it was a quarter of a million miles away. That sounds far, right? Well, it&apos;s nothing compared to the distance between earth and the sun.
              </p>
              <p className="mb-4 text-base leading-relaxed" style={{ color: '#374151', fontFamily: 'proxima-nova, sans-serif' }}>
                The sun, which is at the center of our solar system and 93 million miles away, and is, on the surface, 10,000 degrees Fahrenheit (and we thought Houston was hot). But we love the sun, don&apos;t we? It&apos;s our sun, our very own star. Of course, it&apos;s the only one we&apos;ve got, and I&apos;m glad we&apos;ve got it, because the closest star next to our sun is Proxima Centauri, which is 25 trillion miles from earth. The heavens declare the glory of God.
              </p>
              <div className="text-center pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
                <p className="text-sm font-semibold mb-2" style={{ color: '#1e4356', fontFamily: 'proxima-nova, sans-serif' }}>
                  To continue reading, download the complete guide →
                </p>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="space-y-5">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center h-6 w-6 text-white text-sm font-bold" style={{ backgroundColor: '#be9d58' }}>
                    ✓
                  </div>
                </div>
                <p className="ml-4 text-base" style={{ color: '#374151', fontFamily: 'proxima-nova, sans-serif' }}>
                  <span className="font-semibold" style={{ color: '#1e4356' }}>Biblical Foundation:</span> Understand the Holy Spirit through Scripture
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center h-6 w-6 text-white text-sm font-bold" style={{ backgroundColor: '#be9d58' }}>
                    ✓
                  </div>
                </div>
                <p className="ml-4 text-base" style={{ color: '#374151', fontFamily: 'proxima-nova, sans-serif' }}>
                  <span className="font-semibold" style={{ color: '#1e4356' }}>Practical Application:</span> Learn to walk in the Spirit daily
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center h-6 w-6 text-white text-sm font-bold" style={{ backgroundColor: '#be9d58' }}>
                    ✓
                  </div>
                </div>
                <p className="ml-4 text-base" style={{ color: '#374151', fontFamily: 'proxima-nova, sans-serif' }}>
                  <span className="font-semibold" style={{ color: '#1e4356' }}>Ministry Insights:</span> Empower your leadership and service
                </p>
              </div>
            </div>

            {/* Recent Articles Section */}
            {posts && posts.length > 0 && (
              <div className="mt-12 pt-8 border-t" style={{ borderColor: '#e5e7eb' }}>
                <h2 className="text-lg font-bold mb-6" style={{ color: '#1e4356', fontFamily: 'proxima-nova, sans-serif' }}>
                  Recent Articles
                </h2>
                <div className="space-y-6">
                  {posts.slice(0, 3).map((post) => (
                    <div key={post.slug} className="pb-6 border-b" style={{ borderColor: '#e5e7eb' }}>
                      <Link href={`/posts/${post.slug}`} className="group">
                        <h3 className="text-base font-semibold mb-2 transition-colors" style={{ color: '#1e4356', fontFamily: 'proxima-nova, sans-serif' }}>
                          {post.title}
                        </h3>
                        <p className="text-xs uppercase tracking-wider font-medium" style={{ color: '#be9d58' }}>
                          {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Draft'}
                        </p>
                      </Link>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t" style={{ borderColor: '#e5e7eb' }}>
                  <Link href="/" className="font-semibold text-sm uppercase tracking-wider transition-colors" style={{ color: '#1e4356', fontFamily: 'proxima-nova, sans-serif' }}>
                    View All Articles →
                  </Link>
                </div>
              </div>
            )}
          </div>
          </div>

          {/* Site Footer - Desktop Only (in content area) */}
          <footer className="hidden lg:block bg-gray-50 border-t border-gray-200 mt-16">
            <div className="py-12 px-8">
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
          </footer>
        </div>

        {/* Right Side - Form */}
        <div id="download-form" className="w-full lg:w-[480px] xl:w-[520px] lg:fixed lg:right-0 lg:top-0 lg:h-screen lg:overflow-y-auto flex items-start lg:items-center justify-center p-8 lg:p-10 xl:p-12" style={{ backgroundColor: '#1e4356' }}>
          <div className="w-full max-w-md">

            {/* Visual Element - PDF Preview (Mobile/Tablet - Above Form) */}
            <div className="mb-8 flex justify-center lg:hidden">
              <img
                src="/download-mockup.jpeg"
                alt="Who Is The Holy Spirit? PDF Guide"
                className="w-3/4 md:w-2/3 h-auto shadow-2xl border-4"
                style={{ borderColor: '#be9d58' }}
              />
            </div>

            {/* Form Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white mb-3 leading-tight tracking-tight font-sans">
                Download Your Free PDF
              </h2>
              <p className="text-sm mb-3" style={{ color: '#e5e7eb', fontFamily: 'proxima-nova, sans-serif' }}>
                Complete the form below to receive your guide.
              </p>
            </div>

            {/* Success Message */}
            {submitStatus === 'success' && (
              <div className="bg-white p-8 shadow-lg">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4" style={{ backgroundColor: '#be9d58' }}>
                    <span className="text-white text-3xl font-bold">✓</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3" style={{ color: '#1e4356', fontFamily: 'proxima-nova, sans-serif' }}>
                    Thank You!
                  </h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: '#374151', fontFamily: 'proxima-nova, sans-serif' }}>
                    Your download should begin automatically. If it doesn&apos;t start, please check your downloads folder or contact us for assistance.
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: '#6b7280', fontFamily: 'proxima-nova, sans-serif' }}>
                    We&apos;ll also send you occasional ministry updates and insights from The Forge Journal.
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            {submitStatus !== 'success' && (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3.5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 text-sm"
                  style={{ color: '#1e4356', fontFamily: 'proxima-nova, sans-serif', borderColor: '#be9d58' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#be9d58'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#be9d58'}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3.5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 text-sm"
                  style={{ color: '#1e4356', fontFamily: 'proxima-nova, sans-serif', borderColor: '#be9d58' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#be9d58'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#be9d58'}
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3.5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 text-sm"
                    style={{ color: '#1e4356', fontFamily: 'proxima-nova, sans-serif', borderColor: '#be9d58' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#be9d58'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#be9d58'}
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3.5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 text-sm"
                    style={{ color: '#1e4356', fontFamily: 'proxima-nova, sans-serif', borderColor: '#be9d58' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#be9d58'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#be9d58'}
                  />
                </div>

                <div>
                  <input
                    type="text"
                    name="street"
                    placeholder="Street Address"
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3.5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 text-sm"
                    style={{ color: '#1e4356', fontFamily: 'proxima-nova, sans-serif', borderColor: '#be9d58' }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#be9d58'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#be9d58'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3.5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 text-sm"
                      style={{ color: '#1e4356', fontFamily: 'proxima-nova, sans-serif', borderColor: '#be9d58' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#be9d58'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#be9d58'}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3.5 pr-10 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 text-sm appearance-none"
                      style={{ color: '#1e4356', fontFamily: 'proxima-nova, sans-serif', borderColor: '#be9d58', backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231e4356' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '20px' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#be9d58'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#be9d58'}
                    >
                      <option value="">State</option>
                      <option value="AL">AL</option>
                      <option value="AK">AK</option>
                      <option value="AZ">AZ</option>
                      <option value="AR">AR</option>
                      <option value="CA">CA</option>
                      <option value="CO">CO</option>
                      <option value="CT">CT</option>
                      <option value="DE">DE</option>
                      <option value="FL">FL</option>
                      <option value="GA">GA</option>
                      <option value="HI">HI</option>
                      <option value="ID">ID</option>
                      <option value="IL">IL</option>
                      <option value="IN">IN</option>
                      <option value="IA">IA</option>
                      <option value="KS">KS</option>
                      <option value="KY">KY</option>
                      <option value="LA">LA</option>
                      <option value="ME">ME</option>
                      <option value="MD">MD</option>
                      <option value="MA">MA</option>
                      <option value="MI">MI</option>
                      <option value="MN">MN</option>
                      <option value="MS">MS</option>
                      <option value="MO">MO</option>
                      <option value="MT">MT</option>
                      <option value="NE">NE</option>
                      <option value="NV">NV</option>
                      <option value="NH">NH</option>
                      <option value="NJ">NJ</option>
                      <option value="NM">NM</option>
                      <option value="NY">NY</option>
                      <option value="NC">NC</option>
                      <option value="ND">ND</option>
                      <option value="OH">OH</option>
                      <option value="OK">OK</option>
                      <option value="OR">OR</option>
                      <option value="PA">PA</option>
                      <option value="RI">RI</option>
                      <option value="SC">SC</option>
                      <option value="SD">SD</option>
                      <option value="TN">TN</option>
                      <option value="TX">TX</option>
                      <option value="UT">UT</option>
                      <option value="VT">VT</option>
                      <option value="VA">VA</option>
                      <option value="WA">WA</option>
                      <option value="WV">WV</option>
                      <option value="WI">WI</option>
                      <option value="WY">WY</option>
                    </select>
                    <input
                      type="text"
                      name="zip"
                      placeholder="Zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3.5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 text-sm"
                      style={{ color: '#1e4356', fontFamily: 'proxima-nova, sans-serif', borderColor: '#be9d58' }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#be9d58'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#be9d58'}
                    />
                  </div>
                </div>

                {submitStatus === 'error' && (
                  <div className="bg-white/10 border border-white/20 p-4">
                    <p className="text-white text-sm" style={{ fontFamily: 'proxima-nova, sans-serif' }}>{errorMessage}</p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-white px-8 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    style={{
                      backgroundColor: isSubmitting ? '#6b7280' : '#be9d58',
                      fontFamily: 'proxima-nova, sans-serif'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.backgroundColor = '#a8894e';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.backgroundColor = '#be9d58';
                      }
                    }}
                  >
                    {isSubmitting ? 'Processing...' : 'Get Your Free PDF'}
                  </button>
                  <p className="text-xs text-center mt-4 leading-relaxed" style={{ color: '#e5e7eb', fontFamily: 'proxima-nova, sans-serif' }}>
                    We respect your privacy. Your information will only be used to send you the PDF and occasional ministry updates.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Site Footer - Mobile Only (below form) */}
      <footer className="lg:hidden bg-gray-50 border-t border-gray-200">
        <div className="py-12 px-8">
          <div className="grid grid-cols-1 gap-8 mb-8">
            {/* Brand & Mission */}
            <div>
              <div className="mb-4">
                <img
                  src="https://uvnbfnobyqbonuxztjuz.supabase.co/storage/v1/object/public/assets/logo-horizontal.png"
                  alt="The Forge Journal"
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-gray-600 text-sm mb-4 font-sans">
                Shaping leaders and pastors who shape the nation. Biblical insights and practical wisdom for ministry leadership.
              </p>
              <div className="flex space-x-4">
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
            <div className="flex flex-col items-center">
              <p className="text-gray-500 text-sm font-sans mb-4">
                © {new Date().getFullYear()} The Forge Journal. All rights reserved.
              </p>

              {/* Social Links */}
              <div className="flex space-x-4">
                <a
                  href="https://x.com/ForgeJournalX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Follow us on X"
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
      </footer>
    </>
  )
}

export async function getStaticProps() {
  try {
    // Fetch posts and author in parallel
    const [postsResult, authorsResult] = await Promise.all([
      db.getPosts({
        status: 'published',
        limit: 3,
        includeAuthor: true
      }),
      db.getAuthors()
    ])

    const posts = postsResult.data || []
    const authors = authorsResult.data || []

    // Find Dr. Jason J. Nelson
    const author = authors.find(a =>
      a.name === 'DR. JASON J. NELSON' ||
      a.name === 'DR. JASON J NELSON' ||
      a.name === 'DR. JASON NELSON'
    ) || null

    return {
      props: {
        posts,
        author,
        siteUrl: 'https://theforgejournal.com'
      },
      revalidate: 3600
    }
  } catch (error) {
    console.error('Error fetching data for PDF download alternate page:', error)
    return {
      props: {
        posts: [],
        author: null,
        siteUrl: 'https://theforgejournal.com'
      },
      revalidate: 60
    }
  }
}

