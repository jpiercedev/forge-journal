import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'picsum.photos' },
      { hostname: '*.supabase.co' }, // Supabase storage images
      { hostname: 'uvnbfnobyqbonuxztjuz.supabase.co' }, // Your specific Supabase project
      { hostname: 'cdn.sanity.io' }, // Sanity CDN for migrated images
    ],
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
