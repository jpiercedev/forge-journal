// Notification Recipients Helper Functions
import { supabaseAdmin } from '../supabase/client'

export interface NotificationRecipient {
  id: string
  email: string
  name: string
  notification_types: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Get active notification recipients for a specific notification type
 * @param notificationType - Type of notification ('subscription' or 'contact')
 * @returns Array of email addresses that should receive notifications
 */
export async function getNotificationRecipients(notificationType: 'subscription' | 'contact'): Promise<string[]> {
  try {
    const { data: recipients, error } = await supabaseAdmin
      .from('notification_recipients')
      .select('email, notification_types')
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching notification recipients:', error)
      // Fallback to hardcoded recipients if database fails
      return ['jason@theforgejournal.com', 'jpierce@gracewoodlands.com']
    }

    if (!recipients || recipients.length === 0) {
      console.warn('No active notification recipients found, using fallback')
      // Fallback to hardcoded recipients if none found
      return ['jason@theforgejournal.com', 'jpierce@gracewoodlands.com']
    }

    // Filter recipients by notification type
    const filteredEmails = recipients
      .filter(recipient => recipient.notification_types.includes(notificationType))
      .map(recipient => recipient.email)

    if (filteredEmails.length === 0) {
      console.warn(`No recipients found for notification type: ${notificationType}, using fallback`)
      // Fallback to hardcoded recipients if none match the type
      return ['jason@theforgejournal.com', 'jpierce@gracewoodlands.com']
    }

    return filteredEmails
  } catch (error) {
    console.error('Error in getNotificationRecipients:', error)
    // Fallback to hardcoded recipients on any error
    return ['jason@theforgejournal.com', 'jpierce@gracewoodlands.com']
  }
}

/**
 * Get all notification recipients (for admin management)
 * @returns Array of NotificationRecipient objects
 */
export async function getAllNotificationRecipients(): Promise<NotificationRecipient[]> {
  try {
    const { data: recipients, error } = await supabaseAdmin
      .from('notification_recipients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all notification recipients:', error)
      throw new Error('Failed to fetch notification recipients')
    }

    return recipients || []
  } catch (error) {
    console.error('Error in getAllNotificationRecipients:', error)
    throw error
  }
}

/**
 * Validate notification type
 * @param type - The notification type to validate
 * @returns boolean indicating if the type is valid
 */
export function isValidNotificationType(type: string): type is 'subscription' | 'contact' {
  return ['subscription', 'contact'].includes(type)
}
