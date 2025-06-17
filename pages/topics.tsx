import ForgeLayout from 'components/ForgeLayout'
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

const topics = [
  {
    name: 'Biblical Exposition',
    description: 'In-depth studies of Scripture and theological insights',
    count: 12,
    slug: 'biblical-exposition'
  },
  {
    name: 'Church Leadership',
    description: 'Practical guidance for pastors and church leaders',
    count: 8,
    slug: 'church-leadership'
  },
  {
    name: 'Pastoral Care',
    description: 'Wisdom for shepherding and caring for congregations',
    count: 6,
    slug: 'pastoral-care'
  },
  {
    name: 'Theology',
    description: 'Doctrinal studies and theological reflection',
    count: 10,
    slug: 'theology'
  },
  {
    name: 'Church History',
    description: 'Lessons from the history of the Christian church',
    count: 5,
    slug: 'church-history'
  },
  {
    name: 'Ministry Practice',
    description: 'Practical approaches to ministry and church life',
    count: 7,
    slug: 'ministry-practice'
  }
]

export default function TopicsPage(props: PageProps) {
  const { posts, settings } = props

  return (
    <>
      <Head>
        <title>Topics - The Forge Journal</title>
        <meta name="description" content="Explore articles by topic in The Forge Journal." />
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
              Topics
            </h1>
            <div className="border-b-4 border-gray-900 w-16 mb-8"></div>
          </div>

          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-xl text-gray-700 leading-relaxed">
              Explore our articles organized by topic. Each category contains carefully curated
              content designed to strengthen your ministry and deepen your theological understanding.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {topics.map((topic) => (
              <div key={topic.slug} className="bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  <Link
                    href={`/topics/${topic.slug}`}
                    className="hover:text-blue-800 transition-colors duration-200"
                  >
                    {topic.name}
                  </Link>
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {topic.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {topic.count} articles
                  </span>
                  <Link
                    href={`/topics/${topic.slug}`}
                    className="text-blue-800 hover:text-blue-900 font-medium text-sm uppercase tracking-wide transition-colors duration-200"
                  >
                    View Articles →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gray-50 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Can&apos;t Find What You&apos;re Looking For?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our archive contains articles spanning multiple years of publication. Use our search
              feature or browse all articles to find specific content that meets your needs.
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-800 hover:bg-blue-900 text-white px-6 py-2 text-sm font-medium uppercase tracking-wide transition-colors duration-200"
            >
              Browse All Articles
            </Link>
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
      limit: 50,
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
