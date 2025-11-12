const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function uploadMockup() {
  try {
    const filePath = path.join(__dirname, '../public/download mockup.jpeg')
    const fileBuffer = fs.readFileSync(filePath)
    
    console.log('Uploading download mockup to Supabase storage...')
    
    const { data, error } = await supabase.storage
      .from('assets')
      .upload('download-mockup.jpeg', fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      })
    
    if (error) {
      console.error('Error uploading file:', error)
      process.exit(1)
    }
    
    console.log('✅ Successfully uploaded download-mockup.jpeg')
    console.log('Public URL: https://uvnbfnobyqbonuxztjuz.supabase.co/storage/v1/object/public/assets/download-mockup.jpeg')
    
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

uploadMockup()

