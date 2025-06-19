import Meta from 'components/BlogMeta'
import * as demo from 'lib/demo.data'
// Removed Sanity image import - now using direct URLs
import type { Post } from 'lib/supabase/client'

// Settings type for compatibility
interface Settings {
  title?: string
  description?: any[]
}
import Head from 'next/head'
// Legacy stega clean function
function stegaClean(value: any) {
  return value
}

export interface PostPageHeadProps {
  settings: Settings
  post: Post
}

export default function PostPageHead({ settings, post }: PostPageHeadProps) {
  const title = settings.title ?? demo.title
  return (
    <Head>
      <title>
        {stegaClean(post.title ? `${post.title} | ${title}` : title)}
      </title>
      <Meta />
      {post.cover_image_url && (
        <meta
          property="og:image"
          content={post.cover_image_url}
        />
      )}
    </Head>
  )
}
