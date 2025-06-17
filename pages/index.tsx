import IndexPage from 'components/IndexPage'
import { db } from 'lib/supabase/client'
import { GetStaticProps } from 'next'
import type { SharedPageProps } from 'pages/_app'

// Define types for Supabase data
interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string
  cover_image_url?: string
  cover_image_alt?: string
  published_at: string
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

interface PageProps extends SharedPageProps {
  posts: Post[]
  settings: Settings
}

export default function Page(props: PageProps) {
  const { posts, settings } = props
  return <IndexPage posts={posts} settings={settings} />
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  try {
    // Get published posts from Supabase
    const { data: posts, error: postsError } = await db.getPosts({
      status: 'published',
      limit: 20,
      includeAuthor: true
    })

    if (postsError) {
      console.error('Error fetching posts:', postsError)
    }

    // Default settings
    const settings: Settings = {
      title: 'Forge Journal',
      description: []
    }

    return {
      props: {
        posts: posts || [],
        settings,
      },
      revalidate: 60, // Revalidate every minute
    }
  } catch (error) {
    console.error('Error in getStaticProps:', error)
    return {
      props: {
        posts: [],
        settings: {
          title: 'Forge Journal',
          description: []
        },
      },
      revalidate: 60,
    }
  }
}
