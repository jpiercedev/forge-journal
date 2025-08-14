-- Add post scheduling functionality
-- Migration: 006_add_post_scheduling.sql

-- Add scheduled_publish_at field to posts table
ALTER TABLE posts ADD COLUMN scheduled_publish_at TIMESTAMPTZ;

-- Create index for efficient queries on scheduled posts
CREATE INDEX idx_posts_scheduled_publish ON posts(scheduled_publish_at, status);

-- Function to publish scheduled posts
CREATE OR REPLACE FUNCTION publish_scheduled_posts()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    published_count INTEGER := 0;
BEGIN
    -- Update posts that are scheduled to be published and the time has passed
    UPDATE posts 
    SET 
        status = 'published',
        published_at = NOW(),
        updated_at = NOW(),
        scheduled_publish_at = NULL -- Clear the scheduled time once published
    WHERE 
        status = 'draft' 
        AND scheduled_publish_at IS NOT NULL 
        AND scheduled_publish_at <= NOW();
    
    GET DIAGNOSTICS published_count = ROW_COUNT;
    
    RETURN published_count;
END;
$$;

-- Function to schedule a post for publishing
CREATE OR REPLACE FUNCTION schedule_post_publish(
    p_post_id UUID,
    p_scheduled_at TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update the post with the scheduled publish time
    UPDATE posts 
    SET 
        scheduled_publish_at = p_scheduled_at,
        updated_at = NOW()
    WHERE 
        id = p_post_id 
        AND status = 'draft';
    
    -- Return true if a row was updated
    RETURN FOUND;
END;
$$;

-- Function to cancel scheduled publishing
CREATE OR REPLACE FUNCTION cancel_scheduled_publish(
    p_post_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- Clear the scheduled publish time
    UPDATE posts 
    SET 
        scheduled_publish_at = NULL,
        updated_at = NOW()
    WHERE 
        id = p_post_id;
    
    -- Return true if a row was updated
    RETURN FOUND;
END;
$$;

-- Add comments for documentation
COMMENT ON COLUMN posts.scheduled_publish_at IS 'When this draft post should be automatically published';
COMMENT ON FUNCTION publish_scheduled_posts() IS 'Publishes all posts that are scheduled to be published and whose time has passed';
COMMENT ON FUNCTION schedule_post_publish(UUID, TIMESTAMPTZ) IS 'Schedules a draft post to be published at a specific time';
COMMENT ON FUNCTION cancel_scheduled_publish(UUID) IS 'Cancels the scheduled publishing for a post';
