import ForgeLayout from 'components/ForgeLayout'
import { db, type Post } from 'lib/supabase/client'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { useState } from 'react'

interface PageProps {
  posts: Post[]
}

export default function Contact({ posts }: PageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      const response = await fetch('/api/contact/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      let result
      try {
        result = await response.json()
      } catch (e) {
        console.error('Failed to parse response:', e)
        setSubmitStatus('error')
        setErrorMessage('Invalid response from server')
        return
      }

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          message: ''
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
        <title>Contact Us - The Forge Journal</title>
        <meta name="description" content="Get in touch with The Forge Journal. Send us your questions, feedback, or partnership inquiries." />
        <meta name="robots" content="index, follow" />
      </Head>

      <ForgeLayout 
        preview={false}
        loading={false}
        recentPosts={posts.slice(0, 3)} 
        showSidebar={true}
      >
        <div className="max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6 font-sans">
              Contact Us
            </h1>
            <div className="border-b-4 border-gray-900 w-16 mb-8"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 font-sans">Send us a message</h2>
              
              {submitStatus === 'success' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Message sent successfully!</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Thank you for contacting us. We&apos;ll get back to you soon.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 font-sans"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 font-sans"
                    />
                  </div>



                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 font-sans"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>

                  {submitStatus === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700 text-sm">{errorMessage}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-white px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-200 font-sans border hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#1e4356', borderColor: '#1e4356' }}
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
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 font-sans">Get in touch</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 font-sans">Response Time</h3>
                  <p className="text-base text-gray-600 font-sans">
                    We typically respond to inquiries within 24-48 hours during business days.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 font-sans">Partnership Inquiries</h3>
                  <p className="text-base text-gray-600 font-sans">
                    Interested in partnering with us? We&apos;d love to hear from you. Please select &quot;Partnership Opportunity&quot; as your subject.
                  </p>
                </div>

                <div className="bg-gray-50 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 font-sans">Stay Connected</h3>
                  <p className="text-base text-gray-600 mb-4 font-sans">
                    Don&apos;t forget to subscribe to our newsletter for weekly insights and updates.
                  </p>
                  <a
                    href="/subscribe"
                    className="inline-block text-white px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-all duration-200 font-sans border hover:bg-transparent"
                    style={{ backgroundColor: '#1e4356', borderColor: '#1e4356' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#1e4356';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#1e4356';
                      e.currentTarget.style.color = 'white';
                    }}
                  >
                    Subscribe Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ForgeLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  try {
    if (!db || typeof db.getPosts !== 'function') {
      return {
        props: {
          posts: [],
        },
        revalidate: 60,
      }
    }

    const { data: posts, error } = await db.getPosts({
      status: 'published',
      limit: 10,
      includeAuthor: true
    })

    if (error) {
      console.error('Error fetching posts:', error)
      return {
        props: {
          posts: [],
        },
        revalidate: 60,
      }
    }

    return {
      props: {
        posts: posts || [],
      },
      revalidate: 3600, // Revalidate every hour
    }
  } catch (error) {
    console.error('Error in getStaticProps:', error)
    return {
      props: {
        posts: [],
      },
      revalidate: 60,
    }
  }
}
