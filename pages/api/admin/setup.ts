// One-time setup API for creating admin tables and user
// Only works in development mode

import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase/client'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const results = []

    // Step 1: Create admin_roles table
    results.push('Creating admin_roles table...')
    const createRolesTable = `
      CREATE TABLE IF NOT EXISTS admin_roles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT UNIQUE NOT NULL,
          description TEXT,
          permissions JSONB NOT NULL DEFAULT '[]',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
    
    const { error: rolesTableError } = await supabaseAdmin.rpc('exec_sql', { sql: createRolesTable })
    if (rolesTableError) {
      results.push(`Error creating roles table: ${rolesTableError.message}`)
    } else {
      results.push('✅ admin_roles table created')
    }

    // Step 2: Create admin_users table
    results.push('Creating admin_users table...')
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS admin_users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          role_id UUID REFERENCES admin_roles(id) ON DELETE SET NULL,
          is_active BOOLEAN DEFAULT true,
          last_login_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
    
    const { error: usersTableError } = await supabaseAdmin.rpc('exec_sql', { sql: createUsersTable })
    if (usersTableError) {
      results.push(`Error creating users table: ${usersTableError.message}`)
    } else {
      results.push('✅ admin_users table created')
    }

    // Step 3: Create admin_sessions table
    results.push('Creating admin_sessions table...')
    const createSessionsTable = `
      CREATE TABLE IF NOT EXISTS admin_sessions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
          session_token TEXT UNIQUE NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
    
    const { error: sessionsTableError } = await supabaseAdmin.rpc('exec_sql', { sql: createSessionsTable })
    if (sessionsTableError) {
      results.push(`Error creating sessions table: ${sessionsTableError.message}`)
    } else {
      results.push('✅ admin_sessions table created')
    }

    // Step 4: Insert default roles
    results.push('Creating default roles...')
    const { error: rolesInsertError } = await supabaseAdmin
      .from('admin_roles')
      .upsert([
        { name: 'super_admin', description: 'Super Administrator with full access', permissions: ['*'] },
        { name: 'editor', description: 'Editor with content management access', permissions: ['posts:*', 'authors:*', 'categories:*', 'smart_import:*'] },
        { name: 'author', description: 'Author with limited content access', permissions: ['posts:create', 'posts:edit_own', 'authors:edit_own'] },
        { name: 'viewer', description: 'Read-only access to admin dashboard', permissions: ['posts:read', 'authors:read', 'categories:read'] }
      ], { onConflict: 'name' })

    if (rolesInsertError) {
      results.push(`Error creating roles: ${rolesInsertError.message}`)
    } else {
      results.push('✅ Default roles created')
    }

    // Step 5: Get super_admin role
    const { data: superAdminRole, error: roleError } = await supabaseAdmin
      .from('admin_roles')
      .select('id')
      .eq('name', 'super_admin')
      .single()

    if (roleError || !superAdminRole) {
      results.push(`Error getting super_admin role: ${roleError?.message}`)
      return res.status(500).json({ error: 'Failed to get super_admin role', results })
    }

    // Step 6: Create default admin user
    results.push('Creating default admin user...')
    const password = 'admin123'
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const { error: userInsertError } = await supabaseAdmin
      .from('admin_users')
      .upsert({
        email: 'admin@forgejournal.com',
        password_hash: passwordHash,
        first_name: 'Admin',
        last_name: 'User',
        role_id: superAdminRole.id,
        is_active: true
      }, { onConflict: 'email' })

    if (userInsertError) {
      results.push(`Error creating admin user: ${userInsertError.message}`)
    } else {
      results.push('✅ Default admin user created')
    }

    results.push('')
    results.push('🎉 Setup complete!')
    results.push('📧 Email: admin@forgejournal.com')
    results.push('🔑 Password: admin123')
    results.push('⚠️  Please change the password after first login!')

    return res.status(200).json({
      success: true,
      message: 'Admin setup completed successfully',
      results,
      credentials: {
        email: 'admin@forgejournal.com',
        password: 'admin123'
      }
    })

  } catch (error) {
    return res.status(500).json({
      error: 'Setup failed',
      message: error.message
    })
  }
}
