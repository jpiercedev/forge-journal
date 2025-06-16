import ForgeLayout from 'components/ForgeLayout'
import IndexPageHead from 'components/IndexPageHead'
import Link from 'next/link'
import Image from 'next/image'
import { urlForImage } from 'lib/sanity.image'
import type { Post, Settings } from 'lib/sanity.queries'

export interface ForgeIndexPageProps {
  preview?: boolean
  loading?: boolean
  posts: Post[]
  settings: Settings
}

export default function ForgeIndexPage(props: ForgeIndexPageProps) {
  const { preview, loading, posts, settings } = props
  const [featuredPost, ...otherPosts] = posts || []

  return (
    <>
      <IndexPageHead settings={settings} />

      <ForgeLayout 
        preview={preview} 
        loading={loading}
        recentPosts={otherPosts.slice(0, 3)}
        showSidebar={true}
      >
        <div className="max-w-none">
          {/* Featured Article */}
          {featuredPost && (
            <section className="mb-16">
              <article className="bg-white">
                <div className="mb-8">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6 tracking-tight">
                    <Link
                      href={`/posts/${featuredPost.slug}`}
                      className="hover:text-orange-500 transition-colors duration-200"
                    >
                      {featuredPost.title}
                    </Link>
                  </h2>

                  <div className="flex items-center space-x-4 text-base text-gray-600 mb-6">
                    {featuredPost.author && (
                      <span className="font-bold text-gray-900">{featuredPost.author.name}</span>
                    )}
                    <span>|</span>
                    <span className="font-medium">
                      {new Date(featuredPost.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </span>
                  </div>

                  {featuredPost.excerpt && (
                    <p className="text-gray-700 leading-relaxed text-xl mb-8">
                      {featuredPost.excerpt}
                    </p>
                  )}

                  <Link
                    href={`/posts/${featuredPost.slug}`}
                    className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-sm font-semibold uppercase tracking-wider transition-colors duration-200 rounded"
                  >
                    READ ISSUE
                  </Link>
                </div>
              </article>
            </section>
          )}

          {/* Other Articles Grid */}
          {otherPosts.length > 0 && (
            <section>
              <div className="grid gap-12 md:gap-16">
                {otherPosts.map((post) => (
                  <article key={post.slug} className="group">
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Article Image */}
                      {post.coverImage && (
                        <div className="md:w-1/3 flex-shrink-0">
                          <Link href={`/posts/${post.slug}`}>
                            <div className="aspect-video overflow-hidden bg-gray-200 rounded-lg">
                              <Image
                                src={urlForImage(post.coverImage)?.width(400).height(225).url() || ''}
                                alt={post.coverImage.alt || post.title}
                                width={400}
                                height={225}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                          </Link>
                        </div>
                      )}

                      {/* Article Content */}
                      <div className="flex-1">
                        <h3 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-4 tracking-tight">
                          <Link
                            href={`/posts/${post.slug}`}
                            className="hover:text-orange-500 transition-colors duration-200"
                          >
                            {post.title}
                          </Link>
                        </h3>

                        <div className="flex items-center space-x-4 text-base text-gray-600 mb-4">
                          {post.author && (
                            <span className="font-bold text-gray-900">{post.author.name}</span>
                          )}
                          <span>|</span>
                          <span className="font-medium">
                            {new Date(post.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long'
                            })}
                          </span>
                        </div>

                        {post.excerpt && (
                          <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                            {post.excerpt}
                          </p>
                        )}

                        <Link
                          href={`/posts/${post.slug}`}
                          className="text-teal-600 hover:text-teal-700 font-semibold text-sm uppercase tracking-wider transition-colors duration-200"
                        >
                          Read Issue
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </ForgeLayout>
    </>
  )
}
