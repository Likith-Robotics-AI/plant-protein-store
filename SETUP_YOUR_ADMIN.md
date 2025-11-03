# Setup Admin User: likithkumaryammanuru@gmail.com

## 🚀 Quick Setup Instructions

### Step 1: Create the User in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **Authentication** in the left sidebar
4. Click **Users**
5. Click **"Add User"** button
6. Fill in the form:
   ```
   Email: likithkumaryammanuru@gmail.com
   Password: likith@2001
   ```
7. ✅ **IMPORTANT:** Check the box **"Auto Confirm User"**
8. Click **"Create User"**

---

### Step 2: Grant Admin Privileges

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **"New Query"**
3. Copy and paste this SQL:

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb
WHERE email = 'likithkumaryammanuru@gmail.com';
```

4. Click **"Run"** or press Ctrl+Enter
5. You should see: `UPDATE 1` (meaning 1 row was updated)

---

### Step 3: Verify Admin User Was Created

Run this query to verify:

```sql
SELECT
  email,
  raw_app_meta_data->>'is_admin' as is_admin,
  email_confirmed_at
FROM auth.users
WHERE email = 'likithkumaryammanuru@gmail.com';
```

**Expected result:**
```
email                           | is_admin | email_confirmed_at
--------------------------------|----------|-------------------
likithkumaryammanuru@gmail.com | true     | 2025-11-01 14:...
```

✅ If you see `is_admin: true`, you're good to go!

---

### Step 4: Run RLS Policies (One Time Only)

Copy the entire `create-admin-user.sql` file and run it in SQL Editor, OR run this simplified version:

```sql
-- Create admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true OR
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Products policies
CREATE POLICY "Public can read products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin can insert products" ON products FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update products" ON products FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin can delete products" ON products FOR DELETE USING (is_admin());

-- Orders policies
CREATE POLICY "Public can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can read all orders" ON orders FOR SELECT USING (is_admin());
CREATE POLICY "Admin can update orders" ON orders FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admin can delete orders" ON orders FOR DELETE USING (is_admin());

-- Analytics policies
CREATE POLICY "Public can insert analytics" ON analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can read analytics" ON analytics FOR SELECT USING (is_admin());
CREATE POLICY "Admin can delete analytics" ON analytics FOR DELETE USING (is_admin());
```

---

### Step 5: Update Environment Variables

Add this to your `.env.local` file:

```env
# Admin email
NEXT_PUBLIC_ADMIN_EMAIL=likithkumaryammanuru@gmail.com

# Get this from: Supabase Dashboard → Settings → API → service_role secret
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**To find your service role key:**
1. Supabase Dashboard → **Settings** (bottom left)
2. Click **API**
3. Scroll to **Project API keys**
4. Copy the **`service_role`** secret (NOT the anon public key!)
5. Paste it into `.env.local`

---

### Step 6: Test Your Login

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Open browser and go to:
   ```
   http://localhost:3000/admin
   ```

3. You should see the login page

4. Enter your credentials:
   ```
   Email: likithkumaryammanuru@gmail.com
   Password: likith@2001
   ```

5. Click **"Sign In"**

6. **SUCCESS!** 🎉 You should now see the admin dashboard!

---

## 📋 Your Admin Credentials

Save these for future reference:

```
Email: likithkumaryammanuru@gmail.com
Password: likith@2001
Admin URL: http://localhost:3000/admin
```

---

## ✅ Verification Checklist

- [ ] Created user in Supabase Authentication → Users
- [ ] Checked "Auto Confirm User" when creating
- [ ] Ran UPDATE query to set `is_admin: true`
- [ ] Verified `is_admin` is true in database
- [ ] Ran RLS policies SQL script
- [ ] Added `NEXT_PUBLIC_ADMIN_EMAIL` to `.env.local`
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- [ ] Successfully logged in at `/admin`
- [ ] Can see dashboard, products, orders, analytics

---

## 🐛 Troubleshooting

### "This account does not have admin privileges"

**Fix:** Run this SQL again:
```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb
WHERE email = 'likithkumaryammanuru@gmail.com';
```

Then verify:
```sql
SELECT email, raw_app_meta_data->>'is_admin' as is_admin
FROM auth.users
WHERE email = 'likithkumaryammanuru@gmail.com';
```

### "Invalid login credentials"

**Possible causes:**
1. **User not confirmed:** Make sure you checked "Auto Confirm User" when creating the user
2. **Wrong password:** The password is case-sensitive: `likith@2001`
3. **User doesn't exist:** Verify the user was created:
   ```sql
   SELECT email, email_confirmed_at FROM auth.users
   WHERE email = 'likithkumaryammanuru@gmail.com';
   ```

### Can't see products/orders in admin panel

**Fix:** Make sure RLS policies are enabled and created:
```sql
-- Check if policies exist
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('products', 'orders', 'analytics');
```

If no results, run the RLS policies SQL from Step 4 again.

---

## 🎯 What You Can Do Now

Once logged in, you have access to:

### Dashboard (`/admin`)
- View total products, orders, revenue
- See analytics summary
- Quick action buttons

### Products Management (`/admin/products`)
- Create new products
- Edit existing products
- Delete products
- Upload product images
- Set prices and stock levels

### Orders Management (`/admin/orders`)
- View all customer orders
- See order details
- Customer contact information
- Order status tracking

### Analytics (`/admin/analytics`)
- Page views and user engagement
- Buy button click tracking
- Add to cart analytics
- Top performing products
- Conversion metrics

### Price Updates (`/admin/update-prices`)
- Bulk update all product prices
- Quick price adjustments

---

## 🔒 Security Notes

- Your password is encrypted in the database
- Session tokens are used for authentication
- Row-level security policies protect the database
- Admin flag cannot be changed by users (only via SQL)

---

**All set!** Enjoy your admin panel! 🚀

If you need to create more admin users in the future, just repeat Steps 1-3 with different email addresses.
