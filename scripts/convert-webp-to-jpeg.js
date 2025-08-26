#!/usr/bin/env node

/**
 * Convert WebP cover images to JPEG format for better social media compatibility
 * This script will:
 * 1. Find all WebP images in the posts folder
 * 2. Convert them to JPEG format
 * 3. Upload the JPEG versions to Supabase
 * 4. Update the database to reference the new JPEG URLs
 */

const { createClient } = require('@supabase/supabase-js')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Download image from Supabase storage
 */
async function downloadImage(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return Buffer.from(await response.arrayBuffer())
  } catch (error) {
    console.error(`❌ Failed to download image from ${url}:`, error.message)
    return null
  }
}

/**
 * Convert WebP buffer to JPEG
 */
async function convertWebpToJpeg(webpBuffer) {
  try {
    const jpegBuffer = await sharp(webpBuffer)
      .jpeg({
        quality: 85,
        progressive: true,
        mozjpeg: true
      })
      .toBuffer()
    
    return jpegBuffer
  } catch (error) {
    console.error('❌ Failed to convert WebP to JPEG:', error.message)
    return null
  }
}

/**
 * Upload JPEG image to Supabase storage
 */
async function uploadJpegImage(jpegBuffer, originalPath) {
  try {
    // Replace .webp extension with .jpg
    const jpegPath = originalPath.replace('.webp', '.jpg')
    
    const { data, error } = await supabase.storage
      .from('assets')
      .upload(jpegPath, jpegBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      })

    if (error) {
      throw error
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('assets')
      .getPublicUrl(jpegPath)

    return urlData.publicUrl
  } catch (error) {
    console.error('❌ Failed to upload JPEG image:', error.message)
    return null
  }
}

/**
 * Extract file path from Supabase URL
 */
function extractFilePathFromUrl(url) {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const bucketIndex = pathParts.findIndex(part => part === 'assets')
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      return pathParts.slice(bucketIndex + 1).join('/')
    }
    return null
  } catch (error) {
    console.error('❌ Failed to extract file path from URL:', url, error.message)
    return null
  }
}

/**
 * Update post cover image URL in database
 */
async function updatePostCoverImage(postId, newJpegUrl) {
  try {
    const { error } = await supabase
      .from('posts')
      .update({ cover_image_url: newJpegUrl })
      .eq('id', postId)

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error(`❌ Failed to update post ${postId}:`, error.message)
    return false
  }
}

/**
 * Main conversion function
 */
async function convertWebpCoverImages() {
  console.log('🔄 Starting WebP to JPEG conversion for cover images...\n')

  try {
    // Get all posts with WebP cover images
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, cover_image_url')
      .like('cover_image_url', '%.webp')

    if (error) {
      throw error
    }

    if (!posts || posts.length === 0) {
      console.log('✅ No WebP cover images found to convert')
      return
    }

    console.log(`📋 Found ${posts.length} posts with WebP cover images to convert\n`)

    let successCount = 0
    let failureCount = 0

    for (const post of posts) {
      console.log(`🔄 Processing: ${post.title}`)
      console.log(`   Original URL: ${post.cover_image_url}`)

      // Download the WebP image
      const webpBuffer = await downloadImage(post.cover_image_url)
      if (!webpBuffer) {
        console.log(`   ❌ Failed to download image\n`)
        failureCount++
        continue
      }

      // Convert to JPEG
      const jpegBuffer = await convertWebpToJpeg(webpBuffer)
      if (!jpegBuffer) {
        console.log(`   ❌ Failed to convert to JPEG\n`)
        failureCount++
        continue
      }

      // Extract original file path
      const originalPath = extractFilePathFromUrl(post.cover_image_url)
      if (!originalPath) {
        console.log(`   ❌ Failed to extract file path\n`)
        failureCount++
        continue
      }

      // Upload JPEG version
      const jpegUrl = await uploadJpegImage(jpegBuffer, originalPath)
      if (!jpegUrl) {
        console.log(`   ❌ Failed to upload JPEG version\n`)
        failureCount++
        continue
      }

      // Update database
      const updated = await updatePostCoverImage(post.id, jpegUrl)
      if (!updated) {
        console.log(`   ❌ Failed to update database\n`)
        failureCount++
        continue
      }

      console.log(`   ✅ Successfully converted to: ${jpegUrl}`)
      console.log(`   📊 Size reduction: ${((webpBuffer.length - jpegBuffer.length) / webpBuffer.length * 100).toFixed(1)}%\n`)
      successCount++
    }

    console.log('📊 Conversion Summary:')
    console.log(`   ✅ Successfully converted: ${successCount}`)
    console.log(`   ❌ Failed conversions: ${failureCount}`)
    console.log(`   📈 Success rate: ${((successCount / posts.length) * 100).toFixed(1)}%`)

  } catch (error) {
    console.error('❌ Error during conversion:', error.message)
    process.exit(1)
  }
}

// Run the conversion
if (require.main === module) {
  convertWebpCoverImages()
    .then(() => {
      console.log('\n🎉 WebP to JPEG conversion completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Conversion failed:', error.message)
      process.exit(1)
    })
}

module.exports = { convertWebpCoverImages }
