# Payment System Setup Guide

This guide will help you set up the complete payment system with Stripe integration and database tables.

## Table of Contents
1. [Environment Variables](#environment-variables)
2. [Database Setup](#database-setup)
3. [Stripe Configuration](#stripe-configuration)
4. [Testing the Payment Flow](#testing-the-payment-flow)

---

## Environment Variables

Update your `.env.local` file with the following configuration:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Getting Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_test_`) to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Copy your **Secret key** (starts with `sk_test_`) to `STRIPE_SECRET_KEY`
5. For webhooks, go to **Developers** → **Webhooks** → **Add endpoint**
   - Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to listen: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the **Signing secret** to `STRIPE_WEBHOOK_SECRET`

---

## Database Setup

### 1. Update Orders Table

Run this SQL in your Supabase SQL Editor to update the `orders` table schema:

```sql
-- Drop existing orders table if you need to start fresh (CAUTION: This deletes all order data!)
-- DROP TABLE IF EXISTS orders CASCADE;

-- Create or update orders table with new schema
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Customer Information
  customer_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  email TEXT,
  phone TEXT,

  -- Order Items
  products JSONB NOT NULL,

  -- Pricing
  subtotal NUMERIC(10, 2) NOT NULL,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  discount_code TEXT,
  shipping_cost NUMERIC(10, 2) DEFAULT 0,
  tax_amount NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,

  -- Addresses
  shipping_address JSONB NOT NULL,
  billing_address JSONB,

  -- Payment Information
  payment_details JSONB NOT NULL,

  -- Order Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded')),
  tracking_number TEXT,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_contact ON orders(contact);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_discount_code ON orders(discount_code);

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Allow all operations for now (adjust based on your auth requirements)
CREATE POLICY "Allow public read access to orders" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. Create Discount Codes Table

```sql
-- Create discount_codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Code Details
  code TEXT UNIQUE NOT NULL,
  description TEXT,

  -- Discount Configuration
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed_amount')),
  value NUMERIC(10, 2) NOT NULL,
  min_purchase_amount NUMERIC(10, 2),
  max_discount_amount NUMERIC(10, 2),

  -- Usage Limits
  usage_limit INTEGER,
  times_used INTEGER DEFAULT 0,

  -- Validity Period
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_is_active ON discount_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_discount_codes_valid_dates ON discount_codes(valid_from, valid_until);

-- Enable RLS
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read access to active discount codes" ON discount_codes
  FOR SELECT USING (is_active = true);

-- Function to increment discount code usage
CREATE OR REPLACE FUNCTION increment_discount_usage(discount_code TEXT)
RETURNS void AS $$
BEGIN
  UPDATE discount_codes
  SET times_used = times_used + 1
  WHERE code = discount_code AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample discount codes (optional)
INSERT INTO discount_codes (code, description, type, value, min_purchase_amount, valid_from, valid_until, is_active)
VALUES
  ('WELCOME10', '10% off your first order', 'percentage', 10, 0, NOW(), NOW() + INTERVAL '30 days', true),
  ('SAVE20', '£20 off orders over £100', 'fixed_amount', 20, 100, NOW(), NOW() + INTERVAL '30 days', true),
  ('BULK25', '25% off orders over £200', 'percentage', 25, 200, NOW(), NOW() + INTERVAL '30 days', true)
ON CONFLICT (code) DO NOTHING;
```

### 3. Verify Database Setup

Run these queries to verify everything is set up correctly:

```sql
-- Check orders table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Check discount_codes table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'discount_codes'
ORDER BY ordinal_position;

-- Verify discount codes
SELECT code, description, type, value, is_active
FROM discount_codes
WHERE is_active = true;
```

---

## Stripe Configuration

### Test Credit Cards

Use these test card numbers in development:

| Card Number | Brand | CVC | Date | Result |
|-------------|-------|-----|------|--------|
| 4242 4242 4242 4242 | Visa | Any 3 digits | Any future date | Success |
| 4000 0025 0000 3155 | Visa (3D Secure) | Any 3 digits | Any future date | Requires authentication |
| 4000 0000 0000 9995 | Visa | Any 3 digits | Any future date | Declined |

### Webhook Setup (Production Only)

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your production URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the **Signing secret** and add to your production `.env`

---

## Testing the Payment Flow

### 1. Test Checkout Flow

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the products page
3. Add products to cart with different weights
4. Go to checkout
5. Fill in the form:
   - **Personal Info**: Enter test name and email
   - **Shipping Address**: Enter test address
   - **Payment**: Use test card `4242 4242 4242 4242`

### 2. Test Discount Codes

1. In checkout, enter a discount code (e.g., `WELCOME10`)
2. Click "Apply"
3. Verify the discount is applied to the total

### 3. Verify Order Creation

1. After successful payment, check the order confirmation page
2. Verify order details in Supabase:
   ```sql
   SELECT id, customer_name, total, status, created_at
   FROM orders
   ORDER BY created_at DESC
   LIMIT 5;
   ```

3. Check Stripe Dashboard → **Payments** to see the test payment

### 4. Test Different Scenarios

- ✅ Successful payment with discount code
- ✅ Successful payment without discount code
- ✅ Invalid discount code
- ✅ Expired discount code
- ✅ Card declined (use `4000 0000 0000 9995`)
- ✅ 3D Secure authentication (use `4000 0025 0000 3155`)

---

## Common Issues and Solutions

### Issue: Stripe Element Not Loading

**Solution:** Verify your Stripe publishable key is correct and starts with `pk_test_`

### Issue: Payment Intent Creation Failed

**Solution:** Check that your Stripe secret key is set correctly in `.env.local`

### Issue: Discount Code Not Working

**Solution:**
1. Verify the discount code exists in the database
2. Check that `is_active = true`
3. Verify the code is within the valid date range

### Issue: Order Not Saving to Database

**Solution:**
1. Check Supabase connection
2. Verify RLS policies allow insert
3. Check browser console for detailed error messages

---

## Next Steps

1. **Production Deployment:**
   - Replace test Stripe keys with live keys
   - Set up webhook endpoint for production
   - Configure proper RLS policies for orders table

2. **Email Notifications:**
   - Integrate email service (SendGrid, Resend, etc.)
   - Send order confirmation emails
   - Send shipping notification emails

3. **Admin Dashboard:**
   - Create admin interface to view orders
   - Add order status management
   - Generate reports and analytics

4. **Additional Features:**
   - Order tracking system
   - Invoice generation
   - Refund processing
   - Subscription support

---

## Support

For issues or questions:
- Check [Stripe Documentation](https://stripe.com/docs)
- Check [Supabase Documentation](https://supabase.com/docs)
- Review error logs in browser console and server logs

---

**Last Updated:** November 2025
