import ForgePostPage from 'components/ForgePostPage'
import type { Post, Settings } from 'lib/sanity.queries'

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
