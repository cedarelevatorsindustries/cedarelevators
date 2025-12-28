-- =====================================================
-- Migration: Simplify Quote Statuses for Cedar B2B
-- Description: Update quote statuses to match Cedar workflow
-- Date: January 2025
-- =====================================================

-- Drop existing constraint if exists
ALTER TABLE IF EXISTS quotes DROP CONSTRAINT IF EXISTS quotes_status_check;

-- Update quote status enum to simplified version
-- New statuses: pending, reviewing, approved, rejected, converted
COMMENT ON COLUMN quotes.status IS 'Quote status: pending → reviewing → approved → converted (or rejected)';

-- Add new constraint for simplified statuses
ALTER TABLE quotes ADD CONSTRAINT quotes_status_check 
  CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'converted'));

-- Migrate existing statuses to new simplified ones
UPDATE quotes SET status = 'reviewing' WHERE status = 'in_review';
UPDATE quotes SET status = 'reviewing' WHERE status = 'negotiation';
UPDATE quotes SET status = 'approved' WHERE status = 'revised';
UPDATE quotes SET status = 'approved' WHERE status = 'accepted';

-- Add conversion timestamp
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;
COMMENT ON COLUMN quotes.converted_at IS 'Timestamp when quote was converted to order';

-- Add approved_by field for audit
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS approved_by TEXT;
COMMENT ON COLUMN quotes.approved_by IS 'Clerk User ID of admin who approved the quote';

-- Add approved_at timestamp
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
COMMENT ON COLUMN quotes.approved_at IS 'Timestamp when quote was approved';

-- Add rejected_reason field
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS rejected_reason TEXT;
COMMENT ON COLUMN quotes.rejected_reason IS 'Reason for quote rejection (mandatory on reject)';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_priority ON quotes(priority);
CREATE INDEX IF NOT EXISTS idx_quotes_user_type ON quotes(user_type);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_approved_by ON quotes(approved_by);

-- Add comment for clarity
COMMENT ON TABLE quotes IS 'Customer quote requests with simplified Cedar B2B workflow';