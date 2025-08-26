import { ImageResponse } from '@vercel/og'
import type { NextRequest } from 'next/server'

export const config = { runtime: 'edge' }

const width = 1200
const height = 630

export default async function ogPost(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const title = searchParams.get('title') || 'Forge Journal'
  const excerpt = searchParams.get('excerpt') || ''
  const imageUrl = searchParams.get('image') || ''
  const author = searchParams.get('author') || ''

  // Skip WebP images as they're not supported by @vercel/og
  // Use a gradient background instead for WebP images
  let processedImageUrl = imageUrl
  if (imageUrl && imageUrl.includes('.webp')) {
    // Don't use WebP images - fall back to gradient background
    processedImageUrl = ''
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
