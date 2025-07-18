import { NextApiRequest, NextApiResponse } from 'next'

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

    console.log('Submitting contact to Virtuous:', contact)

    // Try different contact types if the first one fails
    const contactTypesToTry = ['Person', 'Individual', 'Household', 'Contact']
    let virtuousResponse: Response | null = null
    let lastError: any = null

    for (const contactType of contactTypesToTry) {
      const testContact = { ...contact, contactType }
      console.log(`Trying contact type: ${contactType}`)

      try {
        virtuousResponse = await fetch('https://api.virtuoussoftware.com/api/Contact', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.VIRTUOUS_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(testContact)
        })

        if (virtuousResponse.ok) {
          console.log(`Success with contact type: ${contactType}`)
          break
        } else {
          const errorText = await virtuousResponse.text()
          console.log(`Failed with contact type ${contactType}:`, {
            status: virtuousResponse.status,
            body: errorText
          })

          // If it's not a contact type error, break and use this response
          if (!errorText.includes('Contact Type') && !errorText.includes('contactType')) {
            break
          }
        }
      } catch (error) {
        console.log(`Network error with contact type ${contactType}:`, error)
        lastError = error
      }
    }

    if (!virtuousResponse) {
      return res.status(500).json({
        error: 'Failed to connect to Virtuous CRM - all contact types failed',
        details: lastError?.message || 'Network error'
      })
    }

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
        return res.status(200).json({
          success: true,
          message: 'Thank you! You are already subscribed to our updates.'
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

    return res.status(200).json({ 
      success: true, 
      message: 'Contact submitted successfully',
      virtuousId: virtuousResult.id || virtuousResult.transactionId
    })

  } catch (error) {
    console.error('Contact submission error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
