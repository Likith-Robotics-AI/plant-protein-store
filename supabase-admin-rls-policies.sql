-- Admin Row Level Security (RLS) Policies
-- Run this in your Supabase SQL Editor after setting up admin users

-- ============================================================
-- HELPER FUNCTION: Check if user is admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has admin flag in user_metadata or app_metadata
  RETURN (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true OR
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- PRODUCTS TABLE POLICIES
-- ============================================================

-- Allow public to read products
CREATE POLICY "Public can read products"
  ON products
  FOR SELECT
  USING (true);

-- Only admins can insert products
CREATE POLICY "Admin can insert products"
  ON products
  FOR INSERT
  WITH CHECK (is_admin());

-- Only admins can update products
CREATE POLICY "Admin can update products"
  ON products
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Only admins can delete products
CREATE POLICY "Admin can delete products"
  ON products
  FOR DELETE
  USING (is_admin());

-- ============================================================
-- ORDERS TABLE POLICIES
-- ============================================================

-- Public can insert orders (create new orders)
CREATE POLICY "Public can insert orders"
  ON orders
  FOR INSERT
  WITH CHECK (true);

-- Only admins can read all orders
CREATE POLICY "Admin can read all orders"
  ON orders
  FOR SELECT
  USING (is_admin());

-- Only admins can update orders (change status, etc.)
CREATE POLICY "Admin can update orders"
  ON orders
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Only admins can delete orders
CREATE POLICY "Admin can delete orders"
  ON orders
  FOR DELETE
  USING (is_admin());

-- ============================================================
-- ANALYTICS TABLE POLICIES
-- ============================================================

-- Public can insert analytics events
CREATE POLICY "Public can insert analytics"
  ON analytics
  FOR INSERT
  WITH CHECK (true);

-- Only admins can read analytics
CREATE POLICY "Admin can read analytics"
  ON analytics
  FOR SELECT
  USING (is_admin());

-- Only admins can delete analytics (cleanup old data)
CREATE POLICY "Admin can delete analytics"
  ON analytics
  FOR DELETE
  USING (is_admin());

-- ============================================================
-- DISCOUNT CODES TABLE POLICIES
-- (if you have this table, uncomment below)
-- ============================================================

-- Only admins can insert discount codes
-- CREATE POLICY "Admin can insert discount codes"
--   ON discount_codes
--   FOR INSERT
--   WITH CHECK (is_admin());

-- Public can read active discount codes (for validation)
-- CREATE POLICY "Public can read active discount codes"
--   ON discount_codes
--   FOR SELECT
--   USING (is_active = true);

-- Only admins can read all discount codes
-- CREATE POLICY "Admin can read all discount codes"
--   ON discount_codes
--   FOR SELECT
--   USING (is_admin());

-- Only admins can update discount codes
-- CREATE POLICY "Admin can update discount codes"
--   ON discount_codes
--   FOR UPDATE
--   USING (is_admin())
--   WITH CHECK (is_admin());

-- Only admins can delete discount codes
-- CREATE POLICY "Admin can delete discount codes"
--   ON discount_codes
--   FOR DELETE
--   USING (is_admin());

-- ============================================================
-- EMAIL SUBSCRIPTIONS TABLE POLICIES
-- (if you have this table, uncomment below)
-- ============================================================

-- Public can insert email subscriptions
-- CREATE POLICY "Public can insert email subscriptions"
--   ON email_subscriptions
--   FOR INSERT
--   WITH CHECK (true);

-- Only admins can read all email subscriptions
-- CREATE POLICY "Admin can read all email subscriptions"
--   ON email_subscriptions
--   FOR SELECT
--   USING (is_admin());

-- Only admins can update email subscriptions
-- CREATE POLICY "Admin can update email subscriptions"
--   ON email_subscriptions
--   FOR UPDATE
--   USING (is_admin())
--   WITH CHECK (is_admin());

-- Only admins can delete email subscriptions
-- CREATE POLICY "Admin can delete email subscriptions"
--   ON email_subscriptions
--   FOR DELETE
--   USING (is_admin());

-- ============================================================
-- NOTES
-- ============================================================
-- After running this script:
-- 1. Create admin users using supabase-admin-setup.sql
-- 2. Test admin functionality in the admin panel
-- 3. Verify RLS policies are working by trying to access data
--    as both admin and non-admin users
