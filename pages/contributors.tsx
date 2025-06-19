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
        showSidebar={false}
      >
        <div className="bg-white">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-forge-teal to-forge-teal-dark">
          <div className="w-[90%] mx-auto max-w-[1280px] py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-serif">
                Our Contributors
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto font-sans">
                Meet the distinguished pastors, theologians, and leaders who share their wisdom
                and insights to equip the church for effective ministry and leadership.
              </p>
            </div>
          </div>
        </div>

        {/* Contributors Grid */}
        <div className="w-[90%] mx-auto max-w-[1280px] py-16">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {authors.map((author) => (
                <div
                  key={author.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200"
                >
                  {/* Author Image */}
                  <div className="h-64 bg-gradient-to-br from-forge-teal/10 to-forge-gold/10 flex items-center justify-center">
                    {author.image_url ? (
                      <Image
                        src={author.image_url}
                        alt={author.image_alt || author.name}
                        width={256}
                        height={256}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-forge-teal bg-opacity-20 flex items-center justify-center">
                        <span className="text-forge-teal text-4xl font-bold font-serif">
                          {author.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Author Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif">
                      {author.name}
                    </h3>

                    {author.title && (
                      <p className="text-forge-gold font-medium mb-3 font-sans">
                        {author.title}
                      </p>
                    )}

                    {author.bio && (
                      <p className="text-gray-700 text-sm leading-relaxed font-sans line-clamp-4">
                        {author.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action Section */}
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="w-[90%] mx-auto max-w-[1280px] py-16">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-serif">
                Join Our Community of Leaders
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto font-sans">
                The Forge Journal is committed to equipping pastors and church leaders
                with the tools, insights, and wisdom needed for effective ministry.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-forge-teal hover:bg-forge-teal-dark transition-colors duration-200 font-sans"
                >
                  Read Latest Articles
                </a>
                <a
                  href="/about"
                  className="inline-flex items-center px-6 py-3 border border-forge-teal text-base font-medium rounded-md text-forge-teal bg-white hover:bg-forge-teal hover:text-white transition-colors duration-200 font-sans"
                >
                  Learn More About Us
                </a>
              </div>
            </div>
          </div>
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