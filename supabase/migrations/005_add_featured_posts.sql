-- Add featured post functionality
-- Migration: 005_add_featured_posts.sql

-- Create featured_posts table to manage featured post scheduling
CREATE TABLE featured_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX idx_featured_posts_active ON featured_posts(is_active, scheduled_at);
CREATE INDEX idx_featured_posts_post_id ON featured_posts(post_id);

-- Add RLS policies
ALTER TABLE featured_posts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read featured posts
CREATE POLICY "Allow authenticated users to read featured posts" ON featured_posts
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow admin users to manage featured posts
CREATE POLICY "Allow admin users to manage featured posts" ON featured_posts
    FOR ALL USING (auth.role() = 'authenticated');

-- Function to get current featured post
CREATE OR REPLACE FUNCTION get_current_featured_post()
RETURNS TABLE (
    post_id UUID,
    title TEXT,
    slug TEXT,
    excerpt TEXT,
    cover_image_url TEXT,
    author_name TEXT,
    published_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.slug,
        p.excerpt,
        p.cover_image_url,
        a.name as author_name,
        p.published_at
    FROM featured_posts fp
    JOIN posts p ON fp.post_id = p.id
    LEFT JOIN authors a ON p.author_id = a.id
    WHERE fp.is_active = true 
    AND fp.scheduled_at <= NOW()
    AND p.status = 'published'
    ORDER BY fp.scheduled_at DESC
    LIMIT 1;
END;
$$;

-- Function to set featured post (deactivates previous ones)
CREATE OR REPLACE FUNCTION set_featured_post(
    p_post_id UUID,
    p_scheduled_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    featured_id UUID;
BEGIN
    -- Deactivate all current featured posts
    UPDATE featured_posts SET is_active = false WHERE is_active = true;
    
    -- Insert new featured post
    INSERT INTO featured_posts (post_id, scheduled_at, is_active)
    VALUES (p_post_id, p_scheduled_at, true)
    RETURNING id INTO featured_id;
    
    RETURN featured_id;
END;
$$;

-- Add comment for documentation
COMMENT ON TABLE featured_posts IS 'Manages featured posts with scheduling capability';
COMMENT ON FUNCTION get_current_featured_post() IS 'Returns the currently active featured post';
COMMENT ON FUNCTION set_featured_post(UUID, TIMESTAMPTZ) IS 'Sets a post as featured and deactivates previous featured posts';
