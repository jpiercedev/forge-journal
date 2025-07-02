#!/usr/bin/env node

/**
 * Script to test if image URLs are accessible
 */

const https = require('https')
const http = require('http')
const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

function testUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https:') ? https : http
    
    const req = client.request(url, { method: 'HEAD' }, (res) => {
      resolve({
        url,
        status: res.statusCode,
        headers: res.headers,
        accessible: res.statusCode >= 200 && res.statusCode < 400
      })
    })
    
    req.on('error', (error) => {
      resolve({
        url,
        status: 'ERROR',
        error: error.message,
        accessible: false
      })
    })
    
    req.setTimeout(5000, () => {
      req.destroy()
      resolve({
        url,
        status: 'TIMEOUT',
        accessible: false
      })
    })
    
    req.end()
  })
}

async function testImageUrls() {
  try {
    console.log('🔍 Testing image URL accessibility...')

    // Get posts with cover images
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, slug, cover_image_url')
      .not('cover_image_url', 'is', null)
      .limit(5)

    if (error) {
      console.error('Error fetching posts:', error)
      process.exit(1)
    }

    console.log(`\n📊 Testing ${posts.length} image URLs...\n`)

    for (const post of posts) {
      console.log(`📝 ${post.title}`)
      console.log(`   Slug: ${post.slug}`)
      console.log(`   URL: ${post.cover_image_url}`)
      
      const result = await testUrl(post.cover_image_url)
      
      if (result.accessible) {
        console.log(`   ✅ Accessible (${result.status})`)
      } else {
        console.log(`   ❌ Not accessible (${result.status})`)
        if (result.error) {
          console.log(`   Error: ${result.error}`)
        }
      }
      console.log('')
    }

    // Test Supabase storage bucket directly
    console.log('🪣 Testing Supabase storage bucket...')
    
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    
    if (bucketError) {
      console.error('Error listing buckets:', bucketError)
    } else {
      const assetsBucket = buckets.find(b => b.name === 'assets')
      if (assetsBucket) {
        console.log(`✅ Assets bucket exists (Public: ${assetsBucket.public})`)
      } else {
        console.log('❌ Assets bucket not found')
      }
    }

    // Test a simple file list
    const { data: files, error: filesError } = await supabase.storage
      .from('assets')
      .list('posts', { limit: 3 })

    if (filesError) {
      console.error('Error listing files:', filesError)
    } else {
      console.log(`📁 Found ${files.length} files in posts folder`)
      files.forEach(file => {
        console.log(`   - ${file.name} (${(file.metadata.size / 1024).toFixed(1)} KB)`)
      })
    }

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

testImageUrls()
