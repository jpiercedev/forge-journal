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
      <h2>${isUpdate ? 'Updated' : 'New'} PDF Download - Address Collected</h2>
      <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
      <p><strong>Address:</strong><br/>
      ${formData.street}<br/>
      ${formData.city}, ${formData.state} ${formData.zip}</p>
      <p><strong>PDF:</strong> Who Is The Holy Spirit?</p>
      <p><strong>Virtuous Contact ID:</strong> ${virtuousResult?.id || 'N/A'}</p>
      <p><strong>Status:</strong> ${isUpdate ? 'Existing contact updated with address' : 'New contact created'}</p>
    `

    const emailText = `
${isUpdate ? 'Updated' : 'New'} PDF Download - Address Collected

Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}
Address:
${formData.street}
${formData.city}, ${formData.state} ${formData.zip}

PDF: Who Is The Holy Spirit?
Virtuous Contact ID: ${virtuousResult?.id || 'N/A'}
Status: ${isUpdate ? 'Existing contact updated with address' : 'New contact created'}
    `

    const recipients = await getNotificationRecipients('subscription')

    const emailResult = await resend.emails.send({
      from: 'The Forge Journal <notifications@theforgejournal.com>',
      to: recipients,
      subject: `${isUpdate ? 'Updated' : 'New'} PDF Download: ${formData.firstName} ${formData.lastName}`,
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
            return {
              ...individual,
              addresses: [address]
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

      if (!updateResponse.ok) {
        console.error('Failed to update contact:', updateResponse.status, updateText)
        return res.status(500).json({
          error: 'Failed to update contact in Virtuous',
          details: updateText
        })
      }

      virtuousResult = updateText ? JSON.parse(updateText) : { id: existingContact.id }

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

    // Note: Admin notification email disabled for PDF downloads
    // await sendAdminNotificationEmail(formData, virtuousResult, isUpdate)

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

