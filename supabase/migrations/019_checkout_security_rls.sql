-- =====================================================
-- Cedar Elevators - Checkout Security Enhancement
-- RLS (Row Level Security) Policies
-- =====================================================
-- This migration adds comprehensive RLS policies for
-- checkout-related tables to prevent unauthorized access
-- =====================================================

-- =====================================================
-- 1. ENABLE RLS ON CHECKOUT TABLES
-- =====================================================

-- Enable RLS on business_addresses
ALTER TABLE business_addresses ENABLE ROW LEVEL SECURITY;

-- Enable RLS on orders (if not already enabled)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Enable RLS on payment_transactions
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. BUSINESS ADDRESSES RLS POLICIES
-- =====================================================

-- Policy: Users can view their own addresses
CREATE POLICY "Users can view their own business addresses"
  ON business_addresses
  FOR SELECT
  USING (clerk_user_id = current_setting('app.clerk_user_id', true));

-- Policy: Users can insert their own addresses
CREATE POLICY "Users can insert their own business addresses"
  ON business_addresses
  FOR INSERT
  WITH CHECK (clerk_user_id = current_setting('app.clerk_user_id', true));

-- Policy: Users can update their own addresses
CREATE POLICY "Users can update their own business addresses"
  ON business_addresses
  FOR UPDATE
  USING (clerk_user_id = current_setting('app.clerk_user_id', true))
  WITH CHECK (clerk_user_id = current_setting('app.clerk_user_id', true));

-- Policy: Users can delete (soft delete) their own addresses
CREATE POLICY "Users can delete their own business addresses"
  ON business_addresses
  FOR DELETE
  USING (clerk_user_id = current_setting('app.clerk_user_id', true));

-- =====================================================
-- 3. ORDERS RLS POLICIES
-- =====================================================

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;

-- Policy: Users can view their own orders
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  USING (clerk_user_id = current_setting('app.clerk_user_id', true));

-- Policy: Users can insert their own orders
CREATE POLICY "Users can insert their own orders"
  ON orders
  FOR INSERT
  WITH CHECK (clerk_user_id = current_setting('app.clerk_user_id', true));

-- Policy: Users can update only pending_payment orders
CREATE POLICY "Users can update their pending orders"
  ON orders
  FOR UPDATE
  USING (
    clerk_user_id = current_setting('app.clerk_user_id', true)
    AND payment_status = 'pending_payment'
  )
  WITH CHECK (
    clerk_user_id = current_setting('app.clerk_user_id', true)
  );

-- =====================================================
-- 4. PAYMENT TRANSACTIONS RLS POLICIES
-- =====================================================

-- Policy: Users can view payment transactions for their orders
CREATE POLICY "Users can view their payment transactions"
  ON payment_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payment_transactions.order_id
        AND orders.clerk_user_id = current_setting('app.clerk_user_id', true)
    )
  );

-- Policy: System can insert payment transactions
CREATE POLICY "System can insert payment transactions"
  ON payment_transactions
  FOR INSERT
  WITH CHECK (true); -- Webhooks need to insert without user context

-- Policy: System can update payment transactions
CREATE POLICY "System can update payment transactions"
  ON payment_transactions
  FOR UPDATE
  USING (true); -- Webhooks need to update without user context

-- =====================================================
-- 5. ADDITIONAL SECURITY CONSTRAINTS
-- =====================================================

-- Add check constraint to prevent negative amounts
ALTER TABLE payment_transactions
  ADD CONSTRAINT payment_transactions_amount_positive
  CHECK (amount > 0);

-- Add check constraint to ensure valid postal codes
ALTER TABLE business_addresses
  ADD CONSTRAINT business_addresses_postal_code_valid
  CHECK (postal_code ~ '^\d{6}$');

-- Add check constraint to ensure valid phone numbers (10 digits)
ALTER TABLE business_addresses
  ADD CONSTRAINT business_addresses_phone_valid
  CHECK (contact_phone ~ '^\d{10}$');

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for RLS policy performance on orders
CREATE INDEX IF NOT EXISTS idx_orders_clerk_user_payment_status
  ON orders(clerk_user_id, payment_status);

-- Index for RLS policy performance on payment_transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_lookup
  ON payment_transactions(order_id);

-- =====================================================
-- 7. FUNCTION: Prevent order modification after payment
-- =====================================================

CREATE OR REPLACE FUNCTION prevent_order_modification_after_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent modifications to paid orders (except by system)
  IF OLD.payment_status IN ('paid', 'refunded') THEN
    -- Allow updates to order_status and tracking info even after payment
    IF (
      NEW.payment_status != OLD.payment_status OR
      NEW.subtotal != OLD.subtotal OR
      NEW.tax != OLD.tax OR
      NEW.total_amount != OLD.total_amount
    ) THEN
      RAISE EXCEPTION 'Cannot modify payment details of paid orders';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to orders table
DROP TRIGGER IF EXISTS prevent_paid_order_modification ON orders;
CREATE TRIGGER prevent_paid_order_modification
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION prevent_order_modification_after_payment();

-- =====================================================
-- 8. FUNCTION: Validate cart ownership before order creation
-- =====================================================

CREATE OR REPLACE FUNCTION validate_cart_before_order()
RETURNS TRIGGER AS $$
DECLARE
  v_cart_user_id VARCHAR(255);
BEGIN
  -- Get the cart's user ID
  SELECT clerk_user_id INTO v_cart_user_id
  FROM carts
  WHERE id = NEW.cart_id;
  
  -- Ensure cart belongs to the same user
  IF v_cart_user_id != NEW.clerk_user_id THEN
    RAISE EXCEPTION 'Cart ownership mismatch. Cannot create order.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to orders table
DROP TRIGGER IF EXISTS validate_cart_ownership ON orders;
CREATE TRIGGER validate_cart_ownership
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION validate_cart_before_order();

-- =====================================================
-- 9. AUDIT LOGGING (Optional but recommended)
-- =====================================================

-- Create audit log table for sensitive operations
CREATE TABLE IF NOT EXISTS checkout_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id UUID NOT NULL,
  clerk_user_id VARCHAR(255),
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record
  ON checkout_audit_log(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_created
  ON checkout_audit_log(clerk_user_id, created_at DESC);

-- Function to log order changes
CREATE OR REPLACE FUNCTION log_order_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.payment_status != NEW.payment_status) THEN
    INSERT INTO checkout_audit_log (
      table_name,
      operation,
      record_id,
      clerk_user_id,
      old_data,
      new_data
    ) VALUES (
      'orders',
      'UPDATE',
      NEW.id,
      NEW.clerk_user_id,
      jsonb_build_object('payment_status', OLD.payment_status),
      jsonb_build_object('payment_status', NEW.payment_status)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach audit trigger to orders
DROP TRIGGER IF EXISTS audit_order_changes ON orders;
CREATE TRIGGER audit_order_changes
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_changes();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Grant necessary permissions (if using service role)
-- Note: Adjust these based on your specific setup
GRANT SELECT, INSERT, UPDATE ON business_addresses TO authenticated;
GRANT SELECT, INSERT, UPDATE ON orders TO authenticated;
GRANT SELECT ON payment_transactions TO authenticated;

-- Comment for tracking
COMMENT ON TABLE business_addresses IS 'Secure business addresses with RLS enabled';
COMMENT ON TABLE orders IS 'Orders with RLS and audit logging enabled';
COMMENT ON TABLE payment_transactions IS 'Payment transactions with RLS enabled';
