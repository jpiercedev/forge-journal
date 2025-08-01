import ForgeLayout from 'components/ForgeLayout'
import { db, type Post } from 'lib/supabase/client'
import { GetStaticProps } from 'next'
import Head from 'next/head'

interface PageProps {
  posts: Post[]
}

export default function TermsOfService({ posts }: PageProps) {
  return (
    <>
      <Head>
        <title>Terms of Service - The Forge Journal</title>
        <meta name="description" content="Terms of Service for The Forge Journal. Read our terms and conditions for using our website and services." />
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
              Terms of Service
            </h1>
            <div className="border-b-4 border-gray-900 w-16 mb-8"></div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              <strong>Effective Date:</strong> January 1, 2025
            </p>

            <p className="text-gray-700 mb-6">
              Welcome to The Forge Journal. These Terms of Service (&quot;Terms&quot;) govern your use of our website and services. By accessing or using our website, you agree to be bound by these Terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 font-sans">Acceptance of Terms</h2>
            <p className="text-gray-700 mb-6">
              By accessing and using The Forge Journal website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 font-sans">Use License</h2>
            <p className="text-gray-700 mb-4">
              Permission is granted to temporarily download one copy of the materials on The Forge Journal&apos;s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 font-sans">Content and Intellectual Property</h2>
            <p className="text-gray-700 mb-6">
              All content published on The Forge Journal, including articles, images, graphics, and other materials, is protected by copyright and other intellectual property laws. The content is owned by The Forge Journal or our content creators and is provided for educational and informational purposes.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 font-sans">User Conduct</h2>
            <p className="text-gray-700 mb-4">
              When using our website, you agree to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Use the website only for lawful purposes</li>
              <li>Not engage in any activity that disrupts or interferes with the website</li>
              <li>Not attempt to gain unauthorized access to any part of the website</li>
              <li>Respect the intellectual property rights of others</li>
              <li>Not post or transmit any harmful, offensive, or inappropriate content</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 font-sans">Newsletter and Communications</h2>
            <p className="text-gray-700 mb-6">
              By subscribing to our newsletter or providing your contact information, you consent to receive communications from us. You may unsubscribe at any time using the unsubscribe link in our emails or by contacting us directly.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 font-sans">Disclaimer</h2>
            <p className="text-gray-700 mb-6">
              The materials on The Forge Journal&apos;s website are provided on an &apos;as is&apos; basis. The Forge Journal makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 font-sans">Limitations</h2>
            <p className="text-gray-700 mb-6">
              In no event shall The Forge Journal or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on The Forge Journal&apos;s website, even if The Forge Journal or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 font-sans">Privacy Policy</h2>
            <p className="text-gray-700 mb-6">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the website, to understand our practices.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 font-sans">Modifications</h2>
            <p className="text-gray-700 mb-6">
              The Forge Journal may revise these Terms of Service at any time without notice. By using this website, you are agreeing to be bound by the then current version of these Terms of Service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 font-sans">Governing Law</h2>
            <p className="text-gray-700 mb-6">
              These Terms and Conditions are governed by and construed in accordance with the laws of the United States and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 font-sans">Contact Information</h2>
            <p className="text-gray-700 mb-6">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>The Forge Journal</strong>
              </p>
              <p className="text-gray-700 mb-2">
                Email: legal@forgejournal.com
              </p>
              <p className="text-gray-700">
                Website: <a href="/contact" className="text-red-700 hover:text-red-800">Contact Form</a>
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
