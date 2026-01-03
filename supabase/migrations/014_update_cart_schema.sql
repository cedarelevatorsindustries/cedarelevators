-- =====================================================
-- Cedar Elevators - Cart Schema Update
-- =====================================================
-- This migration updates the cart system to support:
-- - Profile-scoped carts (individual vs business)
-- - One active cart per user profile
-- - Cart abandonment tracking
-- - Zero data loss across profile switches
-- =====================================================

-- Add new columns to carts table
ALTER TABLE carts ADD COLUMN IF NOT EXISTS profile_type TEXT 
  CHECK (profile_type IN ('individual', 'business'));

ALTER TABLE carts ADD COLUMN IF NOT EXISTS business_id UUID 
  REFERENCES business_profiles(id) ON DELETE CASCADE;

ALTER TABLE carts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
  CHECK (status IN ('active', 'converted', 'abandoned'));

ALTER TABLE carts ADD COLUMN IF NOT EXISTS abandoned_at TIMESTAMPTZ;

-- Update existing carts to have default profile_type
UPDATE carts SET profile_type = 'individual' WHERE profile_type IS NULL;

-- Make profile_type NOT NULL after setting defaults
ALTER TABLE carts ALTER COLUMN profile_type SET NOT NULL;

-- Create index for fast cart lookups by user and profile
CREATE INDEX IF NOT EXISTS idx_carts_user_profile 
  ON carts(clerk_user_id, profile_type, business_id) 
  WHERE status = 'active';

-- Create index for abandoned cart cleanup
CREATE INDEX IF NOT EXISTS idx_carts_abandoned 
  ON carts(abandoned_at) 
  WHERE status = 'abandoned';

-- Create unique constraint: one active cart per user profile
CREATE UNIQUE INDEX IF NOT EXISTS idx_carts_unique_active_profile 
  ON carts(clerk_user_id, profile_type, COALESCE(business_id::text, 'null'))
  WHERE status = 'active' AND clerk_user_id IS NOT NULL;

-- =====================================================
-- Function: Mark old carts as abandoned
-- =====================================================
CREATE OR REPLACE FUNCTION mark_abandoned_carts()
RETURNS INTEGER AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  -- Mark carts older than 30 days as abandoned
  UPDATE carts
  SET 
    status = 'abandoned',
    abandoned_at = NOW(),
    updated_at = NOW()
  WHERE 
    status = 'active'
    AND updated_at < NOW() - INTERVAL '30 days'
    AND clerk_user_id IS NOT NULL; -- Don't abandon guest carts automatically
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RETURN affected_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Function: Get or create active cart
-- =====================================================
CREATE OR REPLACE FUNCTION get_or_create_cart(
  p_clerk_user_id VARCHAR(255),
  p_profile_type TEXT,
  p_business_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_cart_id UUID;
BEGIN
  -- Try to find existing active cart
  SELECT id INTO v_cart_id
  FROM carts
  WHERE 
    clerk_user_id = p_clerk_user_id
    AND profile_type = p_profile_type
    AND (business_id = p_business_id OR (business_id IS NULL AND p_business_id IS NULL))
    AND status = 'active';
  
  -- If not found, create new cart
  IF v_cart_id IS NULL THEN
    INSERT INTO carts (clerk_user_id, profile_type, business_id, status)
    VALUES (p_clerk_user_id, p_profile_type, p_business_id, 'active')
    RETURNING id INTO v_cart_id;
  END IF;
  
  RETURN v_cart_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Function: Switch cart context (profile switching)
-- =====================================================
CREATE OR REPLACE FUNCTION switch_cart_context(
  p_clerk_user_id VARCHAR(255),
  p_new_profile_type TEXT,
  p_new_business_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_new_cart_id UUID;
BEGIN
  -- Get or create cart for new context
  SELECT get_or_create_cart(p_clerk_user_id, p_new_profile_type, p_new_business_id)
  INTO v_new_cart_id;
  
  RETURN v_new_cart_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Update RLS Policies for new cart structure
-- =====================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users read own cart" ON carts;
DROP POLICY IF EXISTS "Users manage own cart_items" ON cart_items;

-- Users can read their own carts (all profiles)
CREATE POLICY "Users read own carts" ON carts 
  FOR SELECT TO authenticated 
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can manage their own active carts
CREATE POLICY "Users update own active carts" ON carts 
  FOR UPDATE TO authenticated 
  USING (
    clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    AND status = 'active'
  );

-- Users can insert their own carts
CREATE POLICY "Users insert own carts" ON carts 
  FOR INSERT TO authenticated 
  WITH CHECK (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can manage cart items for their own carts
CREATE POLICY "Users manage own cart_items" ON cart_items 
  FOR ALL TO authenticated 
  USING (
    cart_id IN (
      SELECT id FROM carts 
      WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check if new columns exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'carts' AND column_name = 'profile_type'
  ) THEN
    RAISE EXCEPTION 'Migration failed: profile_type column not created';
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'carts' AND column_name = 'status'
  ) THEN
    RAISE EXCEPTION 'Migration failed: status column not created';
  END IF;
END $$;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE 'Cart schema migration completed successfully';
END $$;
