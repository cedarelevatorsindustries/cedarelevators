-- Migration: Align Store Settings
-- Description: Renames columns and adds missing fields to match Typescript definitions
-- Date: 2025-12-30

-- 1. Rename columns to match StoreSettings interface
ALTER TABLE store_settings 
RENAME COLUMN store_email TO support_email;

ALTER TABLE store_settings 
RENAME COLUMN store_phone TO support_phone;

ALTER TABLE store_settings 
RENAME COLUMN store_logo_url TO logo_url;

-- 2. Add missing columns
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS invoice_prefix TEXT NOT NULL DEFAULT 'CE',
ADD COLUMN IF NOT EXISTS legal_name TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS gst_number TEXT;

-- 3. Cleanup (optional)
-- We keep store_favicon_url as it might be useful later even if not in current interface
