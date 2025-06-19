import ForgeIndexPage from 'components/ForgeIndexPage'
import type { Post } from 'lib/supabase/client'

interface Settings {
  title: string
  description: any[]
}

export interface IndexPageProps {
  preview?: boolean
  loading?: boolean
  posts: Post[]
  settings: Settings
}

export default function IndexPage(props: IndexPageProps) {
  return <ForgeIndexPage {...props} />
}
