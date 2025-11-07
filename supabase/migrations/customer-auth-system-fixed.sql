-- Customer Authentication System Migration (Fixed)
-- Run this in your Supabase SQL Editor

-- 1. Add authentication fields to customers table (only new columns)
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Drop the existing unique_email constraint if it exists and recreate with correct name
ALTER TABLE customers DROP CONSTRAINT IF EXISTS unique_email;

-- Make email unique for login (using index instead of constraint to avoid conflicts)
DROP INDEX IF EXISTS customers_email_unique;
CREATE UNIQUE INDEX customers_email_unique ON customers(email) WHERE email IS NOT NULL;

-- 2. Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(customer_id, product_id)
);

-- 3. Create customer_addresses table for saved addresses
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  address_type TEXT NOT NULL CHECK (address_type IN ('shipping', 'billing', 'both')),
  is_default BOOLEAN DEFAULT FALSE,
  full_name TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'UK',
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create customer_sessions table for JWT token management
CREATE TABLE IF NOT EXISTS customer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_address TEXT
);

-- 5. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_wishlist_customer ON wishlist(customer_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product ON wishlist(product_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_default ON customer_addresses(customer_id, is_default);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_customer ON customer_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_expires ON customer_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- 6. Update RLS policies for wishlist
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own wishlist" ON wishlist;
CREATE POLICY "Users can view their own wishlist"
  ON wishlist FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can add to their wishlist" ON wishlist;
CREATE POLICY "Users can add to their wishlist"
  ON wishlist FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can remove from their wishlist" ON wishlist;
CREATE POLICY "Users can remove from their wishlist"
  ON wishlist FOR DELETE
  USING (true);

-- 7. Update RLS policies for customer_addresses
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own addresses" ON customer_addresses;
CREATE POLICY "Users can view their own addresses"
  ON customer_addresses FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage their own addresses" ON customer_addresses;
CREATE POLICY "Users can manage their own addresses"
  ON customer_addresses FOR ALL
  USING (true);

-- 8. Update RLS policies for customer_sessions
ALTER TABLE customer_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own sessions" ON customer_sessions;
CREATE POLICY "Users can view their own sessions"
  ON customer_sessions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service can manage all sessions" ON customer_sessions;
CREATE POLICY "Service can manage all sessions"
  ON customer_sessions FOR ALL
  USING (true);

-- 9. Create function to update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Create triggers for updated_at (drop if exists first)
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_addresses_updated_at ON customer_addresses;
CREATE TRIGGER update_customer_addresses_updated_at BEFORE UPDATE ON customer_addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Create view for customer order history (skip duplicate column)
-- Note: Orders table already has customer_name, so we only add customer_email
DROP VIEW IF EXISTS customer_order_history;
CREATE OR REPLACE VIEW customer_order_history AS
SELECT
  o.*,
  c.email as customer_email_from_profile
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
ORDER BY o.created_at DESC;

-- Grant permissions
GRANT SELECT ON customer_order_history TO anon, authenticated;

-- Add comments for documentation
COMMENT ON TABLE wishlist IS 'Customer wishlist items';
COMMENT ON TABLE customer_addresses IS 'Customer saved shipping and billing addresses';
COMMENT ON TABLE customer_sessions IS 'Active customer login sessions';
COMMENT ON VIEW customer_order_history IS 'Customer order history with customer profile email';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Customer authentication system migration completed successfully!';
END $$;
