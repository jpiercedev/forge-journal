// Reset Admin Password API - Development Only
// This will reset the admin password and verify it works

import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase/client'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' })
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const steps = []

    // Step 1: Generate new password hash
    steps.push('Generating new password hash...')
    const password = 'admin123'
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)
    steps.push(`✅ Generated hash: ${passwordHash.substring(0, 20)}...`)

    // Step 2: Update the password in database
    steps.push('Updating password in database...')
    const { data: updateResult, error: updateError } = await supabaseAdmin
      .from('admin_users')
      .update({ password_hash: passwordHash })
      .eq('email', 'admin@forgejournal.com')
      .select('id, email, first_name, last_name')

    if (updateError) {
      steps.push(`❌ Update error: ${updateError.message}`)
      return res.status(500).json({ error: 'Update failed', steps })
    }

    if (!updateResult || updateResult.length === 0) {
      steps.push('❌ No user found to update')
      return res.status(404).json({ error: 'User not found', steps })
    }

    steps.push(`✅ Updated user: ${updateResult[0].email}`)

    // Step 3: Verify the password was updated
    steps.push('Verifying password update...')
    const { data: verifyUser, error: verifyError } = await supabaseAdmin
      .from('admin_users')
      .select('password_hash')
      .eq('email', 'admin@forgejournal.com')
      .single()

    if (verifyError) {
      steps.push(`❌ Verify error: ${verifyError.message}`)
      return res.status(500).json({ error: 'Verification failed', steps })
    }

    // Step 4: Test password comparison
    steps.push('Testing password comparison...')
    const isValidPassword = await bcrypt.compare(password, verifyUser.password_hash)
    steps.push(`🧪 Password test: ${isValidPassword ? '✅ Valid' : '❌ Invalid'}`)

    if (!isValidPassword) {
      steps.push('❌ Password comparison failed - there may be an issue with bcrypt')
      return res.status(500).json({ error: 'Password test failed', steps })
    }

    // Step 5: Test with different bcrypt versions
    steps.push('Testing bcrypt compatibility...')
    try {
      // Test with a simple known hash
      const testHash = await bcrypt.hash('test123', 12)
      const testResult = await bcrypt.compare('test123', testHash)
      steps.push(`🧪 Bcrypt test: ${testResult ? '✅ Working' : '❌ Failed'}`)
    } catch (bcryptError) {
      steps.push(`❌ Bcrypt error: ${bcryptError.message}`)
    }

    steps.push('')
    steps.push('🎉 Password reset complete!')
    steps.push('📧 Email: admin@forgejournal.com')
    steps.push('🔑 Password: admin123')
    steps.push('🚀 Try logging in now!')

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      steps,
      credentials: {
        email: 'admin@forgejournal.com',
        password: 'admin123'
      },
      passwordHash: passwordHash.substring(0, 20) + '...',
      testResult: isValidPassword
    })

  } catch (error) {
    return res.status(500).json({
      error: 'Reset failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}
