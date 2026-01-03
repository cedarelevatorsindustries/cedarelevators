-- =====================================================
-- Cedar Elevators - Cart Locking for Checkout
-- =====================================================
-- This migration adds cart locking mechanism to prevent
-- concurrent modifications during checkout
-- Soft lock: Shows warning but doesn't block modifications
-- =====================================================

-- Add locking columns to carts table
ALTER TABLE carts ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;
ALTER TABLE carts ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
ALTER TABLE carts ADD COLUMN IF NOT EXISTS locked_by VARCHAR(255); -- Clerk user ID
ALTER TABLE carts ADD COLUMN IF NOT EXISTS lock_reason TEXT; -- 'checkout' | 'processing'

-- Create index for lock cleanup
CREATE INDEX IF NOT EXISTS idx_carts_locked 
  ON carts(locked_until) 
  WHERE locked_at IS NOT NULL;

-- =====================================================
-- Function: Lock Cart for Checkout
-- =====================================================
CREATE OR REPLACE FUNCTION lock_cart_for_checkout(
  p_cart_id UUID,
  p_clerk_user_id VARCHAR(255),
  p_duration_minutes INTEGER DEFAULT 5
)
RETURNS JSONB AS $$
DECLARE
  v_cart RECORD;
  v_result JSONB;
BEGIN
  -- Get cart with lock info
  SELECT * INTO v_cart
  FROM carts
  WHERE id = p_cart_id
    AND clerk_user_id = p_clerk_user_id
    AND status = 'active';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cart not found or not active'
    );
  END IF;
  
  -- Check if already locked by another session
  IF v_cart.locked_until IS NOT NULL AND v_cart.locked_until > NOW() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cart is currently locked',
      'locked_until', v_cart.locked_until,
      'is_locked', true
    );
  END IF;
  
  -- Lock the cart
  UPDATE carts
  SET 
    locked_at = NOW(),
    locked_until = NOW() + (p_duration_minutes || ' minutes')::INTERVAL,
    locked_by = p_clerk_user_id,
    lock_reason = 'checkout',
    updated_at = NOW()
  WHERE id = p_cart_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'locked_until', NOW() + (p_duration_minutes || ' minutes')::INTERVAL,
    'is_locked', true
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Function: Unlock Cart
-- =====================================================
CREATE OR REPLACE FUNCTION unlock_cart(
  p_cart_id UUID,
  p_clerk_user_id VARCHAR(255)
)
RETURNS JSONB AS $$
DECLARE
  v_cart RECORD;
BEGIN
  -- Get cart
  SELECT * INTO v_cart
  FROM carts
  WHERE id = p_cart_id
    AND clerk_user_id = p_clerk_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cart not found'
    );
  END IF;
  
  -- Unlock (anyone can unlock their own cart)
  UPDATE carts
  SET 
    locked_at = NULL,
    locked_until = NULL,
    locked_by = NULL,
    lock_reason = NULL,
    updated_at = NOW()
  WHERE id = p_cart_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'is_locked', false
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Function: Auto-unlock Expired Locks
-- =====================================================
CREATE OR REPLACE FUNCTION unlock_expired_carts()
RETURNS INTEGER AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  -- Unlock carts where lock has expired
  UPDATE carts
  SET 
    locked_at = NULL,
    locked_until = NULL,
    locked_by = NULL,
    lock_reason = NULL,
    updated_at = NOW()
  WHERE 
    locked_until IS NOT NULL
    AND locked_until < NOW();
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RETURN affected_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Function: Check if Cart is Locked
-- =====================================================
CREATE OR REPLACE FUNCTION is_cart_locked(
  p_cart_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_cart RECORD;
BEGIN
  SELECT locked_at, locked_until, locked_by, lock_reason
  INTO v_cart
  FROM carts
  WHERE id = p_cart_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cart not found'
    );
  END IF;
  
  -- Check if lock is still valid
  IF v_cart.locked_until IS NOT NULL AND v_cart.locked_until > NOW() THEN
    RETURN jsonb_build_object(
      'success', true,
      'is_locked', true,
      'locked_at', v_cart.locked_at,
      'locked_until', v_cart.locked_until,
      'locked_by', v_cart.locked_by,
      'lock_reason', v_cart.lock_reason
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'is_locked', false
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Verification
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'carts' AND column_name = 'locked_at'
  ) THEN
    RAISE EXCEPTION 'Migration failed: locked_at column not created';
  END IF;
  
  RAISE NOTICE 'Cart locking migration completed successfully';
END $$;
