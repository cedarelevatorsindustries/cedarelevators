/**
 * Database Migration for Activity Logs
 * Creates admin_activity_logs table
 */

-- Create admin_activity_logs table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX idx_activity_logs_action ON admin_activity_logs(action);
CREATE INDEX idx_activity_logs_resource_type ON admin_activity_logs(resource_type);
CREATE INDEX idx_activity_logs_created_at ON admin_activity_logs(created_at DESC);

-- Add RLS policies
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all logs
CREATE POLICY "Admins can view all activity logs" ON admin_activity_logs
  FOR SELECT
  USING (true);

-- Allow system to insert logs
CREATE POLICY "System can insert activity logs" ON admin_activity_logs
  FOR INSERT
  WITH CHECK (true);
