import { NextApiRequest, NextApiResponse } from 'next'
import { db } from 'lib/supabase/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://theforgejournal.com'
    const currentDate = new Date().toISOString()

    // Static pages
    const staticPages = [
      { url: '', changefreq: 'daily', priority: '1.0' },
      { url: '/about', changefreq: 'monthly', priority: '0.8' },
      { url: '/topics', changefreq: 'weekly', priority: '0.8' },
      { url: '/contributors', changefreq: 'monthly', priority: '0.8' },
      { url: '/forge-pastors', changefreq: 'monthly', priority: '0.8' },
      { url: '/subscribe', changefreq: 'monthly', priority: '0.7' },
      { url: '/contact', changefreq: 'monthly', priority: '0.6' },
      { url: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
      { url: '/terms-of-service', changefreq: 'yearly', priority: '0.3' },
    ]

    // Get published posts
    const { data: posts, error } = await db.getPosts({
      status: 'published',
      limit: 1000, // Get all posts
      includeAuthor: false
    })

    if (error) {
      console.error('Error fetching posts for sitemap:', error)
    }

    const staticUrls = staticPages.map(page => `
  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')

    const postUrls = (posts || []).map((post: any) => {
      const lastmod = new Date(post.updated_at || post.published_at || post.created_at).toISOString()
      return `
  <url>
    <loc>${siteUrl}/posts/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`
    }).join('')

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${staticUrls}${postUrls}
</urlset>`

    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    res.status(200).send(sitemapXml)
  } catch (error) {
    console.error('Error generating sitemap:', error)
    res.status(500).json({ message: 'Error generating sitemap' })
  }
}
