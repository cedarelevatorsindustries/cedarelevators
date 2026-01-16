-- Add checkout enablement columns to quotes table

-- Add checkout_enabled column (default: false)
ALTER TABLE quotes 
ADD COLUMN checkout_enabled BOOLEAN DEFAULT false;

-- Add approved_pricing column for storing admin-approved prices
ALTER TABLE quotes
ADD COLUMN approved_pricing JSONB;

-- Create index for filtering quotes by checkout_enabled
CREATE INDEX idx_quotes_checkout_enabled ON quotes(checkout_enabled) WHERE checkout_enabled = true;

-- Add comments for documentation
COMMENT ON COLUMN quotes.checkout_enabled IS 'Whether this quote has been approved by admin and can proceed to checkout';
COMMENT ON COLUMN quotes.approved_pricing IS 'JSON object containing admin-approved pricing details for checkout';
