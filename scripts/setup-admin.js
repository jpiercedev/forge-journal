// Setup Admin User Script
// Run this to create the default admin user if the migration didn't work

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAdmin() {
  try {
    console.log('🔍 Checking database tables...');
    
    // Check if admin tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['admin_users', 'admin_roles', 'admin_sessions']);

    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError);
      return;
    }

    const tableNames = tables.map(t => t.table_name);
    console.log('📋 Found tables:', tableNames);

    if (!tableNames.includes('admin_users') || !tableNames.includes('admin_roles')) {
      console.error('❌ Admin tables not found. Please run the migration first:');
      console.error('   1. Go to your Supabase dashboard');
      console.error('   2. Navigate to SQL Editor');
      console.error('   3. Run the contents of supabase/migrations/002_admin_users.sql');
      return;
    }

    console.log('✅ Admin tables found');

    // Check if roles exist
    console.log('🔍 Checking admin roles...');
    const { data: roles, error: rolesError } = await supabase
      .from('admin_roles')
      .select('*');

    if (rolesError) {
      console.error('❌ Error checking roles:', rolesError);
      return;
    }

    console.log('📋 Found roles:', roles.map(r => r.name));

    if (roles.length === 0) {
      console.log('➕ Creating default roles...');
      const { error: insertRolesError } = await supabase
        .from('admin_roles')
        .insert([
          { name: 'super_admin', description: 'Super Administrator with full access', permissions: ['*'] },
          { name: 'editor', description: 'Editor with content management access', permissions: ['posts:*', 'authors:*', 'categories:*', 'smart_import:*'] },
          { name: 'author', description: 'Author with limited content access', permissions: ['posts:create', 'posts:edit_own', 'authors:edit_own'] },
          { name: 'viewer', description: 'Read-only access to admin dashboard', permissions: ['posts:read', 'authors:read', 'categories:read'] }
        ]);

      if (insertRolesError) {
        console.error('❌ Error creating roles:', insertRolesError);
        return;
      }
      console.log('✅ Default roles created');
    }

    // Get super_admin role
    const superAdminRole = roles.find(r => r.name === 'super_admin') || 
                          (await supabase.from('admin_roles').select('*').eq('name', 'super_admin').single()).data;

    if (!superAdminRole) {
      console.error('❌ Super admin role not found');
      return;
    }

    // Check if admin user exists
    console.log('🔍 Checking for existing admin user...');
    const { data: existingUser, error: userCheckError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'admin@forgejournal.com')
      .single();

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      console.error('❌ Error checking for existing user:', userCheckError);
      return;
    }

    if (existingUser) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email: admin@forgejournal.com');
      console.log('🔑 Password: admin123');
      console.log('⚠️  Please change the password after first login!');
      return;
    }

    // Create admin user
    console.log('➕ Creating default admin user...');
    const password = 'admin123';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const { data: newUser, error: createUserError } = await supabase
      .from('admin_users')
      .insert({
        email: 'admin@forgejournal.com',
        password_hash: passwordHash,
        first_name: 'Admin',
        last_name: 'User',
        role_id: superAdminRole.id,
        is_active: true
      })
      .select()
      .single();

    if (createUserError) {
      console.error('❌ Error creating admin user:', createUserError);
      return;
    }

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@forgejournal.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login!');
    console.log('🚀 You can now login at /admin');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
setupAdmin();
