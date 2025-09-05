import { NextApiRequest, NextApiResponse } from 'next'
import { db } from 'lib/supabase/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Get published posts
    const { data: posts, error } = await db.getPosts({
      status: 'published',
      limit: 50,
      includeAuthor: true
    })

    if (error) {
      console.error('Error fetching posts for RSS:', error)
      return res.status(500).json({ message: 'Error fetching posts' })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://theforgejournal.com'
    const currentDate = new Date().toUTCString()

    const rssItems = (posts || []).map((post: any) => {
      const postUrl = `${siteUrl}/posts/${post.slug}`
      const pubDate = new Date(post.published_at || post.created_at).toUTCString()
      
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt || post.title}]]></description>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      ${post.author ? `<author>noreply@theforgejournal.com (${post.author.name})</author>` : ''}
      ${post.cover_image_url ? `<enclosure url="${post.cover_image_url}" type="image/jpeg" />` : ''}
    </item>`
    }).join('')

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Forge Journal</title>
    <description>Shaping leaders and pastors who shape the nation. Biblical insights and practical wisdom for ministry leadership.</description>
    <link>${siteUrl}</link>
    <language>en-us</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <managingEditor>noreply@theforgejournal.com (The Forge Journal)</managingEditor>
    <webMaster>noreply@theforgejournal.com (The Forge Journal)</webMaster>
    <category>Religion</category>
    <category>Christianity</category>
    <category>Ministry</category>
    <category>Leadership</category>
    <ttl>60</ttl>
    <image>
      <url>${siteUrl}/favicon/apple-touch-icon.png</url>
      <title>The Forge Journal</title>
      <link>${siteUrl}</link>
      <width>180</width>
      <height>180</height>
    </image>${rssItems}
  </channel>
</rss>`

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    res.status(200).send(rssXml)
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    res.status(500).json({ message: 'Error generating RSS feed' })
  }
}
