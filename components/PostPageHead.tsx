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
  const siteTitle = settings.title ?? demo.title
  const pageTitle = post.title ? `${post.title} | ${siteTitle}` : siteTitle

  const siteUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://forgejournal.com'

  const postUrl = `${siteUrl}/posts/${post.slug}`
  const postDescription = post.excerpt || 'Read this article on The Forge Journal - Shaping leaders and pastors who shape the nation.'

  // Always use the generated OG image for consistent 16:9 cropping and branding
  const ogImageUrl = `${siteUrl}/api/og-post?slug=${encodeURIComponent(post.slug)}`

  return (
    <Head>
      <title>{stegaClean(pageTitle)}</title>
      <Meta />

      {/* Basic Meta Tags */}
      <meta name="description" content={postDescription} />

      {/* Critical: Ensure og:url comes first for proper social media linking */}
      <meta property="og:url" content={postUrl} />

      {/* Open Graph Meta Tags - Ordered for maximum compatibility */}
      <meta property="og:type" content="article" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content="The Forge Journal" />
      <meta property="og:title" content={stegaClean(post.title || siteTitle)} />
      <meta property="og:description" content={postDescription} />

      {/* Image meta tags - Multiple formats for different platforms */}
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:secure_url" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:alt" content={`${post.title} - The Forge Journal`} />

      {/* Additional image references for broader platform support */}
      <meta name="image" content={ogImageUrl} />
      <meta itemProp="image" content={ogImageUrl} />
      <link rel="image_src" href={ogImageUrl} />

      {/* Removed duplicate image meta tags - now consolidated above */}

      {/* Article specific OG tags */}
      {post.published_at && (
        <meta property="article:published_time" content={post.published_at} />
      )}
      {post.updated_at && (
        <meta property="article:modified_time" content={post.updated_at} />
      )}
      {post.author?.name && (
        <meta property="article:author" content={post.author.name} />
      )}
      <meta property="article:section" content="Ministry" />
      <meta property="article:tag" content="Leadership" />
      <meta property="article:tag" content="Ministry" />
      <meta property="article:tag" content="Pastoral" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@ForgeJournalX" />
      <meta name="twitter:creator" content="@ForgeJournalX" />
      <meta name="twitter:title" content={stegaClean(post.title || siteTitle)} />
      <meta name="twitter:description" content={postDescription} />
      <meta name="twitter:image" content={ogImageUrl} />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content={post.author?.name || 'The Forge Journal'} />
      <link rel="canonical" href={postUrl} />

      {/* Reading time and word count for rich snippets */}
      {post.reading_time && (
        <meta name="twitter:label1" content="Reading time" />
      )}
      {post.reading_time && (
        <meta name="twitter:data1" content={`${post.reading_time} min read`} />
      )}
      {post.word_count && (
        <meta name="twitter:label2" content="Word count" />
      )}
      {post.word_count && (
        <meta name="twitter:data2" content={`${post.word_count} words`} />
      )}
    </Head>
  )
}
