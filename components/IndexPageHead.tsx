import Meta from 'components/BlogMeta'
import * as demo from 'lib/demo.data'
// Settings type for compatibility
interface Settings {
  title?: string
  description?: any[]
  ogImage?: {
    title?: string
  }
}
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
  
  const siteUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://theforgejournal.com'
  
  const siteDescription = 'Shaping leaders and pastors who shape the nation. Biblical insights and practical wisdom for ministry leadership.'

  return (
    <Head>
      <title>{stegaClean(title)}</title>
      <Meta />
      
      {/* Basic Meta Tags */}
      <meta
        key="description"
        name="description"
        content={toPlainText(description) || siteDescription}
      />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="The Forge Journal" />
      <meta property="og:title" content={stegaClean(title)} />
      <meta 
        property="og:description" 
        content={toPlainText(description) || siteDescription} 
      />
      <meta property="og:url" content={siteUrl} />
      <meta
        property="og:image"
        content={`${siteUrl}/api/og-homepage`}
      />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:alt" content="The Forge Journal - Shaping leaders and pastors who shape the nation" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@ForgeJournalX" />
      <meta name="twitter:creator" content="@ForgeJournalX" />
      <meta name="twitter:title" content={stegaClean(title)} />
      <meta 
        name="twitter:description" 
        content={toPlainText(description) || siteDescription} 
      />
      <meta
        name="twitter:image"
        content={`${siteUrl}/api/og-homepage`}
      />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="The Forge Journal" />
      <link rel="canonical" href={siteUrl} />
    </Head>
  )
}
