-- =====================================================
-- Phase 2: Customer Verification System
-- =====================================================
-- This migration adds verification infrastructure
-- =====================================================

-- =====================================================
-- VERIFICATION DOCUMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) NOT NULL,
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL 
    CHECK (document_type IN ('gst_certificate', 'pan_card', 'business_license', 'incorporation_certificate', 'address_proof', 'other')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by VARCHAR(255), -- admin clerk_user_id
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_documents_customer ON verification_documents(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_verification_documents_profile ON verification_documents(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_verification_documents_status ON verification_documents(status);

-- =====================================================
-- VERIFICATION AUDIT LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS verification_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_clerk_id VARCHAR(255) NOT NULL,
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL 
    CHECK (action_type IN ('documents_submitted', 'verification_requested', 'document_approved', 'document_rejected', 'verification_approved', 'verification_rejected', 'more_documents_requested')),
  old_status TEXT,
  new_status TEXT,
  admin_clerk_id VARCHAR(255),
  admin_name TEXT,
  admin_role TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_audit_customer ON verification_audit_log(customer_clerk_id);
CREATE INDEX IF NOT EXISTS idx_verification_audit_profile ON verification_audit_log(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_verification_audit_created ON verification_audit_log(created_at);

-- =====================================================
-- CUSTOMER NOTES TABLE (INTERNAL ADMIN NOTES)
-- =====================================================

CREATE TABLE IF NOT EXISTS customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_clerk_id VARCHAR(255) NOT NULL,
  admin_clerk_id VARCHAR(255) NOT NULL,
  admin_name TEXT,
  note_text TEXT NOT NULL,
  is_important BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_notes_customer ON customer_notes(customer_clerk_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_created ON customer_notes(created_at DESC);

-- =====================================================
-- ENHANCE BUSINESS PROFILES TABLE
-- =====================================================

-- Add additional verification fields if they don't exist
DO $$ 
BEGIN
  -- Add verification_requested_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_profiles' 
    AND column_name = 'verification_requested_at'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN verification_requested_at TIMESTAMPTZ;
  END IF;

  -- Add documents_count if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_profiles' 
    AND column_name = 'documents_count'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN documents_count INTEGER DEFAULT 0;
  END IF;

  -- Add rejected_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_profiles' 
    AND column_name = 'rejected_at'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN rejected_at TIMESTAMPTZ;
  END IF;

  -- Add last_verification_check_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_profiles' 
    AND column_name = 'last_verification_check_at'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN last_verification_check_at TIMESTAMPTZ;
  END IF;
END $$;

-- =====================================================
-- ENHANCE CUSTOMER_META TABLE
-- =====================================================

-- Add account_type and verification flags
DO $$ 
BEGIN
  -- Add account_type (replaces user_type for consistency)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customer_meta' 
    AND column_name = 'account_type'
  ) THEN
    ALTER TABLE customer_meta ADD COLUMN account_type TEXT 
      CHECK (account_type IN ('individual', 'business')) DEFAULT 'individual';
  END IF;

  -- Add business_verified flag
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customer_meta' 
    AND column_name = 'business_verified'
  ) THEN
    ALTER TABLE customer_meta ADD COLUMN business_verified BOOLEAN DEFAULT false;
  END IF;

  -- Add registration_date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customer_meta' 
    AND column_name = 'registration_date'
  ) THEN
    ALTER TABLE customer_meta ADD COLUMN registration_date TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update verification_documents updated_at
DROP TRIGGER IF EXISTS update_verification_documents_updated_at ON verification_documents;
CREATE TRIGGER update_verification_documents_updated_at
  BEFORE UPDATE ON verification_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update customer_notes updated_at
DROP TRIGGER IF EXISTS update_customer_notes_updated_at ON customer_notes;
CREATE TRIGGER update_customer_notes_updated_at
  BEFORE UPDATE ON customer_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update documents_count in business_profiles
CREATE OR REPLACE FUNCTION update_business_documents_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE business_profiles
    SET documents_count = documents_count + 1
    WHERE id = NEW.business_profile_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE business_profiles
    SET documents_count = GREATEST(documents_count - 1, 0)
    WHERE id = OLD.business_profile_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update documents_count
DROP TRIGGER IF EXISTS trigger_update_documents_count ON verification_documents;
CREATE TRIGGER trigger_update_documents_count
  AFTER INSERT OR DELETE ON verification_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_business_documents_count();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role full access verification_documents" 
  ON verification_documents FOR ALL TO service_role 
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access verification_audit_log" 
  ON verification_audit_log FOR ALL TO service_role 
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access customer_notes" 
  ON customer_notes FOR ALL TO service_role 
  USING (true) WITH CHECK (true);

-- Users can read their own verification documents
CREATE POLICY "Users read own verification_documents" 
  ON verification_documents FOR SELECT TO authenticated 
  USING (customer_clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can upload their own verification documents
CREATE POLICY "Users upload own verification_documents" 
  ON verification_documents FOR INSERT TO authenticated 
  WITH CHECK (customer_clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can read their own verification audit log
CREATE POLICY "Users read own verification_audit_log" 
  ON verification_audit_log FOR SELECT TO authenticated 
  USING (customer_clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- =====================================================
-- SEED DATA (OPTIONAL)
-- =====================================================

-- Uncomment to verify tables were created
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('verification_documents', 'verification_audit_log', 'customer_notes');
