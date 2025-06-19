import ForgePostPage from 'components/ForgePostPage'
import type { Post } from 'lib/supabase/client'

// Settings type for compatibility
interface Settings {
  title?: string
  description?: any[]
}

export interface PostPageProps {
  preview?: boolean
  loading?: boolean
  post: Post
  morePosts: Post[]
  settings: Settings
}

export default function PostPage(props: PostPageProps) {
  return <ForgePostPage {...props} />
}
