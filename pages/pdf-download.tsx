import { useState, useEffect } from 'react'
import Head from 'next/head'
import ForgeLayout from 'components/ForgeLayout'
import VideoPopup from 'components/VideoPopup'
import { db } from 'lib/supabase/client'
import type { Post } from 'lib/supabase/client'
import { getMarketingSource } from 'lib/utils/cookieUtils'

interface PageProps {
  posts: Post[]
}

// Test email that bypasses API calls
const TEST_EMAIL = 'test@theforgejournal.com'

export default function PDFDownload({ posts }: PageProps) {
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
  const [isUpdate, setIsUpdate] = useState(false)
  const [showVideoPopup, setShowVideoPopup] = useState(false)

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

    // Check if test email - bypass API calls and show video
    const isTestEmail = formData.email.trim().toLowerCase() === TEST_EMAIL

    if (isTestEmail) {
      // Simulate success for test email without API calls
      setSubmitStatus('success')
      setIsUpdate(false)
      setShowVideoPopup(true)

      // Still trigger PDF download for test
      const link = document.createElement('a')
      link.href = '/The Forge Journal – Who Is The Holy Spirt?.pdf'
      link.download = 'The Forge Journal – Who Is The Holy Spirit.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

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
      setIsSubmitting(false)
      return
    }

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
        setShowVideoPopup(true) // Show video popup on success

        // Trigger PDF download
        const link = document.createElement('a')
        link.href = '/The Forge Journal – Who Is The Holy Spirt?.pdf'
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
      </Head>

      <ForgeLayout
        preview={false}
        loading={false}
        recentPosts={posts.slice(0, 3)}
        showSidebar={true}
      >
        <div>
          {/* Hero Section */}
          <div className="mb-12">
            {/* Top Banner */}
            <div className="py-4 px-6 mb-10 border-t-4 border-b-4 shadow-lg" style={{ backgroundColor: '#B91C1C', borderColor: '#991B1B' }}>
              <h2 className="text-xl md:text-2xl font-bold text-center font-sans uppercase tracking-wide text-white">
                A Resource from The Forge Journal
              </h2>
            </div>

            {/* Main Title Section with Design Elements */}
            <div className="relative">
              {/* Decorative top border */}
              <div className="border-t-4 border-gray-900 mb-8"></div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-8 font-sans">
                Who Is The Holy Spirit?
              </h1>

              {/* Decorative accent line */}
              <div className="flex items-center mb-8">
                <div className="border-b-4 border-gray-900 w-24"></div>
                <div className="ml-4 border-b-2 border-gray-400 flex-grow"></div>
              </div>

              {/* Subtitle with background */}
              <div className="bg-gray-50 border-l-4 border-gray-900 p-6 mb-8">
                <p className="text-xl md:text-2xl text-gray-800 leading-relaxed font-sans italic">
                  A comprehensive guide to understanding the Holy Spirit&apos;s role in your life and ministry.
                </p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white border border-gray-200 p-8 md:p-10">
            {submitStatus === 'success' ? (
              <div className="py-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 font-sans">
                  {isUpdate ? 'Information Updated' : 'Thank You'}
                </h2>
                <p className="text-base text-gray-700 leading-relaxed mb-6 font-sans">
                  {isUpdate
                    ? 'Your information has been updated. Your download should begin automatically.'
                    : 'Your download should begin automatically. If it does not, click the button below.'}
                </p>
                <a
                  href="/The Forge Journal – Who Is The Holy Spirt?.pdf"
                  download="The Forge Journal – Who Is The Holy Spirit.pdf"
                  className="inline-block text-white px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-200 font-sans border hover:bg-transparent no-underline"
                  style={{
                    backgroundColor: '#1e4356',
                    borderColor: '#1e4356',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#1e4356';
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1e4356';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  Download PDF
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-900 mb-2 font-sans">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent font-sans"
                      placeholder="John"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-900 mb-2 font-sans">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent font-sans"
                      placeholder="Doe"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Email and Phone Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2 font-sans">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent font-sans"
                      placeholder="john@example.com"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2 font-sans">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent font-sans"
                      placeholder="(555) 123-4567"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Address Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 font-sans">Mailing Address *</h3>

                  <div className="mb-6">
                    <label htmlFor="street" className="block text-sm font-semibold text-gray-900 mb-2 font-sans">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent font-sans"
                      placeholder="123 Main Street"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="city" className="block text-sm font-semibold text-gray-900 mb-2 font-sans">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent font-sans"
                        placeholder="New York"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-semibold text-gray-900 mb-2 font-sans">
                        State *
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent font-sans"
                        placeholder="NY"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="zip" className="block text-sm font-semibold text-gray-900 mb-2 font-sans">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      id="zip"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent font-sans"
                      placeholder="10001"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Error Message */}
                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <p className="text-red-700 font-sans">{errorMessage}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-white px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-200 font-sans border disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: isSubmitting ? '#6b7280' : '#1e4356',
                      borderColor: isSubmitting ? '#6b7280' : '#1e4356',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#1e4356';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.backgroundColor = '#1e4356';
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                  >
                    {isSubmitting ? 'Processing...' : 'Download PDF'}
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-4 font-sans">
                    Your information will be used to send you the PDF and occasional updates from The Forge Journal.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </ForgeLayout>

      {/* Video Popup */}
      <VideoPopup isOpen={showVideoPopup} onClose={() => setShowVideoPopup(false)} />
    </>
  )
}

export async function getStaticProps() {
  try {
    const result = await db.getPosts({
      status: 'published',
      limit: 3,
      includeAuthor: true
    })

    const posts = result.data || []

    return {
      props: {
        posts
      },
      revalidate: 3600
    }
  } catch (error) {
    console.error('Error fetching posts for PDF download page:', error)
    return {
      props: {
        posts: []
      },
      revalidate: 60
    }
  }
}

