import ForgeLayout from 'components/ForgeLayout'
import ImagePlaceholder from 'components/ImagePlaceholder'
import IndexPageHead from 'components/IndexPageHead'
import SearchBar from 'components/SearchBar'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect,useState } from 'react'
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
  const [filteredPosts, setFilteredPosts] = useState(otherPosts)

  // Update filtered posts when otherPosts changes
  useEffect(() => {
    setFilteredPosts(otherPosts)
  }, [otherPosts])

  return (
    <>
      <IndexPageHead settings={settings} />

      <ForgeLayout
        preview={preview}
        loading={loading}
        recentPosts={otherPosts.slice(0, 3)}
        showSidebar={true}
        showTagline={true}
        searchBar={otherPosts.length > 0 ? (
          <SearchBar
            posts={otherPosts}
            onSearchResults={setFilteredPosts}
          />
        ) : undefined}
      >
        <div className="max-w-none">
          {/* Featured Article - Full Width Background with Overlay */}
          {featuredPost && (
            <section className="mb-16">
              <div className="relative">
                {/* Featured Badge */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-white rounded-full font-sans"
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

                    {/* Accent Color Overlay */}
                    <div className="absolute inset-0" style={{ backgroundColor: '#1e4356', opacity: 0.5 }}></div>

                    {/* Semi-transparent Overlay */}
                    <div className="absolute inset-0" style={{
                      background: 'linear-gradient(to right, rgba(30, 67, 86, 0.85), rgba(30, 67, 86, 0.7), transparent)'
                    }}></div>

                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex items-end">
                      <div className="p-4 sm:p-6 md:p-8 lg:p-12 max-w-2xl w-full">
                        {/* Article Title */}
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-tight mb-3 sm:mb-4 tracking-tight font-sans">
                          {featuredPost.title}
                        </h1>

                        {/* Author and Date */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm md:text-base text-gray-300 mb-3 sm:mb-4 font-sans space-y-1 sm:space-y-0">
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
                          <p className="text-gray-200 leading-relaxed text-sm sm:text-base md:text-lg mb-4 sm:mb-6 max-w-xl font-serif line-clamp-3 sm:line-clamp-none">
                            {featuredPost.excerpt}
                          </p>
                        )}

                        {/* CTA Button */}
                        <div className="inline-block">
                          <span className="inline-block text-white px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-200 font-sans border border-white hover:bg-white hover:text-gray-900">
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
          {filteredPosts.length > 0 && (
            <section className="bg-white p-6 md:p-8 shadow-sm border-t-8" style={{ borderTopColor: '#1e4356' }}>
              <div className="space-y-12 md:space-y-16">
                {filteredPosts.map((post, index) => (
                  <div key={post.slug}>
                    <article className="group">
                    <div className="flex flex-col md:flex-row gap-8">
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
                      <div className="flex-1">
                        <h3 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-4 tracking-tight font-sans">
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

                        <div className="flex items-center space-x-4 text-sm text-gray-300 mb-4 font-sans">
                          {post.author && (
                            <span className="font-medium uppercase tracking-wider">{post.author.name}</span>
                          )}
                          <span>|</span>
                          <span className="font-medium uppercase tracking-wider">
                            {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long'
                            }) : 'Draft'}
                          </span>
                        </div>

                        {post.excerpt && (
                          <p className="text-gray-700 leading-relaxed mb-6 text-lg font-serif">
                            {post.excerpt}
                          </p>
                        )}

                        <Link href={`/posts/${post.slug}`}>
                          <span className="inline-block text-white px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-200 font-sans border hover:bg-transparent"
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
                    {index < filteredPosts.length - 1 && (
                      <div className="border-t border-gray-200 mt-12 md:mt-16"></div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </ForgeLayout>
    </>
  )
}
