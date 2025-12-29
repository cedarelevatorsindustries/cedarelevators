-- =====================================================
-- Pre-Migration Fix for 003_add_verification_tables
-- =====================================================
-- This script renames user_id to clerk_user_id in existing verification_documents table
-- Run this BEFORE running 003_add_verification_tables.sql
-- =====================================================

-- Rename user_id to clerk_user_id in verification_documents table
ALTER TABLE verification_documents 
RENAME COLUMN user_id TO clerk_user_id;

-- If there are any indexes on user_id, they will be automatically renamed
-- If there are any RLS policies referencing user_id, we need to drop and recreate them

-- Check and drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'verification_documents' 
    AND policyname = 'Users read own verification_documents'
  ) THEN
    DROP POLICY "Users read own verification_documents" ON verification_documents;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'verification_documents' 
    AND policyname = 'Users upload own verification_documents'
  ) THEN
    DROP POLICY "Users upload own verification_documents" ON verification_documents;
  END IF;
END $$;

-- Add the missing columns that should have been in the original table
ALTER TABLE verification_documents ADD COLUMN IF NOT EXISTS business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE;
ALTER TABLE verification_documents ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE verification_documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Recreate the index with the correct column name
DROP INDEX IF EXISTS idx_verification_documents_customer;
CREATE INDEX IF NOT EXISTS idx_verification_documents_customer ON verification_documents(clerk_user_id);

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_verification_documents_profile ON verification_documents(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_verification_documents_status ON verification_documents(status);

COMMENT ON COLUMN verification_documents.clerk_user_id IS 'Clerk user ID of the customer who uploaded the document';
