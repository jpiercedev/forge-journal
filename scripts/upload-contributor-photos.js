#!/usr/bin/env node

/**
 * Script to upload contributor photos to Supabase storage and update author records
 * This uploads images from public/images/contributors/ to Supabase storage
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

// Mapping of image files to author names (for database updates)
const imageToAuthorMapping = {
  'steve-riggle.jpg': 'PASTOR STEVE RIGGLE',
  'jason-nelson.jpg': 'DR. JASON NELSON',
  'sam-thomas.jpg': 'DR. SAM THOMAS',
  'jeff-seif.png': 'DR. JEFFREY SEIF',
  'jeff-seif.webp': 'DR. JEFFREY SEIF', // Alternative format
  'josh-pierce.jpg': 'JOSH PIERCE',
  'juan-carlos.jpg': 'JUAN CARLOS'
}

async function uploadContributorPhotos() {
  try {
    console.log('🚀 Starting contributor photos upload process...')

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

    // Get the contributors directory path
    const contributorsDir = path.join(__dirname, '..', 'public', 'images', 'contributors')
    
    if (!fs.existsSync(contributorsDir)) {
      console.error(`❌ Contributors directory not found at: ${contributorsDir}`)
      process.exit(1)
    }

    // Read all image files in the contributors directory
    const imageFiles = fs.readdirSync(contributorsDir).filter(file => {
      const ext = path.extname(file).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)
    })

    console.log(`📁 Found ${imageFiles.length} image files to upload`)

    const uploadResults = []

    // Upload each image
    for (const filename of imageFiles) {
      const filePath = path.join(contributorsDir, filename)
      const fileBuffer = fs.readFileSync(filePath)
      const fileExt = path.extname(filename).toLowerCase()
      
      // Determine content type
      let contentType = 'image/jpeg'
      if (fileExt === '.png') contentType = 'image/png'
      if (fileExt === '.webp') contentType = 'image/webp'

      console.log(`⬆️  Uploading ${filename}...`)

      // Upload to contributors folder in storage
      const storageFilename = `contributors/${filename}`
      const { data, error } = await supabase.storage
        .from('assets')
        .upload(storageFilename, fileBuffer, {
          contentType,
          upsert: true // Replace if exists
        })

      if (error) {
        console.error(`❌ Error uploading ${filename}:`, error)
        continue
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('assets')
        .getPublicUrl(storageFilename)

      console.log(`✅ ${filename} uploaded successfully`)
      
      uploadResults.push({
        filename,
        publicUrl: urlData.publicUrl,
        authorName: imageToAuthorMapping[filename]
      })
    }

    console.log('\n📝 Upload Summary:')
    console.log('==================')
    
    // Update author records with new image URLs
    for (const result of uploadResults) {
      if (result.authorName) {
        console.log(`🔄 Updating ${result.authorName} with image URL...`)
        
        const { error: updateError } = await supabase
          .from('authors')
          .update({ 
            image_url: result.publicUrl,
            image_alt: `Photo of ${result.authorName}`
          })
          .eq('name', result.authorName)

        if (updateError) {
          console.error(`❌ Error updating ${result.authorName}:`, updateError)
        } else {
          console.log(`✅ Updated ${result.authorName} successfully`)
        }
      }
      
      console.log(`📸 ${result.filename} -> ${result.publicUrl}`)
    }

    console.log('\n🎉 All contributor photos uploaded and database updated!')
    console.log('\n📝 Next steps:')
    console.log('1. The contributors page will now display images from Supabase storage')
    console.log('2. You can remove the local images from public/images/contributors/ if desired')
    console.log('3. All author records have been updated with the new image URLs')

  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

// Run the upload
uploadContributorPhotos()
