import { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'
import { supabaseAdmin } from '../../../lib/supabase/client'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

// Mailchimp configuration
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY || ''
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX || 'us14'
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID || ''

function getSubscriberHash(email: string): string {
  return crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex')
}

// Helper function to send admin notification email
async function sendAdminNotificationEmail(formData: PDFDownloadFormData, mailchimpStatus: string, isUpdate: boolean = false) {
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
          <title>${isUpdate ? 'Updated' : 'New'} PDF Download - Who Is The Holy Spirit?</title>
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
              background: linear-gradient(135deg, #1e4356 0%, #2a5a7a 100%);
              color: white;
              padding: 40px 20px;
              text-align: center;
            }
            .header img {
              max-width: 200px;
              height: auto;
              margin-bottom: 20px;
              filter: brightness(9.5);
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .header p {
              margin: 8px 0 0 0;
              font-size: 14px;
              opacity: 0.9;
            }
            .content {
              padding: 40px;
            }
            .section {
              margin-bottom: 30px;
            }
            .section h2 {
              font-size: 16px;
              font-weight: 600;
              color: #1e4356;
              margin: 0 0 16px 0;
              border-bottom: 2px solid #be9d58;
              padding-bottom: 8px;
            }
            .info-row {
              display: flex;
              margin-bottom: 12px;
              font-size: 14px;
            }
            .info-label {
              font-weight: 600;
              color: #1e4356;
              min-width: 120px;
            }
            .info-value {
              color: #374151;
              flex: 1;
            }
            .status-badge {
              display: inline-block;
              background-color: ${isUpdate ? '#dbeafe' : '#dcfce7'};
              color: ${isUpdate ? '#0c4a6e' : '#166534'};
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              margin-top: 8px;
            }
            .footer {
              background-color: #f3f4f6;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <img src="https://uvnbfnobyqbonuxztjuz.supabase.co/storage/v1/object/public/assets/logo-horizontal.png" alt="The Forge Journal" />
              <h1>PDF Download</h1>
              <p>Who Is The Holy Spirit? - ${isUpdate ? 'Updated Contact' : 'New Person'}</p>
            </div>

            <div class="content">
              <div class="section">
                <h2>Subscriber Information</h2>
                <div class="info-row">
                  <div class="info-label">Name:</div>
                  <div class="info-value">${formData.firstName} ${formData.lastName}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Email:</div>
                  <div class="info-value">${formData.email}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Phone:</div>
                  <div class="info-value">${formData.phone || 'Not provided'}</div>
                </div>
              </div>

              <div class="section">
                <h2>Address Information</h2>
                <div class="info-row">
                  <div class="info-label">Street:</div>
                  <div class="info-value">${formData.street}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">City:</div>
                  <div class="info-value">${formData.city}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">State:</div>
                  <div class="info-value">${formData.state}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">ZIP:</div>
                  <div class="info-value">${formData.zip}</div>
                </div>
              </div>

              <div class="section">
                <h2>Mailchimp Status</h2>
                <div class="info-row">
                  <div class="info-label">Status:</div>
                  <div class="info-value">
                    ${isUpdate ? 'Existing subscriber updated' : 'New subscriber added to Mailchimp'}
                    <div class="status-badge">${mailchimpStatus}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="footer">
              <p>This is an automated notification from The Forge Journal admin system.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const emailText = `
${isUpdate ? 'Updated' : 'New'} PDF Download - Who Is The Holy Spirit?

SUBSCRIBER INFORMATION
Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}

ADDRESS INFORMATION
Street: ${formData.street}
City: ${formData.city}
State: ${formData.state}
ZIP: ${formData.zip}

MAILCHIMP STATUS
Status: ${isUpdate ? 'Existing subscriber updated' : 'New subscriber added'}
Mailchimp Status: ${mailchimpStatus}
    `

    const emailResult = await resend.emails.send({
      from: 'The Forge Journal <notifications@theforgejournal.com>',
      to: ['jonathan@jpierce.dev'],
      subject: `Resource Download Submission - ${formData.firstName} ${formData.lastName}`,
      html: emailHtml,
      text: emailText,
    })

    if (emailResult.error) {
      console.error('Failed to send notification email:', emailResult.error)
    } else {
      console.log('PDF download notification email sent successfully:', emailResult.data?.id)
    }
  } catch (error) {
    console.error('Error sending admin notification email:', error)
  }
}

interface PDFDownloadFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  street: string
  city: string
  state: string
  zip: string
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
    const formData: PDFDownloadFormData = req.body

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.street || !formData.city || !formData.state || !formData.zip) {
      return res.status(400).json({
        error: 'Missing required fields'
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
        ADDRESS: {
          addr1: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zip: formData.zip.trim(),
          country: 'US',
        },
      },
    }

    if (formData.marketingSource) {
      mailchimpPayload.tags = [formData.marketingSource]
    }

    console.log('Submitting to Mailchimp:', formData.email)

    let mailchimpStatus = 'subscribed'
    let isUpdate = false

    try {
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

      // 200 = existing subscriber updated, 201 = new subscriber created
      isUpdate = mailchimpResponse.status === 200
      mailchimpStatus = mailchimpResult.status || 'subscribed'

      if (!mailchimpResponse.ok && mailchimpResponse.status !== 200) {
        console.error('Mailchimp API error:', mailchimpResult)
      }
    } catch (mailchimpError) {
      console.error('Mailchimp request failed:', mailchimpError)
    }

    // Save to our database
    try {
      const { data: download, error: dbError } = await supabaseAdmin
        .from('pdf_downloads')
        .insert({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone?.trim() || null,
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zip: formData.zip.trim(),
          pdf_name: 'Who Is The Holy Spirit?',
          is_update: isUpdate,
          source: formData.marketingSource || 'website'
        })
        .select()
        .single()

      if (dbError) {
        console.error('Error saving PDF download to database:', dbError)
      } else {
        console.log('PDF download saved to database:', download)
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
    }

    // Send admin notification email
    await sendAdminNotificationEmail(formData, mailchimpStatus, isUpdate)

    return res.status(200).json({
      success: true,
      message: isUpdate ? 'Thank you! Your information has been updated.' : 'Thank you! Your download will begin shortly.',
      isUpdate,
    })

  } catch (error) {
    console.error('PDF download submission error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
