import { GetStaticProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import { db, Author, type Post } from 'lib/supabase/client'
import ForgeLayout from 'components/ForgeLayout'

interface ContributorsPageProps {
  authors: Author[]
  posts: Post[]
}

interface BioProps {
  bio: string
  maxLength?: number
  className?: string
}

function Bio({ bio, maxLength = 200, className = "" }: BioProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const shouldTruncate = bio.length > maxLength
  const displayText = isExpanded || !shouldTruncate
    ? bio
    : bio.substring(0, maxLength).trim() + '...'

  return (
    <div className={className}>
      <p className="text-base text-gray-600 leading-relaxed font-sans whitespace-pre-line">
        {displayText}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-sm font-medium text-forge-teal hover:text-forge-teal-dark transition-colors duration-200 focus:outline-none focus:underline"
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </button>
      )}
    </div>
  )
}

export default function ContributorsPage({ authors, posts }: ContributorsPageProps) {
  // Define featured author names
  const featuredNames = ['PASTOR STEVE RIGGLE', 'DR. JASON J NELSON']

  // Separate featured and regular authors
  const featuredAuthors = authors.filter(author => featuredNames.includes(author.name))
  const regularAuthors = authors.filter(author => !featuredNames.includes(author.name))

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
        <div>
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6 font-sans">
              Contributors
            </h1>
            <div className="border-b-4 border-gray-900 w-16 mb-8"></div>
          </div>

          {authors.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-sans">
                No Contributors Found
              </h2>
              <p className="text-base text-gray-600 font-sans">
                Contributors will be displayed here once they are added to the system.
              </p>
            </div>
          ) : (
            <>
              {/* Introduction Paragraph */}
              <div className="mb-12">
                <p className="text-base text-gray-700 leading-relaxed font-sans">
                  The Forge Journal contributors are pastors, leaders, and mentors who are committed to equipping a new generation to stand strong in truth, lead with conviction, and impact their communities for the Kingdom of God. Each voice brings biblical insight, real-world experience, and a passion to see pastors rise in this critical hour.
                </p>
              </div>

              {/* Featured Contributors Section */}
              {featuredAuthors.length > 0 && (
                <div className="mb-16">
                  <div className="space-y-8">
                    {featuredAuthors.map((author) => (
                      <div
                        key={author.id}
                        className="bg-gray-50 border border-gray-300 p-4 md:p-8 flex flex-col md:flex-row gap-4 md:gap-8 items-center md:items-start"
                      >
                        {/* Author Image */}
                        <div className="flex-shrink-0">
                          {author.image_url ? (
                            <div className="w-32 h-32 md:w-40 md:h-40 border-2 border-gray-300 overflow-hidden">
                              <Image
                                src={author.image_url}
                                alt={author.image_alt || author.name}
                                width={160}
                                height={160}
                                className="w-full h-full object-cover object-top"
                              />
                            </div>
                          ) : (
                            <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                              <span className="text-gray-600 text-3xl md:text-4xl font-bold font-serif">
                                {author.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Author Info */}
                        <div className="flex-1 min-w-0 text-center md:text-left">
                          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 font-serif uppercase tracking-wide">
                            {author.name}
                          </h3>

                          {author.title && (
                            <div className="mb-4">
                              {author.title.split(' | ').map((titlePart, index) => (
                                <p
                                  key={index}
                                  className={`text-sm md:text-base font-medium leading-tight font-serif ${
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
                            <Bio bio={author.bio} maxLength={300} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Contributors Section */}
              {regularAuthors.length > 0 && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {regularAuthors.map((author) => (
                      <div
                        key={author.id}
                        className="bg-white border border-gray-300 p-6 flex gap-4"
                      >
                        {/* Author Image */}
                        <div className="flex-shrink-0">
                          {author.image_url ? (
                            <div className="w-20 h-20 border-2 border-gray-300 overflow-hidden">
                              <Image
                                src={author.image_url}
                                alt={author.image_alt || author.name}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover object-top"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 bg-gray-200 flex items-center justify-center border-2 border-gray-300">
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
                                  className={`text-sm font-medium leading-tight font-serif ${
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
                            <Bio bio={author.bio} maxLength={150} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ForgeLayout>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // Check if Supabase is available (might not be during build time)
    if (!db || typeof db.getAuthors !== 'function' || typeof db.getPosts !== 'function') {
      console.warn('Supabase client not available during build, returning empty data')
      return {
        props: {
          authors: [],
          posts: []
        },
        revalidate: 60
      }
    }

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