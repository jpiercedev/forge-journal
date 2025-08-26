import { ImageResponse } from '@vercel/og'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const config = { runtime: 'edge' }

const width = 1200
const height = 630

// Initialize Supabase client for edge runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export default async function ogPost(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  // Get post identifier - can be slug or ID
  const slug = searchParams.get('slug')
  const id = searchParams.get('id')

  // Fallback to URL parameters if no slug/id provided
  const fallbackTitle = searchParams.get('title') || 'Forge Journal'
  const fallbackExcerpt = searchParams.get('excerpt') || ''
  const fallbackImageUrl = searchParams.get('image') || ''
  const fallbackAuthor = searchParams.get('author') || ''

  let title = fallbackTitle
  let excerpt = fallbackExcerpt
  let imageUrl = fallbackImageUrl
  let author = fallbackAuthor

  // Fetch post data from database if slug or id is provided
  if (slug || id) {
    try {
      let query = supabase
        .from('posts')
        .select(`
          title,
          excerpt,
          cover_image_url,
          author:authors(name)
        `)
        .eq('status', 'published')

      if (slug) {
        query = query.eq('slug', slug)
      } else if (id) {
        query = query.eq('id', id)
      }

      const { data: post, error } = await query.single()

      if (!error && post) {
        title = post.title || fallbackTitle
        excerpt = post.excerpt || fallbackExcerpt
        imageUrl = post.cover_image_url || fallbackImageUrl
        author = (post.author as any)?.name || fallbackAuthor
      }
    } catch (error) {
      console.error('Error fetching post data for OG image:', error)
      // Fall back to URL parameters
    }
  }

  // Process image URL - prefer JPEG versions for better compatibility
  let processedImageUrl = imageUrl
  if (imageUrl && imageUrl.includes('.webp')) {
    // Try to find a JPEG version of the same image
    const jpegUrl = imageUrl.replace('.webp', '.jpg')
    // For now, use the JPEG version if it exists, otherwise fall back to gradient
    processedImageUrl = jpegUrl
  }

  // Truncate title and excerpt to fit nicely
  const truncatedTitle = title.length > 80 ? title.substring(0, 77) + '...' : title
  const truncatedExcerpt = excerpt.length > 200 ? excerpt.substring(0, 197) + '...' : excerpt

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          position: 'relative',
          backgroundColor: '#000',
        }}
      >
        {/* Background Image */}
        {processedImageUrl && (
          <img
            src={processedImageUrl}
            alt=""
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.7,
            }}
          />
        )}
        
        {/* Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: processedImageUrl
              ? 'linear-gradient(to bottom, rgba(30, 67, 86, 0.8) 0%, rgba(30, 67, 86, 0.9) 100%)'
              : 'linear-gradient(135deg, #1e4356 0%, #be9d58 50%, #1e4356 100%)',
          }}
        />

        {/* Content Container */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '60px',
            width: '100%',
            height: '100%',
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Header with Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                letterSpacing: '1px',
              }}
            >
              THE FORGE JOURNAL
            </div>
            {author && (
              <div
                style={{
                  display: 'flex',
                  fontSize: '18px',
                  opacity: 0.9,
                }}
              >
                by {author}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            {/* Title */}
            <h1
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                lineHeight: 1.2,
                margin: '0 0 30px 0',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              {truncatedTitle}
            </h1>

            {/* Excerpt */}
            {truncatedExcerpt && (
              <p
                style={{
                  fontSize: '24px',
                  lineHeight: 1.4,
                  margin: 0,
                  opacity: 0.9,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                {truncatedExcerpt}
              </p>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '40px',
              fontSize: '18px',
              opacity: 0.8,
            }}
          >
            Shaping leaders and pastors who shape the nation
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
    }
  )
}
