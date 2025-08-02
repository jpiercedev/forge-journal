// Script to fetch Resend email logs and extract submission details
const { Resend } = require('resend')
require('dotenv').config({ path: '.env.local' })

const resend = new Resend(process.env.RESEND_API_KEY)

async function fetchResendLogs() {
  try {
    console.log('Fetching emails from Resend...')
    
    const emails = await resend.emails.list({
      limit: 50
    })

    if (emails.error) {
      console.error('Resend API error:', emails.error)
      return
    }

    console.log(`Found ${emails.data?.data?.length || 0} total emails`)

    // Filter for subscription and contact form emails
    const relevantEmails = emails.data?.data?.filter(email => 
      email.subject?.includes('New Forge Journal Subscription') || 
      email.subject?.includes('Contact Form Submission')
    ) || []

    console.log(`Found ${relevantEmails.length} relevant emails`)

    // Get details for each relevant email
    for (const email of relevantEmails) {
      console.log('\n=== EMAIL DETAILS ===')
      console.log('ID:', email.id)
      console.log('Subject:', email.subject)
      console.log('To:', email.to)
      console.log('Created:', email.created_at)
      
      try {
        const emailDetail = await resend.emails.get(email.id)
        if (emailDetail.data) {
          console.log('HTML Content:')
          console.log(emailDetail.data.html)
          console.log('\nText Content:')
          console.log(emailDetail.data.text)
        }
      } catch (error) {
        console.error(`Error fetching email ${email.id}:`, error)
      }
      
      console.log('========================\n')
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

fetchResendLogs()
