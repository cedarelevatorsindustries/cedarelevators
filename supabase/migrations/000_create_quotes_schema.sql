-- =====================================================
-- Migration: Create Complete Quotes Schema
-- Description: All quote-related tables for Cedar B2B
-- Date: January 2025
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- QUOTES TABLE
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS quote_number_seq START WITH 2025001;

CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number VARCHAR(50) UNIQUE NOT NULL DEFAULT ('Q-' || nextval('quote_number_seq')::TEXT),
  
  -- Customer Info
  clerk_user_id VARCHAR(255), -- NULL for guest quotes
  guest_name VARCHAR(255),
  guest_email VARCHAR(255),
  guest_phone VARCHAR(50),
  
  -- Quote Classification
  user_type TEXT NOT NULL CHECK (user_type IN ('guest', 'individual', 'business', 'verified')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'converted')),
  priority TEXT NOT NULL DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high')),
  
  -- Company Details (for business quotes)
  company_details JSONB,
  
  -- Quote Content
  notes TEXT,
  bulk_pricing_requested BOOLEAN DEFAULT false,
  template_id UUID, -- Reference to quote template if used
  
  -- Pricing
  subtotal DECIMAL(10,2) DEFAULT 0,
  discount_total DECIMAL(10,2) DEFAULT 0,
  tax_total DECIMAL(10,2) DEFAULT 0,
  estimated_total DECIMAL(10,2) DEFAULT 0,
  
  -- Admin Response
  admin_notes TEXT,
  admin_response_at TIMESTAMPTZ,
  responded_by VARCHAR(255), -- Clerk ID of admin who responded
  
  -- Validity
  valid_until TIMESTAMPTZ, -- Expiry date for accepted quotes
  
  -- Conversion
  converted_order_id UUID, -- Reference to order if converted
  converted_at TIMESTAMPTZ,
  
  -- Approval
  approved_by VARCHAR(255), -- Clerk ID of admin who approved
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quotes_clerk_user_id ON quotes(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_guest_email ON quotes(guest_email);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_priority ON quotes(priority);
CREATE INDEX IF NOT EXISTS idx_quotes_user_type ON quotes(user_type);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_approved_by ON quotes(approved_by);

COMMENT ON TABLE quotes IS 'Customer quote requests with Cedar B2B workflow';

-- =====================================================
-- QUOTE ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  
  -- Product References
  product_id UUID, -- Can be NULL for generic inquiries
  variant_id UUID,
  
  -- Product Info (snapshot at time of quote)
  product_name TEXT NOT NULL,
  product_sku VARCHAR(100),
  product_thumbnail TEXT,
  
  -- Quantity and Pricing
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) DEFAULT 0, -- Set by admin during review
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  total_price DECIMAL(10,2) DEFAULT 0,
  
  -- Bulk Pricing
  bulk_pricing_requested BOOLEAN DEFAULT false,
  
  -- Item Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_product_id ON quote_items(product_id);

COMMENT ON TABLE quote_items IS 'Individual items in a quote request';

-- =====================================================
-- QUOTE MESSAGES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS quote_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  
  -- Sender Info
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
  sender_id VARCHAR(255), -- Clerk User ID
  sender_name VARCHAR(255),
  
  -- Message Content
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Admin-only notes
  
  -- Read Status
  read_at TIMESTAMPTZ,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_messages_quote_id ON quote_messages(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_messages_created_at ON quote_messages(created_at DESC);

COMMENT ON TABLE quote_messages IS 'Communication between customer and admin on quotes';

-- =====================================================
-- QUOTE ATTACHMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS quote_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  
  -- File Info
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  
  -- Timestamp
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_attachments_quote_id ON quote_attachments(quote_id);

COMMENT ON TABLE quote_attachments IS 'File attachments for quote requests (specs, drawings, etc.)';

-- =====================================================
-- QUOTE BASKETS TABLE (Temporary Storage)
-- =====================================================

CREATE TABLE IF NOT EXISTS quote_baskets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL, -- Only for logged-in users
  
  -- Basket Data (JSONB for flexibility)
  items JSONB DEFAULT '[]',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_baskets_clerk_user_id ON quote_baskets(clerk_user_id);

COMMENT ON TABLE quote_baskets IS 'Temporary storage for quote items before submission';

-- =====================================================
-- QUOTE TEMPLATES TABLE (Verified Business Only)
-- =====================================================

CREATE TABLE IF NOT EXISTS quote_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) NOT NULL,
  
  -- Template Info
  name TEXT NOT NULL,
  description TEXT,
  
  -- Template Data
  items JSONB NOT NULL DEFAULT '[]',
  default_notes TEXT,
  
  -- Usage Stats
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_templates_clerk_user_id ON quote_templates(clerk_user_id);

COMMENT ON TABLE quote_templates IS 'Reusable quote templates for verified business users';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at column on quotes
DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at column on quote_baskets
DROP TRIGGER IF EXISTS update_quote_baskets_updated_at ON quote_baskets;
CREATE TRIGGER update_quote_baskets_updated_at
  BEFORE UPDATE ON quote_baskets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at column on quote_templates
DROP TRIGGER IF EXISTS update_quote_templates_updated_at ON quote_templates;
CREATE TRIGGER update_quote_templates_updated_at
  BEFORE UPDATE ON quote_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_baskets ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_templates ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access quotes" ON quotes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access quote_items" ON quote_items FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access quote_messages" ON quote_messages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access quote_attachments" ON quote_attachments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access quote_baskets" ON quote_baskets FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access quote_templates" ON quote_templates FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Users can read their own quotes
CREATE POLICY "Users read own quotes" ON quotes FOR SELECT TO authenticated 
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can read their own quote items
CREATE POLICY "Users read own quote_items" ON quote_items FOR SELECT TO authenticated 
  USING (quote_id IN (SELECT id FROM quotes WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'));

-- Users can send messages on their quotes
CREATE POLICY "Users manage messages on own quotes" ON quote_messages FOR ALL TO authenticated 
  USING (quote_id IN (SELECT id FROM quotes WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'));

-- Users can view attachments on their quotes
CREATE POLICY "Users read attachments on own quotes" ON quote_attachments FOR SELECT TO authenticated 
  USING (quote_id IN (SELECT id FROM quotes WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'));

-- Users can manage their own quote basket
CREATE POLICY "Users manage own quote_basket" ON quote_baskets FOR ALL TO authenticated 
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can manage their own templates
CREATE POLICY "Users manage own templates" ON quote_templates FOR ALL TO authenticated 
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Anonymous (guest) can create quotes (handled by service role in server actions)
