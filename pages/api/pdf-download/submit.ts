import { NextApiRequest, NextApiResponse } from 'next'
import { Resend } from 'resend'
import { supabaseAdmin } from '../../../lib/supabase/client'
import { getNotificationRecipients } from '../../../lib/notifications/recipients'
import { applyVirtuousTags } from '../admin/virtuous-tags'

const resend = new Resend(process.env.RESEND_API_KEY)

// Helper function to send admin notification email
async function sendAdminNotificationEmail(formData: PDFDownloadFormData, virtuousResult: any, isUpdate: boolean = false) {
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
                <h2>CRM Status</h2>
                <div class="info-row">
                  <div class="info-label">Virtuous ID:</div>
                  <div class="info-value">${virtuousResult?.id || 'N/A'}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Status:</div>
                  <div class="info-value">
                    ${isUpdate ? 'Existing contact updated with address' : 'New contact created'}
                    <div class="status-badge">${isUpdate ? 'Updated' : 'New'}</div>
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

CRM STATUS
Virtuous Contact ID: ${virtuousResult?.id || 'N/A'}
Status: ${isUpdate ? 'Existing contact updated with address' : 'New contact created'}
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

    // Check if Virtuous API key is configured
    if (!process.env.VIRTUOUS_API_KEY) {
      console.error('VIRTUOUS_API_KEY environment variable is not set')
      return res.status(500).json({
        error: 'Server configuration error',
        details: 'Virtuous API key not configured'
      })
    }

    // First, search for existing contact by email
    const searchResponse = await fetch(
      `https://api.virtuoussoftware.com/api/Contact/Find?email=${encodeURIComponent(formData.email.trim())}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.VIRTUOUS_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    )

    let existingContact = null
    if (searchResponse.ok) {
      const searchResult = await searchResponse.json()
      if (searchResult && searchResult.id) {
        existingContact = searchResult
        console.log('Found existing contact:', existingContact.id)
      }
    }

    // Prepare contact methods
    const contactMethods = [
      {
        type: 'Email',
        value: formData.email.trim(),
        isOptedIn: true,
        isPrimary: true
      }
    ]

    if (formData.phone) {
      contactMethods.push({
        type: 'Mobile Phone',
        value: formData.phone.trim(),
        isOptedIn: true,
        isPrimary: false
      })
    }

    // Prepare address
    const address = {
      type: 'Home',
      address1: formData.street.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      postalCode: formData.zip.trim(),
      isPrimary: true
    }

    let virtuousResult
    let isUpdate = false

    if (existingContact) {
      // Update existing contact with new address information
      isUpdate = true

      const updatePayload = {
        id: existingContact.id,
        contactType: existingContact.contactType || 'Household',
        contactIndividuals: existingContact.contactIndividuals?.map((individual: any, index: number) => {
          if (index === 0 || individual.isPrimary) {
            // Update primary individual with new address
            // Preserve existing addresses and add/update the new one
            const existingAddresses = individual.addresses || []
            const addressExists = existingAddresses.some((addr: any) =>
              addr.address1 === address.address1 &&
              addr.city === address.city &&
              addr.state === address.state
            )

            const updatedAddresses = addressExists
              ? existingAddresses.map((addr: any) =>
                  (addr.address1 === address.address1 && addr.city === address.city && addr.state === address.state)
                    ? address
                    : addr
                )
              : [...existingAddresses, address]

            return {
              ...individual,
              addresses: updatedAddresses
            }
          }
          return individual
        }) || [{
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          isPrimary: true,
          contactMethods: contactMethods,
          addresses: [address]
        }]
      }

      console.log('Updating existing contact:', JSON.stringify(updatePayload, null, 2))

      const updateResponse = await fetch(`https://api.virtuoussoftware.com/api/Contact/${existingContact.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.VIRTUOUS_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      })

      const updateText = await updateResponse.text()
      console.log('Virtuous update response status:', updateResponse.status)
      console.log('Virtuous update response body:', updateText)

      if (!updateResponse.ok) {
        console.error('Failed to update contact:', updateResponse.status, updateText)
        return res.status(500).json({
          error: 'Failed to update contact in Virtuous',
          details: updateText
        })
      }

      virtuousResult = updateText ? JSON.parse(updateText) : { id: existingContact.id }
      console.log('Contact updated successfully. Response:', JSON.stringify(virtuousResult, null, 2))

      // Now add/update the address via ContactAddress endpoint
      try {
        const primaryIndividual = existingContact.contactIndividuals?.[0]
        if (primaryIndividual) {
          const existingAddresses = primaryIndividual.addresses || []

          // Check if an address already exists
          const existingAddress = existingAddresses.find((addr: any) => addr.type === 'Home')

          if (existingAddress) {
            // Update existing address - we need the address ID from the contact fetch
            // Since we don't have the ID, we'll need to fetch the contact with full details
            console.log('Found existing Home address, attempting to update it')

            // For now, log that we found an existing address
            console.log('Existing address:', JSON.stringify(existingAddress, null, 2))
          } else {
            // Create new address via POST to ContactAddress endpoint
            const newAddressPayload = {
              contactId: existingContact.id,
              label: 'Home',
              address1: formData.street.trim(),
              address2: '',
              city: formData.city.trim(),
              state: formData.state.trim(),
              postal: formData.zip.trim(),
              country: 'US',
              setAsPrimary: true
            }

            console.log('Creating new address via ContactAddress endpoint:', JSON.stringify(newAddressPayload, null, 2))

            const addressResponse = await fetch(
              'https://api.virtuoussoftware.com/api/ContactAddress',
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.VIRTUOUS_API_KEY}`,
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify(newAddressPayload)
              }
            )

            const addressText = await addressResponse.text()
            console.log('ContactAddress create response status:', addressResponse.status)
            console.log('ContactAddress create response body:', addressText)

            if (!addressResponse.ok) {
              console.error('Failed to create address:', addressResponse.status, addressText)
            } else {
              console.log('Address created successfully')
            }
          }
        }
      } catch (addressError) {
        console.error('Error managing address:', addressError)
      }

    } else {
      // Create new contact
      const tags = ['The Forge Journal', 'FJ Welcome Series']
      if (formData.marketingSource) {
        tags.push(formData.marketingSource)
      }

      const contact = {
        contactType: 'Household',
        referenceSource: 'Forge Journal PDF Download',
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        description: 'Contact from Forge Journal PDF download - Who Is The Holy Spirit?',
        tags: tags,
        contactIndividuals: [
          {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            isPrimary: true,
            contactMethods: contactMethods,
            addresses: [address]
          }
        ]
      }

      console.log('Creating new contact:', JSON.stringify(contact, null, 2))

      const createResponse = await fetch('https://api.virtuoussoftware.com/api/Contact', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VIRTUOUS_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(contact)
      })

      const createText = await createResponse.text()

      if (!createResponse.ok) {
        console.error('Failed to create contact:', createResponse.status, createText)
        return res.status(500).json({
          error: 'Failed to create contact in Virtuous',
          details: createText
        })
      }

      virtuousResult = createText ? JSON.parse(createText) : null
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
          virtuous_contact_id: virtuousResult?.id || null,
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

    // Apply tags for new contacts
    if (!isUpdate && virtuousResult?.id) {
      const tagsToApply = ['The Forge Journal', 'FJ Welcome Series']
      if (formData.marketingSource) {
        tagsToApply.push(formData.marketingSource)
      }

      Promise.resolve().then(async () => {
        try {
          await applyVirtuousTags(virtuousResult.id, tagsToApply)
          console.log(`Successfully applied tags to contact ${virtuousResult.id}`)
        } catch (error) {
          console.error(`Error applying tags to contact ${virtuousResult.id}:`, error)
        }
      }).catch(error => {
        console.error(`Async tag processing failed:`, error)
      })
    }

    // Send admin notification email
    await sendAdminNotificationEmail(formData, virtuousResult, isUpdate)

    return res.status(200).json({
      success: true,
      message: isUpdate ? 'Thank you! Your information has been updated.' : 'Thank you! Your download will begin shortly.',
      isUpdate: isUpdate,
      virtuousId: virtuousResult?.id
    })

  } catch (error) {
    console.error('PDF download submission error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

