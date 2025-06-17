/**
 * This route redirects to the new Supabase-powered admin dashboard.
 * The old Sanity Studio has been replaced with a custom content management system.
 */

import { redirect } from 'next/navigation'

export const dynamic = 'force-static'

export default function StudioPage() {
  // Redirect to the new admin dashboard
  redirect('/admin/dashboard')
}
