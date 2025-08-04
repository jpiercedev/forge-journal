-- Add video fields to posts table
-- Migration: 004_add_video_fields.sql

-- Add video_url field to store video URLs from any platform
ALTER TABLE posts ADD COLUMN video_url TEXT;

-- Add hide_featured_image field to control whether to show featured image when video is present
ALTER TABLE posts ADD COLUMN hide_featured_image BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN posts.video_url IS 'URL for embedded video from YouTube, Vimeo, or other platforms';
COMMENT ON COLUMN posts.hide_featured_image IS 'Whether to hide the featured image when a video is present';
