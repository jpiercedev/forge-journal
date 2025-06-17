// Test Smart Import Setup

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testSmartImportSetup() {
  console.log('🧪 Testing Smart Import Setup...\n')

  // Test 1: Environment Variables
  console.log('1. Checking Environment Variables:')
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY'
  ]

  let envVarsOk = true
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar]
    if (value) {
      console.log(`   ✅ ${envVar}: ${envVar === 'OPENAI_API_KEY' || envVar === 'SUPABASE_SERVICE_ROLE_KEY' ? '[HIDDEN]' : value}`)
    } else {
      console.log(`   ❌ ${envVar}: Missing`)
      envVarsOk = false
    }
  }

  if (!envVarsOk) {
    console.log('\n❌ Environment variables are missing. Please check your .env.local file.')
    return
  }

  // Test 2: Supabase Connection
  console.log('\n2. Testing Supabase Connection:')
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title')
      .limit(1)

    if (error) throw error

    console.log(`   ✅ Supabase connection successful`)
    console.log(`   📊 Found ${posts?.length || 0} sample posts`)
  } catch (error) {
    console.log(`   ❌ Supabase connection failed: ${error.message}`)
    return
  }

  // Test 3: OpenAI API Key Format
  console.log('\n3. Checking OpenAI API Key:')
  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey && openaiKey.startsWith('sk-')) {
    console.log('   ✅ OpenAI API key format looks correct')
  } else {
    console.log('   ❌ OpenAI API key format appears invalid')
    return
  }

  // Test 4: Dependencies
  console.log('\n4. Checking Required Dependencies:')
  const requiredDeps = [
    'openai',
    'cheerio', 
    'pdf-parse',
    'mammoth',
    'multer',
    'html-to-text'
  ]

  let depsOk = true
  for (const dep of requiredDeps) {
    try {
      require(dep)
      console.log(`   ✅ ${dep}: Installed`)
    } catch (error) {
      console.log(`   ❌ ${dep}: Missing`)
      depsOk = false
    }
  }

  if (!depsOk) {
    console.log('\n❌ Some dependencies are missing. Run: npm install --legacy-peer-deps openai cheerio pdf-parse mammoth multer html-to-text')
    return
  }

  // Test 5: File Structure
  console.log('\n5. Checking Smart Import Files:')
  const fs = require('fs')
  const path = require('path')
  
  const requiredFiles = [
    'types/smart-import.ts',
    'lib/smart-import/content-extractor.ts',
    'lib/smart-import/ai-processor.ts', 
    'lib/smart-import/supabase-formatter.ts',
    'lib/smart-import/validators.ts',
    'pages/api/smart-import/parse-url.ts',
    'pages/api/smart-import/parse-text.ts',
    'pages/api/smart-import/parse-file.ts',
    'pages/api/smart-import/create-post.ts',
    'pages/api/smart-import/preview.ts',
    'pages/admin/smart-import.tsx',
    'components/SmartImport/SmartImportInterface.tsx'
  ]

  let filesOk = true
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file}`)
    } else {
      console.log(`   ❌ ${file}: Missing`)
      filesOk = false
    }
  }

  if (!filesOk) {
    console.log('\n❌ Some Smart Import files are missing.')
    return
  }

  // Success!
  console.log('\n🎉 Smart Import Setup Complete!')
  console.log('\n📋 Next Steps:')
  console.log('   1. Start your development server: npm run dev')
  console.log('   2. Navigate to: http://localhost:3000/admin/smart-import')
  console.log('   3. Start importing content to Supabase!')
  console.log('\n📚 Documentation:')
  console.log('   • User Guide: SMART_IMPORT_USER_GUIDE.md')
  console.log('   • Technical Guide: SMART_IMPORT_TECHNICAL_GUIDE.md')
  console.log('   • Architecture: SMART_IMPORT_ARCHITECTURE.md')
}

// Run the test
testSmartImportSetup().catch(console.error)
