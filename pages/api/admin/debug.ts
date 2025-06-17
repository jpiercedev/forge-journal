// Debug API for Admin Setup
// This endpoint helps debug admin setup issues

import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase/client'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const debug = {
      environment: process.env.NODE_ENV,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
      tables: {},
      adminUser: null,
      roles: []
    }

    // Check if admin tables exist
    try {
      const { data: adminUsers, error: usersError } = await supabaseAdmin
        .from('admin_users')
        .select('id, email, first_name, last_name, is_active, created_at')
        .limit(5)

      debug.tables.admin_users = usersError ? `Error: ${usersError.message}` : `Found ${adminUsers?.length || 0} users`

      const { data: adminRoles, error: rolesError } = await supabaseAdmin
        .from('admin_roles')
        .select('*')

      debug.tables.admin_roles = rolesError ? `Error: ${rolesError.message}` : `Found ${adminRoles?.length || 0} roles`
      debug.roles = adminRoles || []

      const { data: adminSessions, error: sessionsError } = await supabaseAdmin
        .from('admin_sessions')
        .select('id')
        .limit(1)

      debug.tables.admin_sessions = sessionsError ? `Error: ${sessionsError.message}` : 'Table exists'

      // Check for the default admin user
      if (!usersError && adminUsers) {
        const defaultAdmin = adminUsers.find(u => u.email === 'admin@forgejournal.com')
        if (defaultAdmin) {
          debug.adminUser = {
            exists: true,
            email: defaultAdmin.email,
            name: `${defaultAdmin.first_name} ${defaultAdmin.last_name}`,
            active: defaultAdmin.is_active,
            created: defaultAdmin.created_at
          }

          // Test password hash
          try {
            const { data: userWithHash } = await supabaseAdmin
              .from('admin_users')
              .select('password_hash')
              .eq('email', 'admin@forgejournal.com')
              .single()

            if (userWithHash) {
              const isValidPassword = await bcrypt.compare('admin123', userWithHash.password_hash)
              debug.adminUser.passwordTest = isValidPassword ? 'Valid' : 'Invalid'
            }
          } catch (error) {
            debug.adminUser.passwordTest = `Error: ${error.message}`
          }
        } else {
          debug.adminUser = { exists: false }
        }
      }

    } catch (error) {
      debug.tables.error = error.message
    }

    return res.status(200).json(debug)

  } catch (error) {
    return res.status(500).json({
      error: 'Debug failed',
      message: error.message
    })
  }
}
