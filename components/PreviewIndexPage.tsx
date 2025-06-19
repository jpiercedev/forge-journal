import IndexPage, { type IndexPageProps } from 'components/IndexPage'

// Legacy preview component - now just passes through to regular IndexPage
export default function PreviewIndexPage(props: IndexPageProps) {
  return (
    <IndexPage
      preview
      loading={false}
      posts={props.posts || []}
      settings={props.settings || { title: 'The Forge Journal', description: [] }}
    />
  )
}
