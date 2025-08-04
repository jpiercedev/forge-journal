// Test script to verify notification recipients functionality
const { getNotificationRecipients } = require('../lib/notifications/recipients')

async function testNotifications() {
  console.log('Testing notification recipients...')
  
  try {
    // Test subscription notifications
    console.log('\n--- Testing Subscription Notifications ---')
    const subscriptionRecipients = await getNotificationRecipients('subscription')
    console.log('Subscription recipients:', subscriptionRecipients)
    
    // Test contact notifications
    console.log('\n--- Testing Contact Notifications ---')
    const contactRecipients = await getNotificationRecipients('contact')
    console.log('Contact recipients:', contactRecipients)
    
    // Test invalid type (should fallback)
    console.log('\n--- Testing Invalid Type (should fallback) ---')
    try {
      const invalidRecipients = await getNotificationRecipients('invalid')
      console.log('Invalid type recipients (fallback):', invalidRecipients)
    } catch (error) {
      console.log('Error with invalid type:', error.message)
    }
    
    console.log('\n✅ Notification recipients test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test
testNotifications()
