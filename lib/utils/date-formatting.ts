// Centralized date formatting utilities for consistent date display across the site

import { format, parseISO } from 'date-fns'

/**
 * Format a date string for display in post lists and previews
 * Returns format like "July 2, 2024"
 */
export function formatPostDate(dateString: string | undefined | null): string {
  if (!dateString) return ''
  
  try {
    const date = parseISO(dateString)
    return format(date, 'LLLL d, yyyy')
  } catch (error) {
    console.warn('Invalid date string:', dateString)
    return ''
  }
}

/**
 * Format a date string for admin interfaces
 * Returns format like "Jul 2, 2024"
 */
export function formatAdminDate(dateString: string | undefined | null): string {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch (error) {
    console.warn('Invalid date string:', dateString)
    return ''
  }
}

/**
 * Format a date string for admin interfaces with time
 * Returns format like "Jul 2, 2024, 8:53 PM"
 */
export function formatAdminDateTime(dateString: string | undefined | null): string {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.warn('Invalid date string:', dateString)
    return ''
  }
}

/**
 * Format a date string for the Forge post header
 * Returns format like "JULY 2024" for volume info
 */
export function formatForgeHeaderDate(dateString: string | undefined | null): string {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    }).toUpperCase()
  } catch (error) {
    console.warn('Invalid date string:', dateString)
    return ''
  }
}

/**
 * Format a date string for topic pages and other detailed views
 * Returns format like "July 2, 2024"
 */
export function formatTopicDate(dateString: string | undefined | null): string {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    console.warn('Invalid date string:', dateString)
    return ''
  }
}

/**
 * Format a date string for analytics and activity displays
 * Returns format like "Mon, Jul 2"
 */
export function formatActivityDate(dateString: string | undefined | null): string {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  } catch (error) {
    console.warn('Invalid date string:', dateString)
    return ''
  }
}
