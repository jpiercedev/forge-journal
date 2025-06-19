// Script to run database migration for ads table
// This script applies the migration directly to the cloud Supabase database

const fs = require('fs')
const path = require('path')

// Read the migration file
const migrationPath = path.join(__dirname, '../supabase/migrations/20241219000000_create_ads_table.sql')
const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

async function runMigration() {
  try {
    console.log('Running ads table migration...')
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      },
      body: JSON.stringify({
        sql: migrationSQL
      })
    })

    if (response.ok) {
      console.log('✅ Migration completed successfully!')
      console.log('The ads table has been created with sample data.')
    } else {
      const error = await response.text()
      console.error('❌ Migration failed:', error)
    }
  } catch (error) {
    console.error('❌ Error running migration:', error.message)
  }
}

runMigration()
