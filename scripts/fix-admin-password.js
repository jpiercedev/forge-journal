// Fix Admin Password Script
// This will update the admin user's password with a fresh hash

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdminPassword() {
  try {
    console.log('🔧 Fixing admin password...');
    
    // Generate a fresh password hash
    const password = 'admin123';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    console.log('🔑 Generated new password hash');
    
    // Update the admin user's password
    const { data, error } = await supabase
      .from('admin_users')
      .update({ password_hash: passwordHash })
      .eq('email', 'admin@forgejournal.com')
      .select();

    if (error) {
      console.error('❌ Error updating password:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.error('❌ Admin user not found');
      return;
    }

    console.log('✅ Password updated successfully!');
    
    // Test the new password
    const { data: testUser } = await supabase
      .from('admin_users')
      .select('password_hash')
      .eq('email', 'admin@forgejournal.com')
      .single();

    if (testUser) {
      const isValid = await bcrypt.compare(password, testUser.password_hash);
      console.log('🧪 Password test:', isValid ? '✅ Valid' : '❌ Invalid');
    }

    console.log('');
    console.log('🎉 Admin login credentials:');
    console.log('📧 Email: admin@forgejournal.com');
    console.log('🔑 Password: admin123');
    console.log('');
    console.log('🚀 Try logging in at /admin now!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Run the fix
fixAdminPassword();
