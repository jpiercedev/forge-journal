-- Add click tracking to ads table
-- Migration: 20241221000000_add_ad_click_tracking.sql

-- Add click_count column to ads table
ALTER TABLE ads ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;

-- Create index for better performance when querying by click count
CREATE INDEX IF NOT EXISTS idx_ads_click_count ON ads(click_count DESC);

-- Create ad_clicks table to track individual click events for analytics
CREATE TABLE IF NOT EXISTS ad_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_ip TEXT, -- Store IP for basic analytics (anonymized)
  user_agent TEXT, -- Store user agent for device/browser analytics
  referrer TEXT, -- Store referrer URL
  page_url TEXT -- Store the page where the ad was clicked
);

-- Create indexes for ad_clicks table
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad_id ON ad_clicks(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_clicked_at ON ad_clicks(clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad_id_date ON ad_clicks(ad_id, clicked_at DESC);

-- Create function to increment click count when a click is recorded
CREATE OR REPLACE FUNCTION increment_ad_click_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ads 
  SET click_count = click_count + 1 
  WHERE id = NEW.ad_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically increment click count
DROP TRIGGER IF EXISTS trigger_increment_ad_click_count ON ad_clicks;
CREATE TRIGGER trigger_increment_ad_click_count
  AFTER INSERT ON ad_clicks
  FOR EACH ROW
  EXECUTE FUNCTION increment_ad_click_count();

-- Update existing ads to have click_count = 0 if NULL
UPDATE ads SET click_count = 0 WHERE click_count IS NULL;
