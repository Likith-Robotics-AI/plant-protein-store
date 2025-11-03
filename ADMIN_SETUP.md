# Admin Access Control Setup Guide

This guide explains how to set up and manage admin access for your Plant Protein Store application.

## Overview

The admin system uses Supabase Authentication with Row-Level Security (RLS) policies to protect sensitive operations. Only authenticated admin users can:

- Access the admin panel at `/admin`
- Create, edit, and delete products
- View all orders and customer data
- View analytics data
- Bulk update prices

## Quick Start

### 1. Run Database Migrations

Execute the following SQL scripts in your Supabase SQL Editor in order:

#### a. Main Schema (if not already done)
```bash
supabase-schema.sql
```

#### b. Admin RLS Policies
```bash
supabase-admin-rls-policies.sql
```

This creates:
- Helper function `is_admin()` to check admin status
- RLS policies for all tables
- Proper access controls

### 2. Create Your First Admin User

#### Method A: Through Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Users**
3. Click **"Add User"**
4. Enter:
   - Email: `your-email@example.com`
   - Password: `your-secure-password`
   - ✅ Auto Confirm User: **Yes**
5. Click **"Create User"**
6. Note the User ID that was created

#### Method B: SQL (Advanced)

Run in Supabase SQL Editor:
```sql
-- This creates a user programmatically (advanced)
-- It's easier to use the dashboard
```

### 3. Grant Admin Privileges

After creating the user, run this SQL query (replace email):

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb
WHERE email = 'your-email@example.com';
```

Verify it worked:
```sql
SELECT
  email,
  raw_app_meta_data->>'is_admin' as is_admin
FROM auth.users
WHERE email = 'your-email@example.com';
```

You should see `is_admin: true`

### 4. Environment Variables

Add to your `.env.local` file:

```env
# Admin email for fallback authentication
NEXT_PUBLIC_ADMIN_EMAIL=your-email@example.com

# Service role key for admin operations (keep secret!)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: Admin API key for alternative auth method
ADMIN_API_KEY=your-random-secure-key-here
```

Get your `SUPABASE_SERVICE_ROLE_KEY` from:
Supabase Dashboard → Settings → API → `service_role` secret

### 5. Test Admin Access

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000/admin

3. Sign in with the admin credentials you created

4. You should see the admin dashboard!

## Adding More Admin Users

To add additional admin users, repeat steps 2-3:

```sql
-- Create user through dashboard first, then run:
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb
WHERE email = 'second-admin@example.com';
```

## Removing Admin Access

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data - 'is_admin'
WHERE email = 'former-admin@example.com';
```

## Security Features

### ✅ Frontend Protection
- Admin layout requires Supabase authentication
- Session-based login with automatic token refresh
- Proper login/logout flow
- Shows logged-in user email

### ✅ API Route Protection
- All admin API routes require Bearer token
- Automatic admin role verification
- Returns 401/403 for unauthorized access
- Middleware at `/lib/admin-check.ts`

### ✅ Database-Level Security
- Row-Level Security (RLS) enabled on all tables
- Policies check `is_admin()` function
- Even with service role key, RLS is enforced
- Audit trail through Supabase Auth logs

## How It Works

### Authentication Flow

1. Admin visits `/admin`
2. Admin layout checks for active session
3. If no session → show login form
4. Admin enters email/password
5. Supabase Auth validates credentials
6. System checks if user has `is_admin: true`
7. If admin → grant access
8. If not admin → deny with error message

### API Protection Flow

1. Admin page makes API request
2. Request includes `Authorization: Bearer <token>`
3. API route calls `verifyAdminAccess(request)`
4. Verifies token with Supabase
5. Checks if user has admin flag
6. If valid admin → proceed
7. If not → return 401/403 error

### Database Protection Flow

1. Query attempts to access data
2. RLS policy evaluates
3. Calls `is_admin()` function
4. Function checks JWT token metadata
5. Returns true/false
6. Policy allows/denies based on result

## Troubleshooting

### "This account does not have admin privileges"

**Solution:** Run the UPDATE query to set `is_admin: true`:
```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb
WHERE email = 'your-email@example.com';
```

### "Invalid or expired token"

**Solution:**
- Log out and log back in
- Check that your Supabase URL and keys are correct in `.env.local`
- Verify your Supabase project is active

### Can't see orders/products in admin panel

**Solution:**
- Make sure you ran `supabase-admin-rls-policies.sql`
- Verify RLS is enabled: Go to Supabase → Database → Tables → Check "RLS enabled"
- Check browser console for errors

### RLS policies not working

**Solution:**
```sql
-- Check if is_admin() function exists
SELECT proname FROM pg_proc WHERE proname = 'is_admin';

-- If not found, re-run supabase-admin-rls-policies.sql
```

## Admin Features

### Products Management (`/admin/products`)
- ✏️ Create new products
- ✏️ Edit existing products
- 🗑️ Delete products
- 📸 Upload product images
- 💰 Set prices and stock levels

### Orders Management (`/admin/orders`)
- 📦 View all customer orders
- 👤 See customer details
- 💳 View payment information
- 📊 Order status tracking

### Analytics (`/admin/analytics`)
- 📈 Page views and click tracking
- 🎯 Conversion metrics
- 🏆 Top performing products
- 📅 Recent activity feed

### Price Updates (`/admin/update-prices`)
- 💰 Bulk update all product prices
- 🎯 Targeted price changes
- ⚡ Quick price adjustments

## Helpful SQL Queries

### List all admin users
```sql
SELECT
  id,
  email,
  raw_app_meta_data->>'is_admin' as is_admin,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE (raw_app_meta_data->>'is_admin')::boolean = true
ORDER BY created_at DESC;
```

### Check user admin status
```sql
SELECT
  email,
  CASE
    WHEN (raw_app_meta_data->>'is_admin')::boolean = true THEN 'Yes'
    ELSE 'No'
  END as is_admin
FROM auth.users
WHERE email = 'check@example.com';
```

### View all RLS policies
```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## Best Practices

### 🔒 Security
- ✅ Use strong passwords for admin accounts
- ✅ Keep `SUPABASE_SERVICE_ROLE_KEY` secret (never commit to git)
- ✅ Use `app_metadata` for admin flag (more secure than `user_metadata`)
- ✅ Enable MFA for admin accounts (in Supabase dashboard)
- ✅ Regularly review admin user list
- ✅ Remove admin access when no longer needed

### 🚀 Performance
- ✅ RLS policies are cached by Postgres
- ✅ `is_admin()` function is lightweight
- ✅ Tokens are validated server-side
- ✅ Session cookies reduce auth calls

### 📋 Maintenance
- ✅ Periodically review and clean up old analytics data
- ✅ Monitor admin login attempts
- ✅ Keep Supabase client libraries updated
- ✅ Test RLS policies after schema changes

## Need Help?

- Check Supabase logs: Dashboard → Logs → Postgres Logs
- Enable RLS debug mode:
  ```sql
  SET log_statement = 'all';
  ```
- Review auth logs: Dashboard → Authentication → Logs
- Check browser console for frontend errors

## Next Steps

1. ✅ Create your first admin user
2. ✅ Test login at `/admin`
3. ✅ Add some products
4. ✅ Configure discount codes (if needed)
5. ✅ Set up email notifications for orders
6. ✅ Customize admin panel branding

**Admin Panel URL:** `https://your-domain.com/admin`

Enjoy your secure admin panel! 🎉
