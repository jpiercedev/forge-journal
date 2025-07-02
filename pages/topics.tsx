import ForgeLayout from 'components/ForgeLayout'
import { db, type Post, type Category } from 'lib/supabase/client'

interface Settings {
  title: string
  description: any[]
}
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import type { SharedPageProps } from 'pages/_app'

interface TopicWithCount extends Category {
  post_count: number
}

interface PageProps extends SharedPageProps {
  posts: Post[]
  topics: TopicWithCount[]
  settings: Settings
}

export default function TopicsPage(props: PageProps) {
  const { posts, topics, settings } = props

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
                    {topic.title}
                  </Link>
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {topic.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {topic.post_count} {topic.post_count === 1 ? 'article' : 'articles'}
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
      return {
        props: {
          posts: [],
          topics: [],
          settings: {
            title: 'Forge Journal',
            description: []
          },
        },
        revalidate: 60,
      }
    }

    // Get categories from Supabase
    const { data: categories, error: categoriesError } = await db.getCategories()

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
      return {
        props: {
          posts: [],
          topics: [],
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

    // Create topics with post counts
    const topicsWithCounts: TopicWithCount[] = []
    if (Array.isArray(categories)) {
      for (const category of categories) {
        try {
          if (category &&
              typeof category === 'object' &&
              typeof (category as any).id === 'string' &&
              typeof (category as any).title === 'string' &&
              typeof (category as any).slug === 'string') {

            // For now, we'll set count to 0 since posts don't have categories assigned yet
            // This will be updated when posts are properly categorized
            const postCount = 0

            topicsWithCounts.push({
              ...(category as any),
              post_count: postCount
            })
          }
        } catch (e) {
          // Skip invalid categories
        }
      }
    }

    return {
      props: {
        posts: validPosts,
        topics: topicsWithCounts,
        settings,
      },
      revalidate: 60, // Revalidate every minute
    }
  } catch (error) {
    console.error('Error in getStaticProps:', error)
    return {
      props: {
        posts: [],
        topics: [],
        settings: {
          title: 'Forge Journal',
          description: []
        },
      },
      revalidate: 60,
    }
  }
}
