-- Add static OG image field to posts table
-- Migration: 007_add_og_image_field.sql

-- Add og_image_url field to store static OG images for social media sharing
ALTER TABLE posts ADD COLUMN og_image_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN posts.og_image_url IS 'Static OG image URL for social media sharing. If set, this takes priority over dynamic generation.';

-- Create index for efficient queries when checking for OG images
CREATE INDEX idx_posts_og_image ON posts(og_image_url) WHERE og_image_url IS NOT NULL;
