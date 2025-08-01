import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'picsum.photos' },
      { hostname: '*.supabase.co' }, // Supabase storage images
      { hostname: 'uvnbfnobyqbonuxztjuz.supabase.co' }, // Your specific Supabase project
      { hostname: 'cdn.sanity.io' }, // Sanity CDN for migrated images
      { hostname: 'images.unsplash.com' }, // Unsplash images for ads
      { hostname: 'unsplash.com' }, // Unsplash base domain for any existing URLs
    ],
  },
  async rewrites() {
    return [
      {
        source: '/rss.xml',
        destination: '/api/rss.xml',
      },
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap.xml',
      },
    ]
  },
  typescript: {
    // Set this to false if you want production builds to abort if there's type errors
    ignoreBuildErrors: process.env.VERCEL_ENV === 'production',
  },
  eslint: {
    /// Set this to false if you want production builds to abort if there's lint errors
    ignoreDuringBuilds: process.env.VERCEL_ENV === 'production',
  },
}

export default config
