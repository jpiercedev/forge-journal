import ForgeLayout from 'components/ForgeLayout'
import ForgePostHeader from 'components/ForgePostHeader'
import PostBody from 'components/PostBody'
import PostPageHead from 'components/PostPageHead'
import * as demo from 'lib/demo.data'
import type { Post } from 'lib/supabase/client'
import Error from 'next/error'
import Script from 'next/script'

// Settings type for compatibility
interface Settings {
  title?: string
  description?: any[]
}

const NO_POSTS: Post[] = []

export interface ForgePostPageProps {
  preview?: boolean
  loading?: boolean
  post: Post
  morePosts: Post[]
  settings: Settings
}

export default function ForgePostPage(props: ForgePostPageProps) {
  const { preview, loading, morePosts = NO_POSTS, post, settings } = props
  const { title = demo.title } = settings || {}

  const slug = post?.slug

  if (!slug && !preview) {
    return <Error statusCode={404} />
  }

  return (
    <>
      <PostPageHead settings={settings} post={post} />

      <ForgeLayout
        preview={preview}
        loading={loading}
        recentPosts={morePosts}
        showSidebar={true}
        post={post}
      >
        {preview && !post ? (
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold text-gray-900">Loading…</h1>
          </div>
        ) : (
          <>
            <article className="max-w-none bg-white p-8 shadow-sm">
              <ForgePostHeader
                post={post}
                volumeInfo="FEBRUARY 2025 | VOLUME 54, ISSUE 2"
              />

              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                <PostBody content={post.content} />
              </div>
            </article>

            {/* Virtuous Forms Integration */}
            <div className="max-w-none bg-white p-8 shadow-sm mt-6">
              <div className="border-t border-gray-200 pt-8">
                <div id="virtuous-form-container">
                  <Script
                    src="https://cdn.virtuoussoftware.com/virtuous.embed.min.js"
                    data-vform="ABD6EF54-B777-4893-90C4-1E392F554538"
                    data-orgId="7044"
                    data-isGiving="false"
                    data-dependencies="[]"
                    strategy="lazyOnload"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </ForgeLayout>
    </>
  )
}
