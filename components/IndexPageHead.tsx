import Meta from 'components/BlogMeta'
import * as demo from 'lib/demo.data'
import { Settings } from 'lib/sanity.queries'
import Head from 'next/head'
// Legacy stega clean and toPlainText functions
function stegaClean(value: any) {
  return value
}

function toPlainText(value: any) {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value.map(block =>
      block.children?.map((child: any) => child.text).join('') || ''
    ).join(' ')
  }
  return ''
}

export interface IndexPageHeadProps {
  settings: Settings
}

export default function IndexPageHead({ settings }: IndexPageHeadProps) {
  const {
    title = demo.title,
    description = demo.description,
    ogImage = {},
  } = settings
  const ogImageTitle = ogImage?.title || demo.ogImageTitle

  return (
    <Head>
      <title>{stegaClean(title)}</title>
      <Meta />
      <meta
        key="description"
        name="description"
        content={toPlainText(description)}
      />
      <meta
        property="og:image"
        // Because OG images must have a absolute URL, we use the
        // `VERCEL_URL` environment variable to get the deployment’s URL.
        // More info:
        // https://vercel.com/docs/concepts/projects/environment-variables
        content={`${
          process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : ''
        }/api/og?${new URLSearchParams({ title: ogImageTitle })}`}
      />
    </Head>
  )
}
