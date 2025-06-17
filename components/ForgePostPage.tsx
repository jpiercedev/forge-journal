import Error from 'next/error'
import ForgeLayout from 'components/ForgeLayout'
import ForgePostHeader from 'components/ForgePostHeader'
import PostBody from 'components/PostBody'
import PostPageHead from 'components/PostPageHead'
import type { Post, Settings } from 'lib/sanity.queries'
import * as demo from 'lib/demo.data'

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
          <article className="max-w-none bg-white p-8 shadow-sm">
            <ForgePostHeader
              post={post}
              volumeInfo="FEBRUARY 2025 | VOLUME 54, ISSUE 2"
            />

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              {/* Understanding Slow Living section */}
              <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-8 font-sans">
                Understanding Slow Living
              </h2>

              <p className="text-gray-700 leading-relaxed mb-6 text-lg font-serif">
                In a world where speed and efficiency are often prioritized, slow living invites us to pause and savor the present.
                This approach to life emphasizes mindfulness and intentional living, encouraging us to engage deeply with our
                surroundings and activities. By adopting this mindset, we can cultivate a more meaningful and balanced existence.
              </p>

              <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                Slow living is not about doing everything slowly but rather about doing things at the right pace, allowing us to
                connect with our inner selves and the world around us. It encourages us to focus on quality over quantity, fostering
                a sense of peace and contentment.
              </p>

              {/* Practicing Mindfulness section */}
              <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-12">
                Practicing Mindfulness
              </h2>

              <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                Mindfulness can be practiced in numerous ways, each offering a unique opportunity to connect with the present
                moment. Whether it&apos;s savoring a meal with full attention, enjoying a quiet moment with a book, or simply taking a
                deep breath and appreciating the world around us, these activities allow us to slow down and truly experience life.
              </p>

              <p className="text-gray-700 leading-relaxed mb-8 text-lg font-serif">
                By intentionally engaging in these activities, we can enhance our experiences, deepen our connections with others,
                and foster a greater appreciation for the beauty and complexity of life. As we slow down, we
                open ourselves to a richer, more fulfilling existence, where each moment is valued and cherished.
              </p>

              {/* Quote section */}
              <blockquote className="mt-12 mb-8 pl-8 border-l-4 border-teal-600 italic text-xl text-gray-800 bg-gray-50 py-6 rounded-r-lg font-serif">
                &quot;Slow down and everything you are chasing will come around and catch you.&quot;
                <cite className="block mt-4 text-lg font-semibold not-italic text-gray-900 font-sans">— John De Paola</cite>
              </blockquote>

              <PostBody content={post.content} />
            </div>
          </article>
        )}
      </ForgeLayout>
    </>
  )
}
