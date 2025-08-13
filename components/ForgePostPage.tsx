import ForgeLayout from 'components/ForgeLayout'
import ForgePostHeader from 'components/ForgePostHeader'
import PostBody from 'components/PostBody'
import PostPageHead from 'components/PostPageHead'
import * as demo from 'lib/demo.data'
import type { Post } from 'lib/supabase/client'
import Error from 'next/error'
import Script from 'next/script'
import { useState } from 'react'
import { useMarketingSource } from 'hooks/useMarketingSource'

// Settings type for compatibility
interface Settings {
  title?: string
  description?: any[]
}

const NO_POSTS: Post[] = []

export interface ForgePostPageProps {
  preview?: boolean
  loading?: boolean
  post: Post
  morePosts: Post[]
  settings: Settings
}

export default function ForgePostPage(props: ForgePostPageProps) {
  const { preview, loading, morePosts = NO_POSTS, post, settings } = props
  const { title = demo.title } = settings || {}

  const slug = post?.slug
  const { source: marketingSource } = useMarketingSource()

  // Contact form state - matching exact Virtuous iframe form fields
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
        body: JSON.stringify({
          ...formData,
          marketingSource
        })
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
      setIsExistingSubscriber(false) // Reset this on error
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!slug && !preview) {
    return <Error statusCode={404} />
  }

  return (
    <>
      <PostPageHead settings={settings} post={post} />

      <ForgeLayout
        preview={preview}
        loading={loading}
        recentPosts={morePosts}
        showSidebar={true}
        post={post}
      >
        {preview && !post ? (
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold text-gray-900">Loading…</h1>
          </div>
        ) : (
          <article className="max-w-none bg-white p-8 shadow-sm">
            <ForgePostHeader
              post={post}
            />

            {/* Article Content */}
            <div className="prose max-w-none prose-p:text-base prose-p:leading-relaxed">
              <PostBody content={post.content} />
            </div>

            {/* Custom Contact Form */}
            <div className="border-t border-gray-300 pt-12 mt-12">
              <div className="max-w-none">
                <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                  Stay Connected
                </h3>
                <p className="text-base text-gray-600 mb-8" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                  Join our community of ministry leaders and receive the latest insights directly to your inbox.
                </p>
                <div className="bg-white border border-gray-200 p-8 rounded-none shadow-sm">

                  {submitStatus === 'success' && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-6 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          {isExistingSubscriber ? (
                            <>
                              <div className="text-lg font-bold text-green-800 mb-3 font-sans">
                                You&apos;re already signed up!
                              </div>
                              <p className="text-sm text-green-700 leading-relaxed font-sans">
                                You&apos;re already part of The Forge Journal family and will continue receiving bold biblical leadership insights and updates from the movement. Thank you for your continued support as we raise up leaders for this critical hour.
                              </p>
                            </>
                          ) : (
                            <>
                              <div className="text-lg font-bold text-green-800 mb-3 font-sans">
                                Thank you for signing up for The Forge Journal!
                              </div>
                              <p className="text-sm text-green-700 leading-relaxed font-sans">
                                You&apos;re now subscribed to receive bold biblical leadership insights, real stories from pastors in the trenches, and updates from the movement that&apos;s rising to take back our nation—one pulpit at a time. Keep an eye on your inbox for the latest issue and be encouraged as God continues to raise up leaders for this critical hour.
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-red-800">
                            {errorMessage || 'There was an error submitting your information. Please try again.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {submitStatus !== 'success' && (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="firstName" className="block text-base font-medium text-gray-900 mb-2" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                          First Name *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-none bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-base"
                          style={{ fontFamily: 'Proxima Nova, sans-serif' }}
                          placeholder=""
                        />
                      </div>

                      <div>
                        <label htmlFor="lastName" className="block text-base font-medium text-gray-900 mb-2 font-sans">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          required
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-none bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-base font-sans"
                          placeholder=""
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-base font-medium text-gray-900 mb-2" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-none bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-base"
                        style={{ fontFamily: 'Proxima Nova, sans-serif' }}
                        placeholder=""
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-base font-medium text-gray-900 mb-2" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-none bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-base"
                        style={{ fontFamily: 'Proxima Nova, sans-serif' }}
                        placeholder=""
                      />
                    </div>

                    <div className="pt-2">
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          name="smsOptIn"
                          checked={formData.smsOptIn}
                          onChange={handleInputChange}
                          className="mr-3 mt-1 h-4 w-4 text-gray-600 border-gray-300 rounded-none focus:ring-gray-400"
                        />
                        <span className="text-base text-gray-700 leading-relaxed" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                          I consent to receive informational SMS and notifications on this number, frequency will vary, reply STOP to opt out.
                        </span>
                      </label>
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 px-6 rounded-none border-2 transition-colors duration-200 font-bold text-base uppercase tracking-wider font-sans ${
                          isSubmitting
                            ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-white border-gray-900 text-gray-900'
                        }`}
                        style={{
                          backgroundColor: isSubmitting ? undefined : 'white',
                          borderColor: isSubmitting ? undefined : '#374151',
                          color: isSubmitting ? undefined : '#374151'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSubmitting) {
                            e.currentTarget.style.backgroundColor = '#1e4356'
                            e.currentTarget.style.borderColor = '#1e4356'
                            e.currentTarget.style.color = 'white'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSubmitting) {
                            e.currentTarget.style.backgroundColor = 'white'
                            e.currentTarget.style.borderColor = '#374151'
                            e.currentTarget.style.color = '#374151'
                          }
                        }}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 text-center mt-4" style={{ fontFamily: 'Proxima Nova, sans-serif' }}>
                      We respect your privacy and will never share your information.
                    </p>
                  </form>
                  )}
                </div>
              </div>
            </div>
          </article>
        )}
      </ForgeLayout>
    </>
  )
}
