-- Admin User Setup Script
-- This script helps you create admin users in your Supabase database

-- ============================================================
-- STEP 1: Create an admin user through Supabase Auth
-- ============================================================
-- You need to do this through the Supabase Dashboard:
-- 1. Go to Authentication > Users in your Supabase project
-- 2. Click "Add User"
-- 3. Enter email and password
-- 4. Click "Create User"
-- 5. Copy the user ID that was created

-- ============================================================
-- STEP 2: Set admin flag on the user
-- ============================================================
-- Replace 'USER_ID_HERE' with the actual user ID from Step 1
-- Replace 'admin@example.com' with your admin email

-- Option A: Set is_admin in user_metadata
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
WHERE email = 'admin@example.com';

-- Option B: Set is_admin in app_metadata (more secure, can't be changed by user)
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb
WHERE email = 'admin@example.com';

-- ============================================================
-- STEP 3: Verify the admin user was created correctly
-- ============================================================
SELECT
  id,
  email,
  raw_user_meta_data->>'is_admin' as user_meta_admin,
  raw_app_meta_data->>'is_admin' as app_meta_admin,
  created_at
FROM auth.users
WHERE email = 'admin@example.com';

-- Expected result: You should see is_admin = true in one of the columns

-- ============================================================
-- ALTERNATIVE: Set admin email in environment variable
-- ============================================================
-- Instead of setting is_admin flag, you can:
-- 1. Add NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com to your .env.local
-- 2. The auth system will check if the user's email matches this
-- This is simpler for a single admin user

-- ============================================================
-- CREATING MULTIPLE ADMIN USERS
-- ============================================================
-- To create additional admin users, repeat steps 1-2 for each user:

-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb
-- WHERE email = 'second-admin@example.com';

-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb
-- WHERE email = 'third-admin@example.com';

-- ============================================================
-- REMOVING ADMIN ACCESS
-- ============================================================
-- To remove admin access from a user:

-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data - 'is_admin'
-- WHERE email = 'former-admin@example.com';

-- ============================================================
-- HELPFUL QUERIES
-- ============================================================

-- List all admin users
SELECT
  id,
  email,
  raw_user_meta_data->>'is_admin' as user_meta_admin,
  raw_app_meta_data->>'is_admin' as app_meta_admin,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE
  (raw_user_meta_data->>'is_admin')::boolean = true OR
  (raw_app_meta_data->>'is_admin')::boolean = true
ORDER BY created_at DESC;

-- Check if specific user is admin
SELECT
  email,
  CASE
    WHEN (raw_user_meta_data->>'is_admin')::boolean = true THEN 'Yes (user_metadata)'
    WHEN (raw_app_meta_data->>'is_admin')::boolean = true THEN 'Yes (app_metadata)'
    ELSE 'No'
  END as is_admin
FROM auth.users
WHERE email = 'admin@example.com';
