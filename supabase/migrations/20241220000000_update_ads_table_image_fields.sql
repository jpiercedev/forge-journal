-- Update ads table to use image_url and image_alt instead of background_image_url
-- This migration renames the column and adds the image_alt field

-- Rename background_image_url to image_url
ALTER TABLE ads RENAME COLUMN background_image_url TO image_url;

-- Add image_alt column
ALTER TABLE ads ADD COLUMN IF NOT EXISTS image_alt TEXT;

-- Update existing records to have image_alt values
UPDATE ads SET image_alt = title || ' Image' WHERE image_alt IS NULL AND image_url IS NOT NULL;
