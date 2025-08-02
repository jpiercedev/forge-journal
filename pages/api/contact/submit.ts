import { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'
import { supabaseAdmin } from '../../../lib/supabase/client'

const resend = new Resend(process.env.RESEND_API_KEY)

interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  smsOptIn: boolean
}

interface VirtuousContact {
  contactType: string
  referenceSource?: string
  name?: string
  description?: string
  tags?: string[]
  contactIndividuals: Array<{
    firstName: string
    lastName: string
    isPrimary: boolean
    contactMethods: Array<{
      type: string
      value: string
      isOptedIn: boolean
      isPrimary: boolean
    }>
  }>
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
    if (!formData.firstName || !formData.lastName || !formData.email) {
      return res.status(400).json({
        error: 'Missing required fields: firstName, lastName, and email are required'
      })
    }

    // Check if Virtuous API key is configured
    if (!process.env.VIRTUOUS_API_KEY) {
      console.error('VIRTUOUS_API_KEY environment variable is not set')
      return res.status(500).json({
        error: 'Server configuration error',
        details: 'Virtuous API key not configured'
      })
    }

    // Prepare the contact for Virtuous API using the correct structure
    const contactMethods = [
      {
        type: 'Email',
        value: formData.email.trim(),
        isOptedIn: true,
        isPrimary: true
      }
    ]

    // Add phone number if provided
    if (formData.phone && formData.phone.trim()) {
      contactMethods.push({
        type: 'Phone',
        value: formData.phone.trim(),
        isOptedIn: formData.smsOptIn, // Use the SMS consent for phone opt-in
        isPrimary: false
      })
    }

    const contact: VirtuousContact = {
      contactType: 'Household', // Use 'Household' as it's the working contact type
      referenceSource: 'Forge Journal Website',
      name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      description: 'Contact from Forge Journal website newsletter signup',
      tags: ['forge-journal-submission'],
      contactIndividuals: [
        {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          isPrimary: true,
          contactMethods: contactMethods
        }
      ]
    }

    console.log('Submitting contact to Virtuous:', JSON.stringify(contact, null, 2))

