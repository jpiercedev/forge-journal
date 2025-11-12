import { ImageResponse } from '@vercel/og'
import type { NextRequest } from 'next/server'

export const config = { runtime: 'edge' }

const width = 1200
const height = 630

export default async function ogPdfDownload(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const title = searchParams.get('title') || 'Who Is The Holy Spirit?'
  const subtitle = searchParams.get('subtitle') || 'A Comprehensive Guide'

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
        {/* Gradient Background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1e4356 0%, #be9d58 50%, #1e4356 100%)',
          }}
        />

        {/* Content Container */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            padding: '60px',
            textAlign: 'center',
          }}
        >
          {/* Logo/Branding */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                letterSpacing: '2px',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              THE FORGE
            </div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'normal',
                color: 'white',
                letterSpacing: '3px',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                marginTop: '4px',
              }}
            >
              JOURNAL
            </div>
          </div>

          {/* PDF Title */}
          <div
            style={{
              fontSize: '56px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '20px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              maxWidth: '900px',
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '28px',
              color: '#be9d58',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              marginBottom: '40px',
            }}
          >
            {subtitle}
          </div>

          {/* CTA Text */}
          <div
            style={{
              fontSize: '20px',
              color: 'rgba(255, 255, 255, 0.9)',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            Free Download
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
    },
  )
}

