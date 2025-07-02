#!/usr/bin/env node

/**
 * Script to check which posts have cover images in the database
 */

const { createClient } = require('@supabase/supabase-js')

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

async function checkCoverImages() {
  try {
    console.log('🔍 Checking posts for cover images...')

    // Get all posts
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, slug, cover_image_url, status')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching posts:', error)
      process.exit(1)
    }

    console.log(`\n📊 Found ${posts.length} total posts`)
    
    const postsWithImages = posts.filter(post => post.cover_image_url)
    const postsWithoutImages = posts.filter(post => !post.cover_image_url)
    
    console.log(`✅ Posts with cover images: ${postsWithImages.length}`)
    console.log(`❌ Posts without cover images: ${postsWithoutImages.length}`)

    if (postsWithImages.length > 0) {
      console.log('\n📸 Posts with cover images:')
      console.log('==========================================')
      postsWithImages.forEach(post => {
        console.log(`📝 ${post.title}`)
        console.log(`   Slug: ${post.slug}`)
        console.log(`   Status: ${post.status}`)
        console.log(`   Image: ${post.cover_image_url}`)
        console.log('')
      })
    }

    if (postsWithoutImages.length > 0) {
      console.log('\n🚫 Posts without cover images:')
      console.log('==========================================')
      postsWithoutImages.forEach(post => {
        console.log(`📝 ${post.title} (${post.status})`)
        console.log(`   Slug: ${post.slug}`)
      })
    }

    // Check if any published posts have cover images
    const publishedWithImages = posts.filter(post => 
      post.status === 'published' && post.cover_image_url
    )
    
    console.log(`\n🌐 Published posts with cover images: ${publishedWithImages.length}`)
    
    if (publishedWithImages.length === 0) {
      console.log('\n⚠️  No published posts have cover images!')
      console.log('   This explains why cover images aren\'t showing on the frontend.')
      console.log('   Try uploading a cover image to a published post using the admin interface.')
    }

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkCoverImages()
