-- Admin User Management Schema
-- Migration: 002_admin_users.sql

-- Admin roles table
CREATE TABLE admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]', -- Array of permission strings
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users table
CREATE TABLE admin_users (
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

-- Admin sessions table for session management
CREATE TABLE admin_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role_id ON admin_users(role_id);
CREATE INDEX idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- Add updated_at triggers
CREATE TRIGGER update_admin_roles_updated_at BEFORE UPDATE ON admin_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default roles
INSERT INTO admin_roles (name, description, permissions) VALUES
    ('super_admin', 'Super Administrator with full access', '["*"]'),
    ('editor', 'Editor with content management access', '["posts:*", "authors:*", "categories:*", "smart_import:*"]'),
    ('author', 'Author with limited content access', '["posts:create", "posts:edit_own", "authors:edit_own"]'),
    ('viewer', 'Read-only access to admin dashboard', '["posts:read", "authors:read", "categories:read"]');

-- Insert default super admin user (password: 'admin123' - CHANGE THIS!)
-- Password hash for 'admin123' using bcrypt with salt rounds 12
INSERT INTO admin_users (email, password_hash, first_name, last_name, role_id) VALUES
    ('admin@forgejournal.com', '$2b$12$LQv3c1yqBwEHFuW4HeDCOeOsQ5/RgdSNyqkK16wuoRCS2jNjbh4F6', 'Admin', 'User', 
     (SELECT id FROM admin_roles WHERE name = 'super_admin'));

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM admin_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a function to check user permissions
CREATE OR REPLACE FUNCTION check_admin_permission(user_id UUID, permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_permissions JSONB;
    has_permission BOOLEAN := false;
BEGIN
    -- Get user permissions from their role
    SELECT r.permissions INTO user_permissions
    FROM admin_users u
    JOIN admin_roles r ON u.role_id = r.id
    WHERE u.id = user_id AND u.is_active = true;
    
    -- If no permissions found, return false
    IF user_permissions IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check for wildcard permission
    IF user_permissions ? '*' THEN
        RETURN true;
    END IF;
    
    -- Check for exact permission match
    IF user_permissions ? permission THEN
        RETURN true;
    END IF;
    
    -- Check for wildcard permission patterns (e.g., "posts:*" matches "posts:create")
    SELECT EXISTS (
        SELECT 1 
        FROM jsonb_array_elements_text(user_permissions) AS perm
        WHERE perm LIKE '%:*' AND permission LIKE REPLACE(perm, '*', '%')
    ) INTO has_permission;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security on admin tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_users (only authenticated admin users can access)
CREATE POLICY "Admin users can view all users" ON admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_sessions s 
            WHERE s.session_token = current_setting('request.jwt.claims', true)::json->>'session_token'
            AND s.expires_at > NOW()
        )
    );

CREATE POLICY "Super admins can modify users" ON admin_users
    FOR ALL USING (
        check_admin_permission(
            (SELECT user_id FROM admin_sessions 
             WHERE session_token = current_setting('request.jwt.claims', true)::json->>'session_token'
             AND expires_at > NOW()),
            'users:*'
        )
    );

-- RLS policies for admin_roles
CREATE POLICY "Admin users can view roles" ON admin_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_sessions s 
            WHERE s.session_token = current_setting('request.jwt.claims', true)::json->>'session_token'
            AND s.expires_at > NOW()
        )
    );

-- RLS policies for admin_sessions (users can only see their own sessions)
CREATE POLICY "Users can view own sessions" ON admin_sessions
    FOR SELECT USING (
        user_id = (
            SELECT s.user_id FROM admin_sessions s 
            WHERE s.session_token = current_setting('request.jwt.claims', true)::json->>'session_token'
            AND s.expires_at > NOW()
        )
    );
