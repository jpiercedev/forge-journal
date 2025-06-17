import PostPage from 'components/PostPage'
import { db } from 'lib/supabase/client'

// Define types for Supabase data
interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string
  cover_image_url?: string
  cover_image_alt?: string
  published_at: string
  content?: any
  author?: {
    name: string
    title?: string
    avatar_url?: string
  }
}

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

    const post = posts[0]

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

    return {
      props: {
        post,
        morePosts: morePosts?.filter(p => p.id !== post.id) || [],
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

    const paths = posts?.map(post => `/posts/${post.slug}`) || []

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
