import ForgeLayout from 'components/ForgeLayout'
import { db, type Post } from 'lib/supabase/client'
import { GetStaticProps } from 'next'
import Head from 'next/head'

interface PageProps {
  posts: Post[]
}

export default function PrivacyPolicy({ posts }: PageProps) {
  return (
    <>
      <Head>
        <title>Privacy Policy - The Forge Journal</title>
        <meta name="description" content="Privacy Policy for The Forge Journal. Learn how we collect, use, and protect your personal information." />
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
              Privacy Policy
            </h1>
            <div className="border-b-4 border-gray-900 w-16 mb-8"></div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              <strong>Effective Date:</strong> January 1, 2025
            </p>

            <p className="text-gray-700 mb-6">
              At The Forge Journal, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or subscribe to our services.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 font-sans">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3 font-sans">Personal Information</h3>
            <p className="text-gray-700 mb-4">
              We may collect personal information that you voluntarily provide to us, including:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Name and email address when you subscribe to our newsletter</li>
              <li>Phone number if you opt-in to SMS communications</li>
              <li>Contact information when you reach out to us</li>
              <li>Comments and feedback you provide</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3 font-sans">Automatically Collected Information</h3>
            <p className="text-gray-700 mb-4">
              When you visit our website, we may automatically collect certain information, including:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>IP address and browser information</li>
              <li>Device type and operating system</li>
              <li>Pages visited and time spent on our site</li>
              <li>Referring website information</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 font-sans">How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Deliver our newsletter and content to subscribers</li>
              <li>Send SMS updates if you&apos;ve opted in</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Improve our website and user experience</li>
              <li>Analyze website usage and performance</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 font-sans">Information Sharing</h2>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>With service providers who help us operate our website and deliver our services</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a business transfer or merger</li>
              <li>With your explicit consent</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 font-sans">Data Security</h2>
            <p className="text-gray-700 mb-6">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 font-sans">Your Rights</h2>
            <p className="text-gray-700 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Access and update your personal information</li>
              <li>Unsubscribe from our communications at any time</li>
              <li>Request deletion of your personal data</li>
              <li>Opt-out of SMS communications</li>
              <li>Contact us with privacy-related questions</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 font-sans">Cookies</h2>
            <p className="text-gray-700 mb-6">
              Our website uses cookies to enhance your browsing experience and analyze site usage. You can control cookie settings through your browser preferences, though some features may not function properly if cookies are disabled.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 font-sans">Third-Party Services</h2>
            <p className="text-gray-700 mb-6">
              Our website may contain links to third-party websites or use third-party services. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 font-sans">Changes to This Policy</h2>
            <p className="text-gray-700 mb-6">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the effective date.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 font-sans">Contact Us</h2>
            <p className="text-gray-700 mb-6">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>The Forge Journal</strong>
              </p>
              <p className="text-gray-700 mb-2">
                Email: privacy@forgejournal.com
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
