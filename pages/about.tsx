import ForgeLayout from 'components/ForgeLayout'
import { db, type Post } from 'lib/supabase/client'
import { GetStaticProps } from 'next'
import Head from 'next/head'
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
                Shaping Minds who Shape the Nation
              </h2>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6 font-sans">
              About The Forge Journal
            </h1>
            <div className="border-b-4 border-gray-900 w-16 mb-8"></div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              The Forge Journal is an online publication of FORGE, dedicated to equipping pastors and
              church leaders by offering intellectually engaging, biblically centered resources designed
              to empower the Church to impact culture with the values of the Kingdom.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 font-sans">What We Offer</h2>
            <ul className="text-gray-700 leading-relaxed mb-6 space-y-2">
              <li>• Biblical exposition and theological insights</li>
              <li>• Practical ministry guidance and leadership principles</li>
              <li>• Historical perspectives on church doctrine and practice</li>
              <li>• Contemporary issues facing the modern church</li>
              <li>• Resources for personal spiritual growth</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 font-sans">Our Commitment</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Every article in The Forge Journal is carefully crafted to honor Scripture,
              encourage faithful ministry, and provide practical wisdom for the challenges
              facing today&apos;s church leaders. We are committed to excellence in both content
              and presentation, ensuring that each issue serves as a valuable resource for
              your ministry library.
            </p>

            <div className="bg-white border border-gray-200 p-6 mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 font-sans">Get Involved</h3>
              <p className="text-gray-700 leading-relaxed">
                We welcome contributions from pastors, theologians, and church leaders who
                share our commitment to biblical faithfulness and practical ministry wisdom.
                If you&apos;re interested in contributing to The Forge Journal, please contact us
                to learn more about our submission guidelines.
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
