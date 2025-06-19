#!/usr/bin/env node

/**
 * Script to upload the Forge Journal logo to Supabase storage
 * This creates the assets bucket if it doesn't exist and uploads the logo
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function uploadLogo() {
  try {
    console.log('🚀 Starting logo upload process...')

    // Check if assets bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError)
      process.exit(1)
    }

    const assetsBucket = buckets.find(bucket => bucket.name === 'assets')
    
    if (!assetsBucket) {
      console.log('📦 Creating assets bucket...')
      const { data: bucket, error: createError } = await supabase.storage.createBucket('assets', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        fileSizeLimit: 52428800 // 50MB
      })

      if (createError) {
        console.error('Error creating bucket:', createError)
        process.exit(1)
      }
      
      console.log('✅ Assets bucket created successfully')
    } else {
      console.log('✅ Assets bucket already exists')
    }

    // Read the logo file
    const logoPath = path.join(__dirname, '..', '.assets', 'LOGO - the FORGE Journal Horizontal.png')
    
    if (!fs.existsSync(logoPath)) {
      console.error(`❌ Logo file not found at: ${logoPath}`)
      process.exit(1)
    }

    console.log('📁 Reading logo file...')
    const logoFile = fs.readFileSync(logoPath)
    
    // Upload the logo
    console.log('⬆️  Uploading logo to Supabase storage...')
    const { data, error } = await supabase.storage
      .from('assets')
      .upload('logo-horizontal.png', logoFile, {
        contentType: 'image/png',
        upsert: true // Replace if exists
      })

    if (error) {
      console.error('Error uploading logo:', error)
      process.exit(1)
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('assets')
      .getPublicUrl('logo-horizontal.png')

    console.log('✅ Logo uploaded successfully!')
    console.log('🔗 Public URL:', urlData.publicUrl)
    console.log('')
    console.log('📝 Next steps:')
    console.log('1. Update ForgeHeader.tsx to use the logo image instead of text')
    console.log('2. Update any other components that reference the text logo')
    console.log('')
    console.log('Logo URL to use in components:')
    console.log(`"${urlData.publicUrl}"`)

    return urlData.publicUrl

  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

// Run the upload
uploadLogo()
