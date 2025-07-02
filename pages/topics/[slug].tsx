import ForgeLayout from 'components/ForgeLayout'
import { db, type Post, type Category } from 'lib/supabase/client'
import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import type { SharedPageProps } from 'pages/_app'

interface Settings {
  title: string
  description: any[]
}

interface PageProps extends SharedPageProps {
  category: Category
  posts: Post[]
  allPosts: Post[]
  settings: Settings
}

interface Query {
  [key: string]: string
}

export default function TopicPage(props: PageProps) {
  const { category, posts, allPosts, settings } = props

  return (
    <>
      <Head>
        <title>{category.title} - Topics - The Forge Journal</title>
        <meta name="description" content={category.description || `Articles about ${category.title} in The Forge Journal.`} />
      </Head>

      <ForgeLayout
        preview={false}
        loading={false}
        recentPosts={allPosts.slice(0, 3)}
        showSidebar={true}
      >
        <div className="max-w-4xl">
          <div className="mb-8">
            <nav className="text-sm text-gray-600 mb-4">
              <Link href="/" className="hover:text-blue-800">Home</Link>
              <span className="mx-2">›</span>
              <Link href="/topics" className="hover:text-blue-800">Topics</Link>
              <span className="mx-2">›</span>
              <span className="text-gray-900">{category.title}</span>
            </nav>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              {category.title}
            </h1>
            <div className="border-b-4 border-gray-900 w-16 mb-8"></div>
          </div>

          {category.description && (
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-xl text-gray-700 leading-relaxed">
                {category.description}
              </p>
            </div>
          )}

          {posts.length > 0 ? (
            <div className="space-y-8">
              <div className="mb-6">
                <p className="text-gray-600">
                  {posts.length} {posts.length === 1 ? 'article' : 'articles'} in this topic
                </p>
              </div>

              {posts.map((post) => (
                <article key={post.id} className="bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                        <Link
                          href={`/posts/${post.slug}`}
                          className="hover:text-blue-800 transition-colors duration-200"
                        >
                          {post.title}
                        </Link>
                      </h2>
                      
                      {post.excerpt && (
                        <p className="text-gray-700 leading-relaxed mb-4">
                          {post.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        {post.author && (
                          <span>By {post.author.name}</span>
                        )}
                        {post.published_at && (
                          <span>
                            {new Date(post.published_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        )}
                        {post.reading_time > 0 && (
                          <span>{post.reading_time} min read</span>
                        )}
                      </div>
                    </div>
                    
                    {post.cover_image_url && (
                      <div className="ml-6 flex-shrink-0">
                        <img
                          src={post.cover_image_url}
                          alt={post.cover_image_alt || post.title}
                          className="w-24 h-24 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="text-blue-800 hover:text-blue-900 font-medium text-sm uppercase tracking-wide transition-colors duration-200"
                    >
                      Read Article →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Articles Yet</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                We haven&apos;t published any articles in this topic yet, but we&apos;re always adding new content.
                Check back soon or explore our other topics.
              </p>
              <Link
                href="/topics"
                className="inline-block bg-blue-800 hover:bg-blue-900 text-white px-6 py-2 text-sm font-medium uppercase tracking-wide transition-colors duration-200"
              >
                Browse All Topics
              </Link>
            </div>
          )}

          <div className="mt-12 bg-gray-50 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Explore More Topics</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Discover more content organized by topic to deepen your understanding and strengthen your ministry.
            </p>
            <Link
              href="/topics"
              className="inline-block bg-blue-800 hover:bg-blue-900 text-white px-6 py-2 text-sm font-medium uppercase tracking-wide transition-colors duration-200"
            >
              View All Topics
            </Link>
          </div>
        </div>
      </ForgeLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps<PageProps, Query> = async (ctx) => {
  const { params = {} } = ctx

  try {
    // Get the category by slug
    const { data: category, error: categoryError } = await db.getCategoryBySlug(params.slug as string)

    if (categoryError || !category) {
      return {
        notFound: true,
      }
    }

    // Get posts for this category
    // For now, we'll return an empty array since posts don't have categories assigned yet
    // This will be updated when the post-category relationship is properly implemented
    const posts: Post[] = []

    // Get all published posts for sidebar
    const { data: allPosts, error: allPostsError } = await db.getPosts({
      status: 'published',
      limit: 10,
      includeAuthor: true
    })

    if (allPostsError) {
      console.error('Error fetching all posts:', allPostsError)
    }

    // Default settings
    const settings: Settings = {
      title: 'Forge Journal',
      description: []
    }

    // Ensure allPosts is an array
    const validAllPosts: Post[] = []
    if (Array.isArray(allPosts)) {
      for (const post of allPosts) {
        try {
          if (post &&
              typeof post === 'object' &&
              typeof (post as any).id === 'string' &&
              typeof (post as any).title === 'string' &&
              typeof (post as any).slug === 'string') {
            validAllPosts.push(post as Post)
          }
        } catch (e) {
          // Skip invalid posts
        }
      }
    }

    return {
      props: {
        category,
        posts,
        allPosts: validAllPosts,
        settings,
      },
      revalidate: 60,
    }
  } catch (error) {
    console.error('Error in getStaticProps:', error)
    return {
      notFound: true,
    }
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    // Get all categories
    const { data: categories, error } = await db.getCategories()

    if (error) {
      console.error('Error fetching categories:', error)
      return {
        paths: [],
        fallback: 'blocking',
      }
    }

    const paths = Array.isArray(categories) && !error ?
      categories
        .filter((category: any) => category && typeof category === 'object' && 'slug' in category)
        .map((category: any) => `/topics/${category.slug}`) : []

    return {
      paths,
      fallback: 'blocking',
    }
  } catch (error) {
    console.error('Error in getStaticPaths:', error)
    return {
      paths: [],
      fallback: 'blocking',
    }
  }
}
