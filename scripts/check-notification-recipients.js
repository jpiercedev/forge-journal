require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function checkNotificationRecipients() {
  try {
    console.log('Checking notification recipients...\n')
    
    const { data: recipients, error } = await supabaseAdmin
      .from('notification_recipients')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching recipients:', error)
      return
    }
    
    if (!recipients || recipients.length === 0) {
      console.log('❌ No notification recipients found in database')
      console.log('This explains why only jonathan@jpierce.dev is getting emails (fallback)')
      return
    }
    
    console.log(`Found ${recipients.length} notification recipients:`)
    console.log('=' .repeat(60))
    
    recipients.forEach((recipient, index) => {
      console.log(`${index + 1}. ${recipient.name}`)
      console.log(`   Email: ${recipient.email}`)
      console.log(`   Active: ${recipient.is_active ? '✅' : '❌'}`)
      console.log(`   Types: ${recipient.notification_types.join(', ')}`)
      console.log(`   Created: ${new Date(recipient.created_at).toLocaleDateString()}`)
      console.log('')
    })
    
    // Check active recipients for subscription notifications
    const activeSubscriptionRecipients = recipients
      .filter(r => r.is_active && r.notification_types.includes('subscription'))
      .map(r => r.email)
    
    console.log('Active recipients for subscription notifications:')
    console.log(activeSubscriptionRecipients.length > 0 ? activeSubscriptionRecipients : '❌ None found')
    
  } catch (err) {
    console.error('Failed to check notification recipients:', err)
  }
}

checkNotificationRecipients()
