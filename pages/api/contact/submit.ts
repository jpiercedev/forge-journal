import { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'
import { supabaseAdmin } from '../../../lib/supabase/client'
import { getNotificationRecipients } from '../../../lib/notifications/recipients'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

// Mailchimp configuration
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY || ''
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX || 'us14'
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID || ''

// Helper to create MD5 hash for Mailchimp subscriber
function getSubscriberHash(email: string): string {
  return crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex')
}

// Helper function to send admin notification email
async function sendAdminNotificationEmail(formData: ContactFormData, mailchimpResult: any, isExisting: boolean = false) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured - skipping email notification')
      return
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${isExisting ? 'Existing' : 'New'} Forge Journal Subscription</title>
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
            .tags {
              background: linear-gradient(135deg, #f0f4f6 0%, #e5f3ff 100%);
              padding: 25px;
              border-radius: 12px;
              margin-top: 30px;
              border-left: 4px solid #be9d58;
            }
            .tags .field-label {
              color: #1e4356;
              margin-bottom: 15px;
            }
            .tags .field-value {
              border-bottom: none;
              padding: 0;
              font-weight: 500;
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
            .footer .contact-id {
              color: #be9d58;
              font-weight: 600;
              font-family: monospace;
            }
            .divider {
              height: 2px;
              background: linear-gradient(90deg, #be9d58 0%, #a8894e 100%);
              margin: 30px 0;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <img src="https://uvnbfnobyqbonuxztjuz.supabase.co/storage/v1/object/public/assets/logo-horizontal.png" alt="The Forge Journal" class="logo" />
              <h1>🎉 ${isExisting ? 'Existing' : 'New'} Forge Journal Subscription</h1>
              <p>Shaping leaders and pastors who shape the nation</p>
            </div>

            <div class="content">
              <div class="field">
                <div class="field-label">Subscriber Name:</div>
                <div class="field-value">${formData.firstName} ${formData.lastName}</div>
              </div>

              <div class="field">
                <div class="field-label">Email:</div>
                <div class="field-value">${formData.email}</div>
              </div>

              ${formData.phone ? `
              <div class="field">
                <div class="field-label">Phone:</div>
                <div class="field-value">${formData.phone}</div>
              </div>
              ` : ''}

              <div class="field">
                <div class="field-label">State:</div>
                <div class="field-value">${formData.state}</div>
              </div>

              <div class="field">
                <div class="field-label">SMS Opt-in:</div>
                <div class="field-value">${formData.smsOptIn ? 'Yes' : 'No'}</div>
              </div>

              <div class="field">
                <div class="field-label">Status:</div>
                <div class="field-value">${isExisting ? 'Existing Subscriber (Updated)' : 'New Subscriber'}</div>
              </div>

              <div class="divider"></div>

              <div class="tags">
                <div class="field-label">✅ Successfully ${isExisting ? 'Updated in' : 'Added to'} Mailchimp</div>
                <div class="field-value">
                  <strong>Status:</strong> ${isExisting ? 'Existing subscriber updated' : 'New subscriber added'}
                </div>
              </div>
            </div>

            <div class="footer">
              <p>This subscriber has been successfully ${isExisting ? 'updated in' : 'added to'} Mailchimp and saved locally.</p>
              <p>Mailchimp Status: <span class="contact-id">${mailchimpResult?.status || 'subscribed'}</span></p>
            </div>
          </div>
        </body>
      </html>
    `

    const emailText = `
${isExisting ? 'Existing' : 'New'} Forge Journal Subscription

Subscriber: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
${formData.phone ? `Phone: ${formData.phone}` : ''}
State: ${formData.state}
SMS Opt-in: ${formData.smsOptIn ? 'Yes' : 'No'}
Status: ${isExisting ? 'Existing Subscriber (Updated)' : 'New Subscriber'}

✅ Successfully ${isExisting ? 'updated in' : 'added to'} Mailchimp and saved locally.
Mailchimp Status: ${mailchimpResult?.status || 'subscribed'}
    `

    // Get notification recipients from database
    const recipients = await getNotificationRecipients('subscription')

    const emailResult = await resend.emails.send({
      from: 'The Forge Journal <notifications@theforgejournal.com>',
      to: recipients,
      subject: `${isExisting ? 'Existing' : 'New'} Forge Journal Subscription: ${formData.firstName} ${formData.lastName}`,
      html: emailHtml,
      text: emailText,
    })

    if (emailResult.error) {
      console.error('Failed to send notification email:', emailResult.error)
    } else {
      console.log('Subscription notification email sent successfully:', emailResult.data?.id)
    }
  } catch (error) {
    console.error('Error sending admin notification email:', error)
  }
}

interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  state: string
  smsOptIn: boolean
  marketingSource?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const formData: ContactFormData = req.body

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.state) {
      return res.status(400).json({
        error: 'Missing required fields: firstName, lastName, email, and state are required'
      })
    }

    // Submit to Mailchimp via upsert (PUT) so existing subscribers are updated, not rejected
    const subscriberHash = getSubscriberHash(formData.email)
    const mailchimpUrl = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members/${subscriberHash}`

    const mailchimpPayload: any = {
      email_address: formData.email.trim().toLowerCase(),
      status_if_new: 'subscribed',
      merge_fields: {
        FNAME: formData.firstName.trim(),
        LNAME: formData.lastName.trim(),
        STATE: formData.state.trim(),
        PHONE: formData.phone?.trim() || '',
      },
    }

    if (formData.marketingSource) {
      mailchimpPayload.tags = [formData.marketingSource]
    }

    console.log('Submitting to Mailchimp:', formData.email)

    const mailchimpResponse = await fetch(mailchimpUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mailchimpPayload),
    })

    const mailchimpResult = await mailchimpResponse.json()
    console.log('Mailchimp response status:', mailchimpResponse.status)

    const isExisting = mailchimpResult.status === 'subscribed' && mailchimpResponse.status === 200

    if (!mailchimpResponse.ok && mailchimpResponse.status !== 200) {
      console.error('Mailchimp API error:', mailchimpResult)
      // Don't block the user — log and continue to save locally
    }

    // Save/upsert subscriber locally in Supabase
    try {
      const { data: subscriber, error: dbError } = await supabaseAdmin
        .from('subscribers')
        .upsert({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone?.trim() || null,
          state: formData.state.trim(),
          sms_opt_in: formData.smsOptIn,
          is_existing: isExisting,
          source: formData.marketingSource || 'website',
        }, { onConflict: 'email' })
        .select()
        .single()

      if (dbError) {
        console.error('Error saving subscriber to database:', dbError)
      } else {
        console.log('Subscriber saved to database:', subscriber)
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
    }

    // Send admin notification email
    await sendAdminNotificationEmail(formData, mailchimpResult, isExisting)

    return res.status(200).json({
      success: true,
      message: isExisting
        ? "Welcome back! You're already part of The Forge Journal family. Thank you for your continued support."
        : 'Contact submitted successfully',
      isExisting,
    })

  } catch (error) {
    console.error('Contact submission error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
