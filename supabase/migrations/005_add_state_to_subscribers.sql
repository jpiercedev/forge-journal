-- Add state field to subscribers table
-- Migration: 005_add_state_to_subscribers.sql

-- Add state column to subscribers table
ALTER TABLE subscribers 
ADD COLUMN state TEXT;

-- Add comment to document the field
COMMENT ON COLUMN subscribers.state IS 'US state where the subscriber is located (required field)';

-- Update the updated_at trigger to include the new column
-- (The trigger should already exist from previous migrations)
