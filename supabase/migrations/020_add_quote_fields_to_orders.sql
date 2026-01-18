-- Add quote reference fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quote_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quote_number VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(20);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_quote_id ON orders(quote_id);

-- Add comment
COMMENT ON COLUMN orders.quote_id IS 'Reference to the quote if order was created from a quote';
COMMENT ON COLUMN orders.quote_number IS 'Human-readable quote number for reference';
COMMENT ON COLUMN orders.guest_phone IS 'Guest phone number for contact';
