// Admin Authentication System for Forge Journal

import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { supabaseAdmin } from '../supabase/client'

export interface AdminUser {
  id: string
  email: string
  first_name: string
  last_name: string
  role_id: string
  is_active: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
  role?: AdminRole
}

export interface AdminRole {
  id: string
  name: string
  description?: string
  permissions: string[]
}

export interface AdminSession {
  id: string
  user_id: string
  session_token: string
  expires_at: string
  created_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface CreateUserData {
  email: string
  password: string
  first_name: string
  last_name: string
  role_id: string
}

// Session duration: 24 hours
const SESSION_DURATION = 24 * 60 * 60 * 1000

export class AdminAuth {
  // Authenticate user with email and password
  static async login(credentials: LoginCredentials): Promise<{ user: AdminUser; session: AdminSession } | null> {
    try {
      // Get user with role information
      const { data: user, error: userError } = await supabaseAdmin
        .from('admin_users')
        .select(`
          *,
          role:admin_roles(*)
        `)
        .eq('email', credentials.email)
        .eq('is_active', true)
        .single()

      if (userError || !user) {
        return null
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash)
      if (!isValidPassword) {
        return null
      }

      // Create session
      const sessionToken = uuidv4()
      const expiresAt = new Date(Date.now() + SESSION_DURATION)

      const { data: session, error: sessionError } = await supabaseAdmin
        .from('admin_sessions')
        .insert({
          user_id: user.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single()

      if (sessionError || !session) {
        throw new Error('Failed to create session')
      }

      // Update last login
      await supabaseAdmin
        .from('admin_users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id)

      // Remove password hash from response
      const { password_hash, ...userWithoutPassword } = user

      return {
        user: userWithoutPassword as AdminUser,
        session,
      }
    } catch (error) {
      console.error('Login error:', error)
      return null
    }
  }

  // Validate session token and return user
  static async validateSession(sessionToken: string): Promise<AdminUser | null> {
    try {
      // Clean up expired sessions first
      await this.cleanupExpiredSessions()

      // Get session with user and role information
      const { data: session, error: sessionError } = await supabaseAdmin
        .from('admin_sessions')
        .select(`
          *,
          user:admin_users(
            *,
            role:admin_roles(*)
          )
        `)
        .eq('session_token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (sessionError || !session || !session.user) {
        return null
      }

      // Remove password hash from response
      const { password_hash, ...userWithoutPassword } = session.user

      return userWithoutPassword as AdminUser
    } catch (error) {
      console.error('Session validation error:', error)
      return null
    }
  }

  // Logout user by invalidating session
  static async logout(sessionToken: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('admin_sessions')
        .delete()
        .eq('session_token', sessionToken)

      return !error
    } catch (error) {
      console.error('Logout error:', error)
      return false
    }
  }

  // Create new admin user
  static async createUser(userData: CreateUserData): Promise<AdminUser | null> {
    try {
      // Hash password
      const saltRounds = 12
      const passwordHash = await bcrypt.hash(userData.password, saltRounds)

      // Create user
      const { data: user, error } = await supabaseAdmin
        .from('admin_users')
        .insert({
          email: userData.email,
          password_hash: passwordHash,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role_id: userData.role_id,
        })
        .select(`
          *,
          role:admin_roles(*)
        `)
        .single()

      if (error || !user) {
        throw new Error(error?.message || 'Failed to create user')
      }

      // Remove password hash from response
      const { password_hash, ...userWithoutPassword } = user

      return userWithoutPassword as AdminUser
    } catch (error) {
      console.error('Create user error:', error)
      return null
    }
  }

  // Update user password
  static async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      const saltRounds = 12
      const passwordHash = await bcrypt.hash(newPassword, saltRounds)

      const { error } = await supabaseAdmin
        .from('admin_users')
        .update({ password_hash: passwordHash })
        .eq('id', userId)

      return !error
    } catch (error) {
      console.error('Update password error:', error)
      return false
    }
  }

  // Get all admin roles
  static async getRoles(): Promise<AdminRole[]> {
    try {
      const { data: roles, error } = await supabaseAdmin
        .from('admin_roles')
        .select('*')
        .order('name')

      if (error) {
        throw new Error(error.message)
      }

      return roles || []
    } catch (error) {
      console.error('Get roles error:', error)
      return []
    }
  }

  // Check if user has specific permission
  static async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin
        .rpc('check_admin_permission', {
          user_id: userId,
          permission: permission,
        })

      if (error) {
        console.error('Permission check error:', error)
        return false
      }

      return data === true
    } catch (error) {
      console.error('Permission check error:', error)
      return false
    }
  }

  // Clean up expired sessions
  static async cleanupExpiredSessions(): Promise<void> {
    try {
      await supabaseAdmin.rpc('cleanup_expired_sessions')
    } catch (error) {
      console.error('Session cleanup error:', error)
    }
  }

  // Get all admin users
  static async getUsers(): Promise<AdminUser[]> {
    try {
      const { data: users, error } = await supabaseAdmin
        .from('admin_users')
        .select(`
          *,
          role:admin_roles(*)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      // Remove password hashes from response
      return (users || []).map(({ password_hash, ...user }) => user as AdminUser)
    } catch (error) {
      console.error('Get users error:', error)
      return []
    }
  }

  // Update user
  static async updateUser(userId: string, updates: Partial<AdminUser>): Promise<AdminUser | null> {
    try {
      const { data: user, error } = await supabaseAdmin
        .from('admin_users')
        .update(updates)
        .eq('id', userId)
        .select(`
          *,
          role:admin_roles(*)
        `)
        .single()

      if (error || !user) {
        throw new Error(error?.message || 'Failed to update user')
      }

      // Remove password hash from response
      const { password_hash, ...userWithoutPassword } = user

      return userWithoutPassword as AdminUser
    } catch (error) {
      console.error('Update user error:', error)
      return null
    }
  }

  // Delete user
  static async deleteUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('admin_users')
        .delete()
        .eq('id', userId)

      return !error
    } catch (error) {
      console.error('Delete user error:', error)
      return false
    }
  }
}
