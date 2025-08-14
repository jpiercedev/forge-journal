import IndexPage from 'components/IndexPage'
import { db, type Post } from 'lib/supabase/client'
import { GetStaticProps } from 'next'
import type { SharedPageProps } from 'pages/_app'

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
    // Check if Supabase is available (might not be during build time)
    if (!db || typeof db.getPosts !== 'function') {
      console.warn('Supabase client not available during build, returning empty data')
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

    // Get published posts from Supabase
    const { data: posts, error: postsError } = await db.getPosts({
      status: 'published',
      limit: 50, // Load more posts to support pagination
      includeAuthor: true
    })

    if (postsError) {
      console.error('Error fetching posts:', postsError)
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

    // Get current featured post
    let featuredPost = null
    try {
      const { data: featuredData, error: featuredError } = await db.supabase
        .rpc('get_current_featured_post')

      if (!featuredError && featuredData && featuredData.length > 0) {
        // Get the full post data for the featured post
        const { data: fullFeaturedPost, error: fullPostError } = await db.getPostById(
          featuredData[0].post_id,
          true, // include author
          false // don't need categories for homepage
        )

        if (!fullPostError && fullFeaturedPost) {
          featuredPost = fullFeaturedPost
        }
      }
    } catch (error) {
      console.warn('Error fetching featured post:', error)
      // Continue without featured post
    }

    // Default settings
    const settings: Settings = {
      title: 'Forge Journal',
      description: []
    }

    // Ensure posts is an array of Post objects
    const validPosts: Post[] = []
    if (Array.isArray(posts)) {
      for (const post of posts) {
        try {
          if (post &&
              typeof post === 'object' &&
              typeof (post as any).id === 'string' &&
              typeof (post as any).title === 'string' &&
              typeof (post as any).slug === 'string') {
            validPosts.push(post as Post)
          }
        } catch (e) {
          // Skip invalid posts
        }
      }
    }

    // Arrange posts with featured post first
    let arrangedPosts = [...validPosts]
    if (featuredPost) {
      // Remove featured post from the list if it exists there
      arrangedPosts = validPosts.filter(post => post.id !== featuredPost.id)
      // Add featured post to the beginning
      arrangedPosts.unshift(featuredPost)
    }

    return {
      props: {
        posts: arrangedPosts,
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
