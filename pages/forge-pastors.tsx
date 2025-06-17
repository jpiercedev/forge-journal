import ForgeLayout from 'components/ForgeLayout'
// Removed Sanity imports - now using static data
import { db } from 'lib/supabase/client'

// Define types for Supabase data
interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string
  cover_image_url?: string
  cover_image_alt?: string
  published_at: string
  author?: {
    name: string
    title?: string
    avatar_url?: string
  }
}

interface Settings {
  title: string
  description: any[]
}
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import type { SharedPageProps } from 'pages/_app'

interface PageProps extends SharedPageProps {
  posts: Post[]
  settings: Settings
}

export default function ForgePastorsPage(props: PageProps) {
  const { posts, settings } = props

  return (
    <>
      <Head>
        <title>Forge Pastors - The Forge Journal</title>
        <meta name="description" content="Resources and community for pastors and church leaders." />
      </Head>

      <ForgeLayout 
        preview={false}
        loading={false}
        recentPosts={posts.slice(0, 3)} 
        showSidebar={true}
      >
        <div className="max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Forge Pastors
            </h1>
            <div className="border-b-4 border-gray-900 w-16 mb-8"></div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              Welcome to Forge Pastors, a community and resource hub designed specifically for 
              pastors and church leaders who are committed to faithful ministry and biblical leadership.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What is Forge Pastors?</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Forge Pastors is more than just a collection of articles—it&apos;s a community of pastors
              dedicated to sharpening one another in ministry. Through exclusive content, discussion 
              forums, and networking opportunities, we provide a space where pastors can grow together 
              in their calling.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Exclusive Resources</h2>
            <ul className="text-gray-700 leading-relaxed mb-6 space-y-2">
              <li>• Monthly pastor-only webinars and discussions</li>
              <li>• Exclusive articles on church leadership and pastoral care</li>
              <li>• Access to a private community forum</li>
              <li>• Resource library with sermon helps and ministry tools</li>
              <li>• Mentorship opportunities with experienced pastors</li>
              <li>• Early access to new content and special publications</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Join the Community</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Membership in Forge Pastors is open to ordained ministers, church planters, and 
              pastoral staff members. We believe in the importance of verified pastoral community 
              and maintain membership standards to ensure a focused environment for ministry discussion.
            </p>

            <div className="bg-blue-50 border border-blue-200 p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Ready to Join?</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Applications for Forge Pastors membership are reviewed monthly. We require verification 
                of pastoral credentials and a brief statement about your ministry context.
              </p>
              <Link 
                href="/apply"
                className="inline-block bg-blue-800 hover:bg-blue-900 text-white px-6 py-3 text-sm font-medium uppercase tracking-wide transition-colors duration-200"
              >
                Apply for Membership
              </Link>
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
    }

    // Default settings
    const settings: Settings = {
      title: 'Forge Journal',
      description: []
    }

    return {
      props: {
        posts: posts || [],
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
