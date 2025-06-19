import PostPage from 'components/PostPage'
import { db, type Post } from 'lib/supabase/client'

interface Settings {
  title: string
  description: any[]
}
import { GetStaticProps } from 'next'
import type { SharedPageProps } from 'pages/_app'

interface PageProps extends SharedPageProps {
  post: Post
  morePosts: Post[]
  settings?: Settings
}

interface Query {
  [key: string]: string
}

export default function ProjectSlugRoute(props: PageProps) {
  const { settings, post, morePosts } = props

  return <PostPage post={post} morePosts={morePosts} settings={settings} />
}

export const getStaticProps: GetStaticProps<PageProps, Query> = async (ctx) => {
  const { params = {} } = ctx

  try {
    // Get the specific post by slug
    const { data: posts, error: postError } = await db.getPosts({
      slug: params.slug,
      status: 'published',
      limit: 1,
      includeAuthor: true
    })

    if (postError || !posts || posts.length === 0) {
      return {
        notFound: true,
      }
    }

    const postData = posts[0]

    // Validate post data
    if (!postData ||
        typeof postData !== 'object') {
      return {
        notFound: true,
      }
    }

    if (!('id' in (postData as any)) ||
        !('title' in (postData as any)) ||
        !('slug' in (postData as any))) {
      return {
        notFound: true,
      }
    }

    const post = postData as Post

    // Get more posts for sidebar
    const { data: morePosts, error: morePostsError } = await db.getPosts({
      status: 'published',
      limit: 5,
      includeAuthor: true
    })

    if (morePostsError) {
      console.error('Error fetching more posts:', morePostsError)
    }

    // Default settings
    const settings: Settings = {
      title: 'Forge Journal',
      description: []
    }

    // Filter and validate more posts
    const validMorePosts: Post[] = []
    if (Array.isArray(morePosts) && !morePostsError) {
      for (const morePost of morePosts) {
        try {
          if (morePost &&
              typeof morePost === 'object' &&
              typeof (morePost as any).id === 'string' &&
              typeof (morePost as any).title === 'string' &&
              typeof (morePost as any).slug === 'string' &&
              (morePost as any).id !== post.id) {
            validMorePosts.push(morePost as Post)
          }
        } catch (e) {
          // Skip invalid posts
        }
      }
    }

    return {
      props: {
        post,
        morePosts: validMorePosts,
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

export const getStaticPaths = async () => {
  try {
    // Get all published post slugs
    const { data: posts, error } = await db.getPosts({
      status: 'published',
      limit: 1000 // Get all posts for static generation
    })

    if (error) {
      console.error('Error fetching post slugs:', error)
      return {
        paths: [],
        fallback: 'blocking',
      }
    }

    const paths = Array.isArray(posts) && !error ?
      posts
        .filter((post: any) => post && typeof post === 'object' && 'slug' in post)
        .map((post: any) => `/posts/${post.slug}`) : []

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
