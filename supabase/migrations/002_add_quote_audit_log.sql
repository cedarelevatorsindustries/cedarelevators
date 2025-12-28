-- =====================================================
-- Migration: Add Quote Audit Log Table
-- Description: Track all quote changes for Cedar B2B admin
-- Date: January 2025
-- =====================================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS quote_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  old_priority TEXT,
  new_priority TEXT,
  pricing_changed BOOLEAN DEFAULT false,
  old_total DECIMAL(10,2),
  new_total DECIMAL(10,2),
  admin_clerk_id TEXT,
  admin_name TEXT,
  admin_role TEXT,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraint for action types
ALTER TABLE quote_audit_log ADD CONSTRAINT quote_audit_log_action_type_check 
  CHECK (action_type IN (
    'created',
    'status_changed',
    'priority_changed',
    'pricing_updated',
    'item_pricing_updated',
    'approved',
    'rejected',
    'converted',
    'message_sent',
    'clarification_requested'
  ));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_quote_audit_log_quote_id ON quote_audit_log(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_audit_log_created_at ON quote_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_audit_log_admin ON quote_audit_log(admin_clerk_id);
CREATE INDEX IF NOT EXISTS idx_quote_audit_log_action ON quote_audit_log(action_type);

-- Add comment
COMMENT ON TABLE quote_audit_log IS 'Audit trail for all quote-related actions in Cedar admin';

-- Create function to automatically log status changes
CREATE OR REPLACE FUNCTION log_quote_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO quote_audit_log (
      quote_id,
      action_type,
      old_status,
      new_status,
      metadata
    ) VALUES (
      NEW.id,
      'status_changed',
      OLD.status,
      NEW.status,
      jsonb_build_object(
        'quote_number', NEW.quote_number,
        'changed_at', NOW()
      )
    );
  END IF;
  
  IF (OLD.priority IS DISTINCT FROM NEW.priority) THEN
    INSERT INTO quote_audit_log (
      quote_id,
      action_type,
      old_priority,
      new_priority,
      metadata
    ) VALUES (
      NEW.id,
      'priority_changed',
      OLD.priority,
      NEW.priority,
      jsonb_build_object(
        'quote_number', NEW.quote_number,
        'changed_at', NOW()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic logging
DROP TRIGGER IF EXISTS quote_status_change_trigger ON quotes;
CREATE TRIGGER quote_status_change_trigger
  AFTER UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION log_quote_status_change();