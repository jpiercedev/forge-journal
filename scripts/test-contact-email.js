// Test script to send a contact form email with specified details
const { Resend } = require('resend')
require('dotenv').config({ path: '.env.local' })

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendTestContactEmail() {
  try {
    console.log('Sending test contact email...')
    
    // Test form data as specified
    const formData = {
      name: 'Jonathan Pierce',
      email: 'jmdp87@gmail.com',
      message: 'Test Message'
    }

    // Create email content (ACTUAL template from contact form)
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission - The Forge Journal</title>
          <style>
            @import url('https://use.typekit.net/43c2b92825d364b55a40fe57ff67fe61d306ab21.css');

            body {
              font-family: 'proxima-nova', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #374151;
              max-width: 600px;
              margin: 0 auto;
              padding: 0;
              background-color: #f9fafb;
            }
            .email-container {
              background-color: #ffffff;
              margin: 20px;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
            }
            .header {
              background: white;
              color: #1e4356;
              padding: 25px 30px;
              text-align: center;
              position: relative;
            }
            .header::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #be9d58 0%, #a8894e 100%);
            }
            .logo {
              max-width: 200px;
              height: auto;
              margin-bottom: 15px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
              letter-spacing: 0.5px;
              color: #1e4356;
            }
            .header p {
              margin: 10px 0 0 0;
              font-size: 14px;
              color: #6b7280;
              font-weight: 400;
            }
            .content {
              padding: 40px 30px;
            }
            .field {
              margin-bottom: 25px;
            }
            .field-label {
              font-weight: 700;
              color: #1e4356;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 8px;
              display: block;
            }
            .field-value {
              color: #374151;
              font-size: 16px;
              line-height: 1.5;
              padding: 15px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .message-field {
              white-space: pre-wrap;
              background-color: #f0f4f6;
              padding: 25px;
              border-radius: 8px;
              border-left: 4px solid #be9d58;
              font-style: italic;
              line-height: 1.7;
              border-bottom: none;
              word-wrap: break-word;
            }
            .footer {
              background-color: #1e4356;
              color: white;
              padding: 30px;
              text-align: center;
              font-size: 14px;
            }
            .footer p {
              margin: 8px 0;
              opacity: 0.9;
            }
            .footer a {
              color: #be9d58;
              text-decoration: none;
              font-weight: 600;
            }
            .divider {
              height: 2px;
              background: linear-gradient(90deg, #be9d58 0%, #a8894e 100%);
              margin: 30px 0;
            }
            .logo {
              max-width: 200px;
              height: auto;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <img src="https://uvnbfnobyqbonuxztjuz.supabase.co/storage/v1/object/public/assets/logo-horizontal.png" alt="The Forge Journal" class="logo" />
              <h1>📧 New Contact Form Submission</h1>
              <p>Shaping leaders and pastors who shape the nation</p>
            </div>

            <div class="content">
              <div class="field">
                <span class="field-label">From:</span>
                <div class="field-value">${formData.name}</div>
              </div>

              <div class="field">
                <span class="field-label">Email:</span>
                <div class="field-value">${formData.email}</div>
              </div>

              <div class="divider"></div>

              <div class="field">
                <span class="field-label">Message:</span>
                <div class="field-value message-field">${formData.message}</div>
              </div>
            </div>

            <div class="footer">
              <p>This message was sent via the contact form on The Forge Journal website.</p>
              <p>Please reply directly to <a href="mailto:${formData.email}">${formData.email}</a> to respond to this inquiry.</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Create plain text version
    const emailText = `
New Contact Form Submission - The Forge Journal

From: ${formData.name}
Email: ${formData.email}

Message:
${formData.message}

---
This message was sent via the contact form on The Forge Journal website.
Please reply directly to ${formData.email} to respond to this inquiry.
    `

    // Send test email to jonathan@jpierce.dev
    const emailResult = await resend.emails.send({
      from: 'The Forge Journal <notifications@theforgejournal.com>',
      to: ['jonathan@jpierce.dev'],
      replyTo: formData.email,
      subject: `TEST - Contact Form Submission from ${formData.name}`,
      html: emailHtml,
      text: emailText,
    })

    if (emailResult.error) {
      console.error('Resend API error:', emailResult.error)
      return
    }

    console.log('Test contact email sent successfully!')
    console.log('Email ID:', emailResult.data?.id)
    console.log('Sent to: jonathan@jpierce.dev')
    console.log('From details:', formData)

  } catch (error) {
    console.error('Error sending test email:', error)
  }
}

// Run the test
sendTestContactEmail()
