import ForgeIndexPage from 'components/ForgeIndexPage'
import type { Post, Settings } from 'lib/sanity.queries'

export interface IndexPageProps {
  preview?: boolean
  loading?: boolean
  posts: Post[]
  settings: Settings
}

export default function IndexPage(props: IndexPageProps) {
  return <ForgeIndexPage {...props} />
}
