import ForgeLayout from 'components/ForgeLayout'
import { readToken } from 'lib/sanity.api'
import { getAllPosts, getClient, getSettings } from 'lib/sanity.client'
import { Post, Settings } from 'lib/sanity.queries'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import type { SharedPageProps } from 'pages/_app'
import { useState } from 'react'

interface PageProps extends SharedPageProps {
  posts: Post[]
  settings: Settings
}

export default function SubscribePage(props: PageProps) {
  const { posts, settings, draftMode } = props
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  return (
    <>
      <Head>
        <title>Subscribe - The Forge Journal</title>
        <meta name="description" content="Subscribe to The Forge Journal and receive our latest articles directly in your inbox." />
      </Head>

      <ForgeLayout 
        preview={draftMode} 
        loading={false}
        recentPosts={posts.slice(0, 3)} 
        showSidebar={true}
      >
        <div className="max-w-4xl">
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

            {!isSubmitted ? (
              <div className="bg-gray-50 p-8 mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Free Subscription</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email address"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-800 hover:bg-blue-900 disabled:bg-gray-400 text-white px-8 py-3 text-sm font-medium uppercase tracking-wide transition-colors duration-200"
                  >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe Now'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 p-8 mb-8">
                <h2 className="text-2xl font-semibold text-green-800 mb-4">Thank You for Subscribing!</h2>
                <p className="text-green-700">
                  You&apos;ll receive a confirmation email shortly. Welcome to The Forge Journal community!
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

export const getStaticProps: GetStaticProps<PageProps> = async (ctx) => {
  const { draftMode = false } = ctx
  const client = getClient(draftMode ? { token: readToken } : undefined)

  const [posts, settings] = await Promise.all([
    getAllPosts(client),
    getSettings(client),
  ])

  return {
    props: {
      posts,
      settings,
      draftMode,
      token: draftMode ? readToken : '',
    },
  }
}
