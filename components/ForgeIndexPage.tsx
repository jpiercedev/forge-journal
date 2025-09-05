import ForgeLayout from 'components/ForgeLayout'
import ImagePlaceholder from 'components/ImagePlaceholder'
import IndexPageHead from 'components/IndexPageHead'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { Post } from 'lib/supabase/client'

interface Settings {
  title: string
  description: any[]
}

export interface ForgeIndexPageProps {
  preview?: boolean
  loading?: boolean
  posts: Post[]
  settings: Settings
}

export default function ForgeIndexPage(props: ForgeIndexPageProps) {
  const { preview, loading, posts, settings } = props
  const [featuredPost, ...otherPosts] = posts || []
  const [visiblePosts, setVisiblePosts] = useState(6)

  const displayedPosts = otherPosts.slice(0, visiblePosts)
  const hasMorePosts = otherPosts.length > visiblePosts

  const loadMorePosts = () => {
    setVisiblePosts(prev => prev + 6)
  }

  return (
    <>
      <IndexPageHead settings={settings} />

      <ForgeLayout
        preview={preview}
        loading={loading}
        recentPosts={otherPosts.slice(0, 3)}
        showSidebar={true}
        showTagline={false}
      >
        <div className="max-w-none">
          {/* Featured Article - Full Width Background with Overlay */}
          {featuredPost && (
            <section className="mb-8 md:mb-16">
              <div className="relative">
                {/* Featured Badge */}
                <div className="absolute top-2 md:top-4 left-2 md:left-4 z-20">
                  <span className="inline-block px-2 md:px-3 py-1 text-xs font-bold uppercase tracking-wider text-white rounded-full font-sans"
                        style={{ backgroundColor: '#be9d58' }}>
                    Featured
                  </span>
                </div>

                <article className="relative overflow-hidden group cursor-pointer">
                  <Link href={`/posts/${featuredPost.slug}`}>
                    {/* Background Image - Full Width 16:9 */}
                    <div className="aspect-video w-full overflow-hidden bg-gray-200">
                      {featuredPost.cover_image_url ? (
                        <Image
                          src={featuredPost.cover_image_url}
                          alt={featuredPost.cover_image_alt || featuredPost.title}
                          width={1200}
                          height={675}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <ImagePlaceholder
                          width={1200}
                          height={675}
                          aspectRatio="video"
                          text="Featured Image"
                          className="w-full h-full"
                        />
                      )}
                    </div>

                    {/* Accent Color Overlay - reduced opacity to show more of the image */}
                    <div className="absolute inset-0" style={{ backgroundColor: '#1e4356', opacity: 0.3 }}></div>

                    {/* Semi-transparent Overlay - reduced opacity to show more of the image */}
                    <div className="absolute inset-0" style={{
                      background: 'linear-gradient(to right, rgba(30, 67, 86, 0.6), rgba(30, 67, 86, 0.5), rgba(30, 67, 86, 0.2))'
                    }}></div>

                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex items-end">
                      <div className="p-4 sm:p-6 md:p-8 lg:p-12 max-w-2xl w-full pb-6 sm:pb-6 md:pb-8 lg:pb-12">
                        {/* Article Title */}
                        <h1 className="text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-black text-white leading-tight mb-2 sm:mb-3 md:mb-4 tracking-tight font-sans">
                          {featuredPost.title}
                        </h1>

                        {/* Author and Date */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm md:text-base text-gray-300 mb-2 sm:mb-3 md:mb-4 font-sans space-y-1 sm:space-y-0">
                          {featuredPost.author && (
                            <span className="font-medium uppercase tracking-wider">
                              {featuredPost.author.name}
                            </span>
                          )}
                          <span className="text-gray-300 hidden sm:inline">|</span>
                          <span className="font-medium uppercase tracking-wider">
                            {featuredPost.published_at ? new Date(featuredPost.published_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long'
                            }) : 'Draft'}
                          </span>
                        </div>

                        {/* Article Excerpt */}
                        {featuredPost.excerpt && (
                          <p className="text-gray-200 leading-relaxed text-xs sm:text-sm md:text-base lg:text-lg mb-3 sm:mb-4 md:mb-6 max-w-xl font-serif line-clamp-2 sm:line-clamp-3 md:line-clamp-none">
                            {featuredPost.excerpt}
                          </p>
                        )}

                        {/* CTA Button */}
                        <div className="inline-block">
                          <span className="inline-block text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2 md:py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-200 font-sans border border-white hover:bg-white hover:text-gray-900">
                            Read Issue
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              </div>
            </section>
          )}



          {/* Other Articles Grid */}
          {displayedPosts.length > 0 && (
            <section className="bg-white p-4 md:p-6 lg:p-8 shadow-sm border-t-4 md:border-t-8" style={{ borderTopColor: '#1e4356' }}>
              <div className="space-y-8 md:space-y-12 lg:space-y-16">
                {displayedPosts.map((post, index) => (
                  <div key={post.slug}>
                    <article className="group">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8">
                      {/* Article Image - 16:9 aspect ratio */}
                      <div className="md:w-1/3 flex-shrink-0">
                        <Link href={`/posts/${post.slug}`}>
                          <div className="aspect-video overflow-hidden bg-gray-200">
                            {post.cover_image_url ? (
                              <Image
                                src={post.cover_image_url}
                                alt={post.cover_image_alt || post.title}
                                width={400}
                                height={225}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <ImagePlaceholder
                                width={400}
                                height={225}
                                aspectRatio="video"
                                text="Featured Image"
                                className="w-full h-full"
                              />
                            )}
                          </div>
                        </Link>
                      </div>

                      {/* Article Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900 leading-tight mb-3 md:mb-4 tracking-tight font-sans">
                          <Link
                            href={`/posts/${post.slug}`}
                            className="hover:text-amber-600 transition-colors duration-200"
                            style={{ color: '#be9d58' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#a8894e'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#be9d58'}
                          >
                            {post.title}
                          </Link>
                        </h3>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-300 mb-3 md:mb-4 font-sans space-y-1 sm:space-y-0">
                          {post.author && (
                            <div className="flex items-center space-x-2">
                              {/* Small contributor photo */}
                              <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                                {post.author.image_url ? (
                                  <Image
                                    src={post.author.image_url}
                                    alt={post.author.name}
                                    width={24}
                                    height={24}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                                    <span className="text-xs text-white font-bold">
                                      {post.author.name.charAt(0)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <span className="font-medium uppercase tracking-wider">{post.author.name}</span>
                            </div>
                          )}
                          <span className="hidden sm:inline">|</span>
                          <span className="font-medium uppercase tracking-wider">
                            {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long'
                            }) : 'Draft'}
                          </span>
                        </div>

                        {post.excerpt && (
                          <p className="text-gray-700 leading-relaxed mb-4 md:mb-6 text-sm font-sans">
                            {post.excerpt}
                          </p>
                        )}

                        <Link href={`/posts/${post.slug}`}>
                          <span className="inline-block text-white px-4 md:px-6 py-2 md:py-3 text-xs md:text-sm font-semibold uppercase tracking-wider transition-all duration-200 font-sans border hover:bg-transparent"
                                style={{ backgroundColor: '#1e4356', borderColor: '#1e4356' }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.color = '#1e4356';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#1e4356';
                                  e.currentTarget.style.color = 'white';
                                }}>
                            Read Issue
                          </span>
                        </Link>
                      </div>
                    </div>
                    </article>

                    {/* Subtle Divider - only show between articles, not after the last one */}
                    {index < displayedPosts.length - 1 && (
                      <div className="border-t border-gray-200 mt-8 md:mt-12 lg:mt-16"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* View More Button */}
              {hasMorePosts && (
                <div className="mt-12">
                  {/* Divider line */}
                  <div className="border-t border-gray-200 mb-8"></div>

                  <div className="text-center">
                    <button
                      onClick={loadMorePosts}
                      className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors font-sans underline decoration-1 underline-offset-4 hover:decoration-2"
                    >
                      View More Articles
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </ForgeLayout>
    </>
  )
}
