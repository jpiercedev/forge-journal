import ForgeLayout from 'components/ForgeLayout'
import { db, type Post } from 'lib/supabase/client'

interface Settings {
  title: string
  description: any[]
}
import { GetStaticProps } from 'next'
import Head from 'next/head'
import type { SharedPageProps } from 'pages/_app'
import { useState } from 'react'

interface PageProps extends SharedPageProps {
  posts: Post[]
  settings: Settings
}

export default function SubscribePage(props: PageProps) {
  const { posts, settings } = props
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    smsOptIn: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [isExistingSubscriber, setIsExistingSubscriber] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact/submit', {
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
        setIsExistingSubscriber(result.isExisting || false)
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          smsOptIn: false
        })
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error || 'Failed to submit form')
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('Network error. Please try again.')
      setIsExistingSubscriber(false)
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>Subscribe - The Forge Journal</title>
        <meta name="description" content="Subscribe to The Forge Journal and receive our latest articles directly in your inbox." />
      </Head>

      <ForgeLayout 
        preview={false}
        loading={false}
        recentPosts={posts.slice(0, 3)} 
        showSidebar={true}
      >
        <div>
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Subscribe to The Forge Journal
            </h1>
            <div className="border-b-4 border-gray-900 w-16 mb-8"></div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              Stay connected with the latest articles, insights, and resources from The Forge Journal. 
              Our subscribers receive exclusive content and early access to new publications.
            </p>

            {submitStatus !== 'success' ? (
              <div className="bg-gray-50 p-8 mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 font-sans">Free Subscription</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors font-sans"
                        placeholder="First Name"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors font-sans"
                        placeholder="Last Name"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors font-sans"
                      placeholder="Enter your email address"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors font-sans"
                      placeholder="Phone number (optional)"
                    />
                  </div>

                  {formData.phone && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="sms-opt-in"
                        name="smsOptIn"
                        checked={formData.smsOptIn}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 focus:ring-amber-500 focus:ring-2"
                      />
                      <label htmlFor="sms-opt-in" className="text-sm text-gray-600 font-sans">
                        I consent to receive text messages from The Forge Journal
                      </label>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="text-red-600 text-sm font-sans">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="text-white px-8 py-3 text-sm font-medium uppercase tracking-wide transition-colors duration-200 font-sans disabled:opacity-50"
                    style={{ backgroundColor: '#1e4356' }}
                    onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#152e3f')}
                    onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#1e4356')}
                  >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe Now'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 p-8 mb-8">
                <h2 className="text-2xl font-semibold text-green-800 mb-4 font-sans">
                  {isExistingSubscriber ? 'Welcome back!' : 'Thank You for Subscribing!'}
                </h2>
                <p className="text-green-700 font-sans">
                  {isExistingSubscriber
                    ? "You're already part of The Forge Journal family and will continue receiving bold biblical leadership insights and updates from the movement. Thank you for your continued support!"
                    : "You'll receive a confirmation email shortly. Welcome to The Forge Journal community!"
                  }
                </p>
              </div>
            )}

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What You&apos;ll Receive</h2>
            <ul className="text-gray-700 leading-relaxed mb-6 space-y-2">
              <li>• Monthly digest of our latest articles</li>
              <li>• Exclusive subscriber-only content</li>
              <li>• Early access to special publications</li>
              <li>• Invitations to webinars and events</li>
              <li>• Resource recommendations and ministry tools</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Subscription Options</h2>
            
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <div className="border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Digital Subscription</h3>
                <p className="text-2xl font-bold text-blue-800 mb-4">Free</p>
                <ul className="text-gray-700 space-y-2 mb-6">
                  <li>• Email newsletter</li>
                  <li>• Access to online articles</li>
                  <li>• Digital archive access</li>
                </ul>
                <p className="text-sm text-gray-600">
                  Perfect for pastors who want to stay connected with our latest content.
                </p>
              </div>

              <div className="border border-blue-800 p-6 bg-blue-50">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Print + Digital</h3>
                <p className="text-2xl font-bold text-blue-800 mb-4">$24/year</p>
                <ul className="text-gray-700 space-y-2 mb-6">
                  <li>• Everything in Digital</li>
                  <li>• Quarterly print edition</li>
                  <li>• Premium binding and paper</li>
                  <li>• Collector&apos;s edition articles</li>
                </ul>
                <button className="w-full bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 text-sm font-medium uppercase tracking-wide transition-colors duration-200">
                  Coming Soon
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Privacy & Preferences</h3>
              <p className="text-gray-700 leading-relaxed">
                We respect your privacy and will never share your email address with third parties. 
                You can update your subscription preferences or unsubscribe at any time using the 
                links provided in our emails.
              </p>
            </div>
          </div>
        </div>
      </ForgeLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  try {
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
