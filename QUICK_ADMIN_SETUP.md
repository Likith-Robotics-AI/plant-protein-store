# Quick Admin Setup - Get Started in 5 Minutes

## Step 1: Create Admin User in Supabase

### Option A: Through Supabase Dashboard (Easiest)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project
3. Go to **Authentication** (in left sidebar)
4. Click **Users**
5. Click **Add User** button
6. Fill in:
   - **Email:** your-email@example.com (use your real email)
   - **Password:** your-secure-password (choose a strong password)
   - ✅ **Auto Confirm User:** Check this box!
7. Click **Create User**

### Option B: SQL Command (Alternative)

If you prefer SQL, go to **SQL Editor** and run:

```sql
-- This will be done automatically through Supabase Auth when you use the dashboard
-- Not needed if you use Option A above
```

---

## Step 2: Grant Admin Privileges

After creating the user, go to **SQL Editor** and run:

```sql
-- Replace 'your-email@example.com' with the email you used
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb
WHERE email = 'your-email@example.com';
```

**Verify it worked:**
```sql
SELECT
  email,
  raw_app_meta_data->>'is_admin' as is_admin
FROM auth.users
WHERE email = 'your-email@example.com';
```

You should see `is_admin: true`

---

## Step 3: Run RLS Policies

In **SQL Editor**, copy and paste this entire script:

```sql
-- Admin Row Level Security (RLS) Policies
-- This enables database-level security

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
CREATE POLICY "Public can read products"
  ON products FOR SELECT USING (true);

CREATE POLICY "Admin can insert products"
  ON products FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admin can update products"
  ON products FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admin can delete products"
  ON products FOR DELETE USING (is_admin());

-- ORDERS TABLE POLICIES
CREATE POLICY "Public can insert orders"
  ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can read all orders"
  ON orders FOR SELECT USING (is_admin());

CREATE POLICY "Admin can update orders"
  ON orders FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admin can delete orders"
  ON orders FOR DELETE USING (is_admin());

-- ANALYTICS TABLE POLICIES
CREATE POLICY "Public can insert analytics"
  ON analytics FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can read analytics"
  ON analytics FOR SELECT USING (is_admin());

CREATE POLICY "Admin can delete analytics"
  ON analytics FOR DELETE USING (is_admin());
```

Click **Run** to execute.

---

## Step 4: Update Environment Variables

Add to your `.env.local` file:

```env
# Admin email for fallback check
NEXT_PUBLIC_ADMIN_EMAIL=your-email@example.com

# Service role key from Supabase (Settings → API → service_role secret)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**To get your service role key:**
1. Go to **Settings** (in left sidebar)
2. Click **API**
3. Scroll to **Project API keys**
4. Copy the **service_role** secret (NOT the anon public key!)

---

## Step 5: Test Your Admin Access

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Go to: http://localhost:3000/admin

3. You should see a login form

4. Enter:
   - **Email:** the email you used in Step 1
   - **Password:** the password you set in Step 1

5. Click **Sign In**

6. You should now see the admin dashboard! 🎉

---

## ✅ Success Checklist

- [ ] Created admin user in Supabase
- [ ] Granted admin privileges (ran UPDATE query)
- [ ] Verified admin flag is set (saw `is_admin: true`)
- [ ] Ran RLS policies SQL script
- [ ] Added environment variables to `.env.local`
- [ ] Can log in to `/admin`
- [ ] Can see dashboard, products, orders, analytics

---

## 🐛 Troubleshooting

### "This account does not have admin privileges"

**Fix:** Make sure you ran the UPDATE query:
```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb
WHERE email = 'your-email@example.com';
```

### "Invalid login credentials"

**Fix:**
- Make sure you checked "Auto Confirm User" when creating the user
- OR manually confirm the user in Supabase dashboard

### Can't see products/orders in admin panel

**Fix:**
- Make sure you ran the RLS policies script
- Check that tables have RLS enabled:
  - Go to **Database** → **Tables**
  - Click on `products` table
  - Check "RLS enabled" is ON

---

## 📧 Example Credentials for Testing

```
Email: admin@plantprotein.com
Password: SecureAdminPass123!
```

Remember to use a **real email** if you want to receive password reset emails!

---

## 🎯 What You Can Do Now

Once logged in, you can:

✅ **Manage Products** (`/admin/products`)
- Create, edit, delete products
- Upload images
- Set prices and stock

✅ **View Orders** (`/admin/orders`)
- See all customer orders
- View customer details
- Track order status

✅ **Analytics** (`/admin/analytics`)
- Page views and clicks
- Conversion rates
- Top products

✅ **Update Prices** (`/admin/update-prices`)
- Bulk update product prices

---

**Need help?** Check the full `ADMIN_SETUP.md` file for detailed documentation!

Happy administering! 🚀
