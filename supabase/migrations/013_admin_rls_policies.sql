-- =====================================================
-- Migration: Admin RLS Policies
-- Description: Enable write access for authenticated admins
-- =====================================================

-- 1. Helper function to check if user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_profiles
    WHERE user_id = auth.uid()
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Policies for Categories
CREATE POLICY "Admins can insert categories" ON categories 
  FOR INSERT TO authenticated 
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update categories" ON categories 
  FOR UPDATE TO authenticated 
  USING (is_admin());

CREATE POLICY "Admins can delete categories" ON categories 
  FOR DELETE TO authenticated 
  USING (is_admin());

-- 3. Policies for Products
CREATE POLICY "Admins can insert products" ON products 
  FOR INSERT TO authenticated 
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update products" ON products 
  FOR UPDATE TO authenticated 
  USING (is_admin());

CREATE POLICY "Admins can delete products" ON products 
  FOR DELETE TO authenticated 
  USING (is_admin());

-- 4. Policies for Product Variants
CREATE POLICY "Admins can insert product_variants" ON product_variants 
  FOR INSERT TO authenticated 
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update product_variants" ON product_variants 
  FOR UPDATE TO authenticated 
  USING (is_admin());

CREATE POLICY "Admins can delete product_variants" ON product_variants 
  FOR DELETE TO authenticated 
  USING (is_admin());

-- 5. Policies for Business Profiles (Admins need to review/verify)
CREATE POLICY "Admins can read all business_profiles" ON business_profiles 
  FOR SELECT TO authenticated 
  USING (is_admin());

CREATE POLICY "Admins can update business_profiles" ON business_profiles 
  FOR UPDATE TO authenticated 
  USING (is_admin());

-- 6. Policies for Business Documents
CREATE POLICY "Admins can read all business_documents" ON business_documents 
  FOR SELECT TO authenticated 
  USING (is_admin());

CREATE POLICY "Admins can update business_documents" ON business_documents 
  FOR UPDATE TO authenticated 
  USING (is_admin());
