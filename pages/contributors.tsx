import { GetStaticProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { db, Author, type Post } from 'lib/supabase/client'
import ForgeLayout from 'components/ForgeLayout'

interface ContributorsPageProps {
  authors: Author[]
  posts: Post[]
}

export default function ContributorsPage({ authors, posts }: ContributorsPageProps) {
  return (
    <>
      <Head>
        <title>Contributors - The Forge Journal</title>
        <meta
          name="description"
          content="Meet the distinguished pastors, theologians, and leaders who contribute to The Forge Journal, equipping the church for ministry and leadership."
        />
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
              Contributors
            </h1>
            <div className="border-b-4 border-gray-900 w-16 mb-8"></div>
          </div>



          {/* Contributors Grid */}
          <div>
          {authors.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                No Contributors Found
              </h2>
              <p className="text-gray-600 font-sans">
                Contributors will be displayed here once they are added to the system.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {authors.map((author) => (
                <div
                  key={author.id}
                  className="bg-white border border-gray-300 p-6 flex gap-4"
                >
                  {/* Author Image */}
                  <div className="flex-shrink-0">
                    {author.image_url ? (
                      <Image
                        src={author.image_url}
                        alt={author.image_alt || author.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                        <span className="text-gray-600 text-xl font-bold font-serif">
                          {author.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Author Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 font-serif uppercase tracking-wide">
                      {author.name}
                    </h3>

                    {author.title && (
                      <div className="mb-2">
                        {author.title.split(' | ').map((titlePart, index) => (
                          <p
                            key={index}
                            className={`text-sm font-medium leading-tight font-sans ${
                              index === 0
                                ? 'text-forge-teal font-semibold'
                                : 'text-gray-600'
                            }`}
                          >
                            {titlePart.trim()}
                          </p>
                        ))}
                      </div>
                    )}

                    {author.bio && (
                      <p className="text-xs text-gray-600 leading-relaxed font-sans">
                        {author.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </ForgeLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Fetch authors and posts in parallel
    const [authorsResult, postsResult] = await Promise.all([
      db.getAuthors(),
      db.getPosts({
        status: 'published',
        limit: 10,
        includeAuthor: true
      })
    ])

    if (authorsResult.error) {
      console.error('Error fetching authors:', authorsResult.error)
    }

    if (postsResult.error) {
      console.error('Error fetching posts:', postsResult.error)
    }

    return {
      props: {
        authors: authorsResult.data || [],
        posts: postsResult.data || []
      },
      revalidate: 300 // Revalidate every 5 minutes
    }
  } catch (error) {
    console.error('Error in getStaticProps:', error)
    return {
      props: {
        authors: [],
        posts: []
      },
      revalidate: 60
    }
  }
}