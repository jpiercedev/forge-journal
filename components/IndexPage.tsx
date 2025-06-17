import ForgeIndexPage from 'components/ForgeIndexPage'

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

export interface IndexPageProps {
  preview?: boolean
  loading?: boolean
  posts: Post[]
  settings: Settings
}

export default function IndexPage(props: IndexPageProps) {
  return <ForgeIndexPage {...props} />
}
