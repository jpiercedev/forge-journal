import { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface ContactFormData {
  name: string
  email: string
  message: string
}

interface ApiResponse {
  success: boolean
  message?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  try {
    const formData: ContactFormData = req.body

    // Validate required fields
    if (!formData.name || !formData.email || !formData.message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email, and message are required'
      })
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY environment variable is not set')
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      })
    }

    // Create email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission - The Forge Journal</title>
          <style>
            body {
              font-family: 'Proxima Nova', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #374151;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #1e4356;
              color: white;
              padding: 20px;
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            .content {
              background-color: #f9fafb;
              padding: 30px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .field {
              margin-bottom: 20px;
            }
            .field-label {
              font-weight: bold;
              color: #1e4356;
              margin-bottom: 5px;
              display: block;
            }
            .field-value {
              background-color: white;
              padding: 12px;
              border-radius: 4px;
              border: 1px solid #e5e7eb;
            }
            .message-field {
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            .footer {
              text-align: center;
              color: #6b7280;
              font-size: 14px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
            .logo {
              max-width: 200px;
              height: auto;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>New Contact Form Submission</h1>
            <p>The Forge Journal</p>
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
            

            
            <div class="field">
              <span class="field-label">Message:</span>
              <div class="field-value message-field">${formData.message}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>This message was sent via the contact form on The Forge Journal website.</p>
            <p>Please reply directly to ${formData.email} to respond to this inquiry.</p>
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

    // Send email via Resend
    // Note: In testing mode, can only send to jonathan@jpierce.dev
    // Change to jnelson@gracewoodlands.com once domain is verified
    const emailResult = await resend.emails.send({
      from: 'The Forge Journal <onboarding@resend.dev>',
      to: ['jonathan@jpierce.dev'],
      replyTo: formData.email,
      subject: `Contact Form Submission from ${formData.name}`,
      html: emailHtml,
      text: emailText,
    })

    if (emailResult.error) {
      console.error('Resend API error:', emailResult.error)
      return res.status(500).json({
        success: false,
        error: 'Failed to send email'
      })
    }

    console.log('Contact email sent successfully:', emailResult.data?.id)

    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We\'ll get back to you soon!'
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    })
  }
}
