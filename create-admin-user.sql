-- ============================================================
-- CREATE ADMIN USER: likithkumaryammanuru@gmail.com
-- Password: likith@2001
-- ============================================================
-- IMPORTANT: Run this entire script in your Supabase SQL Editor
-- ============================================================

-- Step 1: Create the user account with Supabase Auth
-- Note: This creates the user directly in the auth.users table
-- The password will be hashed automatically

-- First, let's create the user
-- You'll need to do this through the Supabase Dashboard UI:
-- 1. Go to Authentication → Users
-- 2. Click "Add User"
-- 3. Email: likithkumaryammanuru@gmail.com
-- 4. Password: likith@2001
-- 5. Check "Auto Confirm User"
-- 6. Click "Create User"

-- OR if you prefer SQL, use this (requires extensions):
-- INSERT INTO auth.users (
--   instance_id,
--   id,
--   aud,
--   role,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   recovery_sent_at,
--   last_sign_in_at,
--   raw_app_meta_data,
--   raw_user_meta_data,
--   created_at,
--   updated_at,
--   confirmation_token,
--   email_change,
--   email_change_token_new,
--   recovery_token
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   gen_random_uuid(),
--   'authenticated',
--   'authenticated',
--   'likithkumaryammanuru@gmail.com',
--   crypt('likith@2001', gen_salt('bf')),
--   NOW(),
--   NOW(),
--   NOW(),
--   '{"provider":"email","providers":["email"],"is_admin":true}'::jsonb,
--   '{}'::jsonb,
--   NOW(),
--   NOW(),
--   '',
--   '',
--   '',
--   ''
-- );

-- ============================================================
-- Step 2: Grant Admin Privileges
-- ============================================================
-- After creating the user through the dashboard, run this:

UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb
WHERE email = 'likithkumaryammanuru@gmail.com';

-- ============================================================
-- Step 3: Verify the user was created and has admin privileges
-- ============================================================

SELECT
  id,
  email,
  email_confirmed_at,
  raw_app_meta_data->>'is_admin' as is_admin,
  raw_user_meta_data,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'likithkumaryammanuru@gmail.com';

-- Expected result: You should see is_admin = true

-- ============================================================
-- Step 4: Run RLS Policies (if not already done)
-- ============================================================

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true OR
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PRODUCTS TABLE POLICIES
DROP POLICY IF EXISTS "Public can read products" ON products;
CREATE POLICY "Public can read products"
  ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can insert products" ON products;
CREATE POLICY "Admin can insert products"
  ON products FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin can update products" ON products;
CREATE POLICY "Admin can update products"
  ON products FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin can delete products" ON products;
CREATE POLICY "Admin can delete products"
  ON products FOR DELETE USING (is_admin());

-- ORDERS TABLE POLICIES
DROP POLICY IF EXISTS "Public can insert orders" ON orders;
CREATE POLICY "Public can insert orders"
  ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can read all orders" ON orders;
CREATE POLICY "Admin can read all orders"
  ON orders FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admin can update orders" ON orders;
CREATE POLICY "Admin can update orders"
  ON orders FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin can delete orders" ON orders;
CREATE POLICY "Admin can delete orders"
  ON orders FOR DELETE USING (is_admin());

-- ANALYTICS TABLE POLICIES
DROP POLICY IF EXISTS "Public can insert analytics" ON analytics;
CREATE POLICY "Public can insert analytics"
  ON analytics FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can read analytics" ON analytics;
CREATE POLICY "Admin can read analytics"
  ON analytics FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admin can delete analytics" ON analytics;
CREATE POLICY "Admin can delete analytics"
  ON analytics FOR DELETE USING (is_admin());

-- ============================================================
-- Step 5: Final Verification
-- ============================================================

-- Check if is_admin function exists
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'is_admin';

-- List all admin users
SELECT
  email,
  raw_app_meta_data->>'is_admin' as is_admin,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
WHERE (raw_app_meta_data->>'is_admin')::boolean = true;

-- Check RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('products', 'orders', 'analytics')
ORDER BY tablename, policyname;

-- ============================================================
-- DONE!
-- ============================================================
-- Your admin user is now ready!
--
-- Login credentials:
-- Email: likithkumaryammanuru@gmail.com
-- Password: likith@2001
--
-- Admin URL: http://localhost:3000/admin
-- ============================================================