    const virtuousResponse = await fetch('https://api.virtuoussoftware.com/api/Contact', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VIRTUOUS_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(contact)
    })

    console.log('Virtuous API response status:', virtuousResponse.status)
    console.log('Virtuous API response headers:', Object.fromEntries(virtuousResponse.headers.entries()))

    // Read response body once
    const responseText = await virtuousResponse.text()

    if (!virtuousResponse.ok) {
      console.error('Virtuous API error:', {
        status: virtuousResponse.status,
        statusText: virtuousResponse.statusText,
        body: responseText
      })

      // Check if it's a duplicate email error
      if (responseText.includes('email address already exists')) {
        console.log('Email already exists in Virtuous - treating as success')

        // Save/update subscriber in our database even if they exist in Virtuous
        try {
          const { data: subscriber, error: dbError } = await supabaseAdmin
            .from('subscribers')
            .upsert({
              first_name: formData.firstName.trim(),
              last_name: formData.lastName.trim(),
              email: formData.email.trim().toLowerCase(),
              phone: formData.phone?.trim() || null,
              sms_opt_in: formData.smsOptIn,
              is_existing: true,
              source: 'website'
            }, {
              onConflict: 'email'
            })
            .select()
            .single()

          if (dbError) {
            console.error('Error saving existing subscriber to database:', dbError)
          } else {
            console.log('Existing subscriber saved/updated in database:', subscriber)
          }
        } catch (dbError) {
          console.error('Database error for existing subscriber:', dbError)
        }

        return res.status(200).json({
          success: true,
          message: 'Welcome back! You\'re already part of The Forge Journal family and will continue receiving bold biblical leadership insights and updates from the movement. Thank you for your continued support as we raise up leaders for this critical hour.',
          isExisting: true
        })
      }

      return res.status(500).json({
        error: 'Failed to submit to Virtuous CRM',
        details: `${virtuousResponse.status}: ${virtuousResponse.statusText}`,
        body: responseText
      })
    }

    // Parse successful response
    let virtuousResult
    try {
      virtuousResult = JSON.parse(responseText)
    } catch (e) {
      virtuousResult = { message: 'Contact created successfully' }
    }
    console.log('Virtuous API success:', virtuousResult)

    // Save subscriber to our database
    try {
      const { data: subscriber, error: dbError } = await supabaseAdmin
        .from('subscribers')
        .insert({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone?.trim() || null,
          sms_opt_in: formData.smsOptIn,
          virtuous_contact_id: virtuousResult?.id || null,
          is_existing: false,
          source: 'website'
        })
        .select()
        .single()

      if (dbError) {
        console.error('Error saving subscriber to database:', dbError)
      } else {
        console.log('Subscriber saved to database:', subscriber)
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Don't fail the request if database save fails
    }

    // Add tags to the contact after creation
    const contactId = virtuousResult.id
    if (contactId) {
      // Tag IDs from Virtuous
      const tagIdsToAdd = [
        25,  // The Forge Journal
        26   // FJ Welcome Series
      ]

      for (const tagId of tagIdsToAdd) {
        try {
          const tagResponse = await fetch('https://api.virtuoussoftware.com/api/ContactTag', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.VIRTUOUS_API_KEY}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              contactId: contactId,
              tagId: tagId
            })
          })

          const tagResponseText = await tagResponse.text()

          if (tagResponse.ok) {
            console.log(`Successfully added tag ID ${tagId} to contact ${contactId}`)
          } else {
            console.error(`Failed to add tag ID ${tagId}:`, {
              status: tagResponse.status,
              statusText: tagResponse.statusText,
              body: tagResponseText
            })
          }
        } catch (tagError) {
          console.error(`Error adding tag ID ${tagId}:`, tagError)
        }
      }
    }

    // Send email notification to jonathan@jpierce.dev
    try {
      if (process.env.RESEND_API_KEY) {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Forge Journal Subscription</title>
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
                  <h1>🎉 New Forge Journal Subscription</h1>
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
                  <div class="field-label">SMS Opt-in:</div>
                  <div class="field-value">${formData.smsOptIn ? 'Yes' : 'No'}</div>
                </div>

                <div class="divider"></div>

                <div class="tags">
                  <div class="field-label">✅ Successfully Added to Virtuous CRM</div>
                  <div class="field-value">
                    <strong>Tags Applied:</strong><br>
                    • The Forge Journal<br>
                    • FJ Welcome Series
                  </div>
                </div>
              </div>

              <div class="footer">
                <p>This subscriber has been successfully added to Virtuous CRM with the appropriate tags.</p>
                <p>Virtuous Contact ID: <span class="contact-id">${virtuousResult.id || virtuousResult.transactionId || 'N/A'}</span></p>
              </div>
            </div>
          </body>
        </html>
        `

        const emailText = `
New Forge Journal Subscription

Subscriber: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
${formData.phone ? `Phone: ${formData.phone}` : ''}
SMS Opt-in: ${formData.smsOptIn ? 'Yes' : 'No'}

✅ Successfully added to Virtuous CRM with tags:
• The Forge Journal
• FJ Welcome Series

Virtuous Contact ID: ${virtuousResult.id || virtuousResult.transactionId || 'N/A'}
        `

        const emailResult = await resend.emails.send({
          from: 'The Forge Journal <onboarding@resend.dev>',
          to: ['jason@theforgejournal.com', 'jpierce@gracewoodlands.com'],
          subject: `New Forge Journal Subscription: ${formData.firstName} ${formData.lastName}`,
          html: emailHtml,
          text: emailText,
        })

        if (emailResult.error) {
          console.error('Failed to send notification email:', emailResult.error)
        } else {
          console.log('Subscription notification email sent successfully:', emailResult.data?.id)
        }
      } else {
        console.warn('RESEND_API_KEY not configured - skipping email notification')
      }
    } catch (emailError) {
      console.error('Error sending notification email:', emailError)
      // Don't fail the main operation if email fails
    }

    return res.status(200).json({
      success: true,
      message: 'Contact submitted successfully',
      virtuousId: virtuousResult.id || virtuousResult.transactionId,
      isExisting: false
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
