-- Notification Recipients Table
-- Migration: 004_notification_recipients.sql

-- Table to store email addresses that should receive notifications for submissions
CREATE TABLE notification_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    notification_types TEXT[] DEFAULT ARRAY['subscription', 'contact'], -- Types of notifications to receive
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_notification_recipients_active ON notification_recipients(is_active);
CREATE INDEX idx_notification_recipients_types ON notification_recipients USING GIN(notification_types);

-- Insert default recipients
INSERT INTO notification_recipients (email, name, notification_types, is_active) VALUES
('jason@theforgejournal.com', 'Jason Nelson', ARRAY['subscription', 'contact'], true),
('jpierce@gracewoodlands.com', 'Jonathan Pierce', ARRAY['subscription', 'contact'], true);

-- Enable RLS
ALTER TABLE notification_recipients ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Admin users can manage notification recipients" ON notification_recipients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_recipients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_notification_recipients_updated_at
    BEFORE UPDATE ON notification_recipients
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_recipients_updated_at();
