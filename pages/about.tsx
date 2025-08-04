import ForgeLayout from 'components/ForgeLayout'
import { db, type Post } from 'lib/supabase/client'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import type { SharedPageProps } from 'pages/_app'

interface Settings {
  title: string
  description: any[]
}

interface PageProps extends SharedPageProps {
  posts: Post[]
  settings: Settings
}

export default function AboutPage(props: PageProps) {
  const { posts, settings } = props
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
        <title>About - The Forge Journal</title>
        <meta name="description" content="Learn about The Forge Journal and our mission to equip church leaders." />
      </Head>

      <ForgeLayout
        preview={false}
        loading={false}
        recentPosts={posts.slice(0, 3)}
        showSidebar={true}
      >
        <div>
          <div className="mb-8">
            <div className="py-4 px-6 mb-8 border-t-4 border-b-4 shadow-lg" style={{ backgroundColor: '#B91C1C', borderColor: '#991B1B' }}>
              <h2 className="text-xl md:text-2xl font-bold text-center font-sans uppercase tracking-wide text-white">
                Shaping Minds that Shape the Nation
              </h2>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6 font-sans">
              About The Forge Journal
            </h1>
            <div className="border-b-4 border-gray-900 w-16 mb-8"></div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-base text-gray-700 leading-relaxed mb-6 font-sans">
              The Forge Journal is an online publication of FORGE, dedicated to equipping pastors and
              church leaders by offering intellectually engaging, biblically centered resources designed
              to empower the Church to impact culture with the values of the Kingdom.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 font-sans">What We Offer</h2>
            <ul className="text-base text-gray-700 leading-relaxed mb-6 space-y-2 font-sans">
              <li>• Biblical exposition and theological insights</li>
              <li>• Practical ministry guidance and leadership principles</li>
              <li>• Historical perspectives on church doctrine and practice</li>
              <li>• Contemporary issues facing the modern church</li>
              <li>• Resources for personal spiritual growth</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 font-sans">Our Commitment</h2>
            <p className="text-base text-gray-700 leading-relaxed mb-6 font-sans">
              Every article in The Forge Journal is carefully crafted to honor Scripture,
              encourage faithful ministry, and provide practical wisdom for the challenges
              facing today&apos;s church leaders. We are committed to excellence in both content
              and presentation, ensuring that each issue serves as a valuable resource for
              your ministry library.
            </p>

            <div className="bg-white border border-gray-200 p-6 mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 font-sans">Get Involved</h3>
              <p className="text-base text-gray-700 leading-relaxed font-sans">
                We welcome contributions from pastors, theologians, and church leaders who
                share our commitment to biblical faithfulness and practical ministry wisdom.
                If you&apos;re interested in contributing to The Forge Journal, please contact us
                to learn more about our submission guidelines.
              </p>
            </div>

            {/* Contact Form Section */}
            <div className="mt-12 bg-gray-50 p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 font-sans">Contact Us</h2>

              {submitStatus === 'success' ? (
                <div className="bg-green-50 border border-green-200 p-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="about-name" className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="about-name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 font-sans"
                      />
                    </div>

                    <div>
                      <label htmlFor="about-email" className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="about-email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 font-sans"
                      />
                    </div>
                  </div>



                  <div>
                    <label htmlFor="about-message" className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                      Message *
                    </label>
                    <textarea
                      id="about-message"
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
                    <div className="bg-red-50 border border-red-200 p-4">
                      <p className="text-red-700 text-sm font-sans">{errorMessage}</p>
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
          </div>
        </div>
      </ForgeLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  try {
    // Check if Supabase is available (might not be during build time)
    if (!db || typeof db.getPosts !== 'function') {
      console.warn('Supabase client not available during build, returning empty data')
      return {
        props: {
          posts: [],
          settings: {
            title: 'Forge Journal',
            description: []
          },
        },
        revalidate: 60,
      }
    }

    // Get published posts from Supabase
    const { data: posts, error: postsError } = await db.getPosts({
      status: 'published',
      limit: 10,
      includeAuthor: true
    })

    if (postsError) {
      console.error('Error fetching posts:', postsError)
      return {
        props: {
          posts: [],
          settings: {
            title: 'Forge Journal',
            description: []
          },
        },
        revalidate: 60,
      }
    }

    // Default settings
    const settings: Settings = {
      title: 'Forge Journal',
      description: []
    }

    // Ensure posts is an array of Post objects
    const validPosts: Post[] = []
    if (Array.isArray(posts)) {
      for (const post of posts) {
        try {
          if (post &&
              typeof post === 'object' &&
              typeof (post as any).id === 'string' &&
              typeof (post as any).title === 'string' &&
              typeof (post as any).slug === 'string') {
            validPosts.push(post as Post)
          }
        } catch (e) {
          // Skip invalid posts
        }
      }
    }

    return {
      props: {
        posts: validPosts,
        settings,
      },
      revalidate: 60, // Revalidate every minute
    }
  } catch (error) {
    console.error('Error in getStaticProps:', error)
    return {
      props: {
        posts: [],
        settings: {
          title: 'Forge Journal',
          description: []
        },
      },
      revalidate: 60,
    }
  }
}
