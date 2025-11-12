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

async function fixNotificationRecipients() {
  try {
    console.log('Fixing notification recipients...\n')
    
    // 1. Activate jonathan@jpierce.dev and add notification types
    console.log('1. Activating jonathan@jpierce.dev...')
    const { data: jonathan, error: jonathanError } = await supabaseAdmin
      .from('notification_recipients')
      .update({
        is_active: true,
        notification_types: ['subscription', 'contact']
      })
      .eq('email', 'jonathan@jpierce.dev')
      .select()
    
    if (jonathanError) {
      console.error('Error updating jonathan@jpierce.dev:', jonathanError)
    } else {
      console.log('✅ jonathan@jpierce.dev activated and configured')
    }
    
    // 2. Activate mtapia@gracewoodlands.com and add notification types
    console.log('\n2. Activating mtapia@gracewoodlands.com...')
    const { data: meagan, error: meaganError } = await supabaseAdmin
      .from('notification_recipients')
      .update({
        is_active: true,
        notification_types: ['subscription', 'contact']
      })
      .eq('email', 'mtapia@gracewoodlands.com')
      .select()
    
    if (meaganError) {
      console.error('Error updating mtapia@gracewoodlands.com:', meaganError)
    } else {
      console.log('✅ mtapia@gracewoodlands.com activated and configured')
    }
    
    // 3. Add Lydia (assuming lydia@gracewoodlands.com)
    console.log('\n3. Adding Lydia...')
    const { data: lydia, error: lydiaError } = await supabaseAdmin
      .from('notification_recipients')
      .insert({
        email: 'lydia@gracewoodlands.com',
        name: 'Lydia',
        notification_types: ['subscription', 'contact'],
        is_active: true
      })
      .select()
    
    if (lydiaError) {
      if (lydiaError.code === '23505') {
        console.log('⚠️  Lydia already exists, updating instead...')
        const { data: lydiaUpdate, error: lydiaUpdateError } = await supabaseAdmin
          .from('notification_recipients')
          .update({
            is_active: true,
            notification_types: ['subscription', 'contact']
          })
          .eq('email', 'lydia@gracewoodlands.com')
          .select()
        
        if (lydiaUpdateError) {
          console.error('Error updating Lydia:', lydiaUpdateError)
        } else {
          console.log('✅ Lydia updated and activated')
        }
      } else {
        console.error('Error adding Lydia:', lydiaError)
      }
    } else {
      console.log('✅ Lydia added successfully')
    }
    
    // 4. Add Angie (assuming angie@gracewoodlands.com)
    console.log('\n4. Adding Angie...')
    const { data: angie, error: angieError } = await supabaseAdmin
      .from('notification_recipients')
      .insert({
        email: 'angie@gracewoodlands.com',
        name: 'Angie',
        notification_types: ['subscription', 'contact'],
        is_active: true
      })
      .select()
    
    if (angieError) {
      if (angieError.code === '23505') {
        console.log('⚠️  Angie already exists, updating instead...')
        const { data: angieUpdate, error: angieUpdateError } = await supabaseAdmin
          .from('notification_recipients')
          .update({
            is_active: true,
            notification_types: ['subscription', 'contact']
          })
          .eq('email', 'angie@gracewoodlands.com')
          .select()
        
        if (angieUpdateError) {
          console.error('Error updating Angie:', angieUpdateError)
        } else {
          console.log('✅ Angie updated and activated')
        }
      } else {
        console.error('Error adding Angie:', angieError)
      }
    } else {
      console.log('✅ Angie added successfully')
    }
    
    // 5. Show final results
    console.log('\n' + '='.repeat(60))
    console.log('Final notification recipients:')
    
    const { data: finalRecipients, error: finalError } = await supabaseAdmin
      .from('notification_recipients')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
    
    if (finalError) {
      console.error('Error fetching final recipients:', finalError)
      return
    }
    
    finalRecipients.forEach((recipient, index) => {
      console.log(`${index + 1}. ${recipient.name} (${recipient.email})`)
      console.log(`   Types: ${recipient.notification_types.join(', ')}`)
    })
    
    console.log(`\n✅ Total active recipients: ${finalRecipients.length}`)
    
  } catch (err) {
    console.error('Failed to fix notification recipients:', err)
  }
}

fixNotificationRecipients()
