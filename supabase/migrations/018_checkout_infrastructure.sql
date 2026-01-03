-- =====================================================
-- Cedar Elevators - Checkout Infrastructure
-- =====================================================
-- This migration adds all necessary tables and functions
-- for the complete checkout flow
-- =====================================================

-- =====================================================
-- 1. BUSINESS ADDRESSES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS business_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  clerk_user_id VARCHAR(255) NOT NULL,
  address_type TEXT NOT NULL CHECK (address_type IN ('shipping', 'billing', 'both')),
  
  -- Address fields
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  
  -- Additional fields
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- GST details (for billing addresses)
  gst_number VARCHAR(15),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_business_addresses_business_id ON business_addresses(business_id);
CREATE INDEX IF NOT EXISTS idx_business_addresses_user_id ON business_addresses(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_business_addresses_default ON business_addresses(business_id, is_default) WHERE is_default = true;

-- Ensure only one default address per business per type
CREATE UNIQUE INDEX IF NOT EXISTS idx_business_addresses_unique_default 
  ON business_addresses(business_id, address_type) 
  WHERE is_default = true;

-- =====================================================
-- 2. ENHANCE ORDERS TABLE
-- =====================================================

-- Add checkout-specific fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES business_profiles(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS checkout_snapshot JSONB DEFAULT '{}';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_snapshot JSONB DEFAULT '{}';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gst_percentage DECIMAL(5,2) DEFAULT 18.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cart_id UUID;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_orders_business_id ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Update payment_status enum to include 'pending_payment'
DO $$ 
BEGIN
  -- Drop the old constraint
  ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
  
  -- Add new constraint with additional status
  ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
    CHECK (payment_status IN ('pending_payment', 'pending', 'paid', 'failed', 'refunded'));
END $$;

-- =====================================================
-- 3. PAYMENT TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Razorpay details
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  
  -- Transaction details
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'initiated' 
    CHECK (status IN ('initiated', 'authorized', 'captured', 'failed', 'refunded')),
  
  -- Payment method details
  method TEXT, -- card, upi, netbanking, wallet
  provider TEXT, -- visa, mastercard, paytm, etc.
  
  -- Error handling
  error_code TEXT,
  error_description TEXT,
  error_source TEXT,
  
  -- Idempotency
  idempotency_key TEXT UNIQUE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  webhook_data JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  authorized_at TIMESTAMPTZ,
  captured_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_razorpay_order_id ON payment_transactions(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_razorpay_payment_id ON payment_transactions(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_idempotency ON payment_transactions(idempotency_key);

-- =====================================================
-- 4. DATABASE FUNCTIONS
-- =====================================================

-- Function: Generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  next_val BIGINT;
  order_num TEXT;
BEGIN
  next_val := nextval('order_number_seq');
  order_num := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(next_val::TEXT, 6, '0');
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Function: Validate checkout eligibility
CREATE OR REPLACE FUNCTION validate_checkout_eligibility(
  p_cart_id UUID,
  p_clerk_user_id VARCHAR(255)
)
RETURNS JSONB AS $$
DECLARE
  v_cart RECORD;
  v_business RECORD;
  v_item_count INTEGER;
  v_has_stock_issues BOOLEAN;
  v_result JSONB;
BEGIN
  -- Get cart details
  SELECT * INTO v_cart
  FROM carts
  WHERE id = p_cart_id 
    AND clerk_user_id = p_clerk_user_id
    AND status = 'active';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'eligible', false,
      'reason', 'cart_not_found',
      'message', 'Cart not found or not active'
    );
  END IF;
  
  -- Check if cart has items
  SELECT COUNT(*) INTO v_item_count
  FROM cart_items
  WHERE cart_id = p_cart_id;
  
  IF v_item_count = 0 THEN
    RETURN jsonb_build_object(
      'eligible', false,
      'reason', 'empty_cart',
      'message', 'Cart is empty'
    );
  END IF;
  
  -- Get business profile
  SELECT * INTO v_business
  FROM business_profiles
  WHERE clerk_user_id = p_clerk_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'eligible', false,
      'reason', 'not_business_user',
      'message', 'User does not have a business profile'
    );
  END IF;
  
  -- Check verification status
  IF v_business.verification_status != 'verified' THEN
    RETURN jsonb_build_object(
      'eligible', false,
      'reason', 'not_verified',
      'message', 'Business account is not verified',
      'verification_status', v_business.verification_status
    );
  END IF;
  
  -- Check stock availability for all cart items
  SELECT EXISTS(
    SELECT 1
    FROM cart_items ci
    LEFT JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = p_cart_id
      AND (p.stock_quantity < ci.quantity OR p.status != 'active')
  ) INTO v_has_stock_issues;
  
  IF v_has_stock_issues THEN
    RETURN jsonb_build_object(
      'eligible', false,
      'reason', 'stock_issues',
      'message', 'Some items are out of stock or unavailable'
    );
  END IF;
  
  -- All checks passed
  RETURN jsonb_build_object(
    'eligible', true,
    'business_id', v_business.id,
    'cart_id', p_cart_id,
    'item_count', v_item_count
  );
END;
$$ LANGUAGE plpgsql;

-- Function: Create checkout price snapshot
CREATE OR REPLACE FUNCTION create_checkout_snapshot(
  p_cart_id UUID,
  p_clerk_user_id VARCHAR(255)
)
RETURNS JSONB AS $$
DECLARE
  v_snapshot JSONB;
  v_items JSONB;
  v_subtotal DECIMAL(10,2) := 0;
  v_tax DECIMAL(10,2) := 0;
  v_shipping DECIMAL(10,2) := 0;
  v_total DECIMAL(10,2) := 0;
BEGIN
  -- Build items array with current prices
  SELECT jsonb_agg(
    jsonb_build_object(
      'product_id', ci.product_id,
      'variant_id', ci.variant_id,
      'title', ci.title,
      'quantity', ci.quantity,
      'unit_price', COALESCE(p.price, 0),
      'line_total', COALESCE(p.price, 0) * ci.quantity,
      'sku', p.sku,
      'snapshot_at', NOW()
    )
  ) INTO v_items
  FROM cart_items ci
  LEFT JOIN products p ON ci.product_id = p.id
  WHERE ci.cart_id = p_cart_id;
  
  -- Calculate totals
  SELECT 
    COALESCE(SUM(p.price * ci.quantity), 0)
  INTO v_subtotal
  FROM cart_items ci
  LEFT JOIN products p ON ci.product_id = p.id
  WHERE ci.cart_id = p_cart_id;
  
  -- Calculate tax (18% GST)
  v_tax := ROUND((v_subtotal + v_shipping) * 0.18, 2);
  
  -- Calculate total
  v_total := v_subtotal + v_tax + v_shipping;
  
  -- Build snapshot
  v_snapshot := jsonb_build_object(
    'cart_id', p_cart_id,
    'items', v_items,
    'pricing', jsonb_build_object(
      'subtotal', v_subtotal,
      'tax', v_tax,
      'gst_percentage', 18,
      'shipping', v_shipping,
      'discount', 0,
      'total', v_total
    ),
    'snapshot_at', NOW(),
    'currency', 'INR'
  );
  
  RETURN v_snapshot;
END;
$$ LANGUAGE plpgsql;

-- Function: Create order from cart
CREATE OR REPLACE FUNCTION create_order_from_cart(
  p_cart_id UUID,
  p_clerk_user_id VARCHAR(255),
  p_business_id UUID,
  p_shipping_address JSONB,
  p_billing_address JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_snapshot JSONB;
  v_subtotal DECIMAL(10,2);
  v_tax DECIMAL(10,2);
  v_shipping DECIMAL(10,2);
  v_total DECIMAL(10,2);
BEGIN
  -- Generate order number
  v_order_number := generate_order_number();
  
  -- Create price snapshot
  v_snapshot := create_checkout_snapshot(p_cart_id, p_clerk_user_id);
  
  -- Extract pricing from snapshot
  v_subtotal := (v_snapshot->'pricing'->>'subtotal')::DECIMAL(10,2);
  v_tax := (v_snapshot->'pricing'->>'tax')::DECIMAL(10,2);
  v_shipping := (v_snapshot->'pricing'->>'shipping')::DECIMAL(10,2);
  v_total := (v_snapshot->'pricing'->>'total')::DECIMAL(10,2);
  
  -- Create order
  INSERT INTO orders (
    order_number,
    clerk_user_id,
    business_id,
    cart_id,
    order_status,
    payment_status,
    subtotal,
    tax,
    gst_amount,
    gst_percentage,
    shipping_cost,
    discount,
    total_amount,
    currency_code,
    shipping_address,
    billing_address,
    checkout_snapshot
  ) VALUES (
    v_order_number,
    p_clerk_user_id,
    p_business_id,
    p_cart_id,
    'pending',
    'pending_payment',
    v_subtotal,
    v_tax,
    v_tax, -- GST amount same as tax
    18.00,
    v_shipping,
    0,
    v_total,
    'INR',
    p_shipping_address,
    COALESCE(p_billing_address, p_shipping_address),
    v_snapshot
  )
  RETURNING id INTO v_order_id;
  
  -- Create order items from cart items
  INSERT INTO order_items (
    order_id,
    product_id,
    variant_id,
    product_name,
    variant_sku,
    quantity,
    unit_price,
    total_price
  )
  SELECT
    v_order_id,
    ci.product_id,
    ci.variant_id,
    ci.title,
    p.sku,
    ci.quantity,
    COALESCE(p.price, 0),
    COALESCE(p.price, 0) * ci.quantity
  FROM cart_items ci
  LEFT JOIN products p ON ci.product_id = p.id
  WHERE ci.cart_id = p_cart_id;
  
  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Mark order as paid
CREATE OR REPLACE FUNCTION mark_order_as_paid(
  p_order_id UUID,
  p_razorpay_payment_id TEXT,
  p_razorpay_signature TEXT,
  p_payment_method TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_order RECORD;
  v_cart_id UUID;
BEGIN
  -- Get order details
  SELECT * INTO v_order
  FROM orders
  WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;
  
  -- Update order payment status
  UPDATE orders
  SET 
    payment_status = 'paid',
    razorpay_payment_id = p_razorpay_payment_id,
    payment_method = p_payment_method,
    paid_at = NOW(),
    order_status = 'confirmed',
    updated_at = NOW()
  WHERE id = p_order_id;
  
  -- Update payment transaction
  UPDATE payment_transactions
  SET 
    status = 'captured',
    razorpay_payment_id = p_razorpay_payment_id,
    razorpay_signature = p_razorpay_signature,
    captured_at = NOW(),
    updated_at = NOW()
  WHERE order_id = p_order_id
    AND razorpay_order_id = v_order.razorpay_order_id;
  
  -- Mark cart as converted
  IF v_order.cart_id IS NOT NULL THEN
    UPDATE carts
    SET 
      status = 'converted',
      completed_at = NOW(),
      updated_at = NOW()
    WHERE id = v_order.cart_id;
  END IF;
  
  -- Reduce inventory for all order items
  UPDATE products p
  SET 
    stock_quantity = p.stock_quantity - oi.quantity,
    updated_at = NOW()
  FROM order_items oi
  WHERE oi.order_id = p_order_id
    AND oi.product_id = p.id
    AND p.stock_quantity >= oi.quantity;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE business_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access business_addresses" 
  ON business_addresses FOR ALL TO service_role 
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access payment_transactions" 
  ON payment_transactions FOR ALL TO service_role 
  USING (true) WITH CHECK (true);

-- Users can read their own business addresses
CREATE POLICY "Users read own business_addresses" 
  ON business_addresses FOR SELECT TO authenticated 
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can insert their own business addresses
CREATE POLICY "Users insert own business_addresses" 
  ON business_addresses FOR INSERT TO authenticated 
  WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can update their own business addresses
CREATE POLICY "Users update own business_addresses" 
  ON business_addresses FOR UPDATE TO authenticated 
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can read their own payment transactions
CREATE POLICY "Users read own payment_transactions" 
  ON payment_transactions FOR SELECT TO authenticated 
  USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Update business_addresses updated_at
DROP TRIGGER IF EXISTS update_business_addresses_updated_at ON business_addresses;
CREATE TRIGGER update_business_addresses_updated_at
  BEFORE UPDATE ON business_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update payment_transactions updated_at
DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. VERIFICATION
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE 'Checkout infrastructure migration completed successfully';
  RAISE NOTICE 'Created tables: business_addresses, payment_transactions';
  RAISE NOTICE 'Created functions: validate_checkout_eligibility, create_checkout_snapshot, create_order_from_cart, mark_order_as_paid';
END $$;
