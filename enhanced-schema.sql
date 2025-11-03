-- ============================================================
-- ENHANCED ADMIN SYSTEM DATABASE SCHEMA
-- Plant Protein Store - Comprehensive Order & Analytics Management
-- ============================================================
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. CREATE CUSTOMERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  -- At least one contact method required
  CONSTRAINT contact_required CHECK (email IS NOT NULL OR phone IS NOT NULL),
  -- Ensure unique contact info
  CONSTRAINT unique_email UNIQUE (email),
  CONSTRAINT unique_phone UNIQUE (phone),
  -- Customer metrics
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  average_order_value DECIMAL(10, 2) DEFAULT 0,
  last_order_date TIMESTAMP WITH TIME ZONE,
  first_order_date TIMESTAMP WITH TIME ZONE,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. UPDATE ORDERS TABLE - Add Enhanced Fields
-- ============================================================
-- Add new columns to existing orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add status constraints
ALTER TABLE orders DROP CONSTRAINT IF EXISTS valid_fulfillment_status;
ALTER TABLE orders ADD CONSTRAINT valid_fulfillment_status
  CHECK (fulfillment_status IN ('pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS valid_payment_status;
ALTER TABLE orders ADD CONSTRAINT valid_payment_status
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- ============================================================
-- 3. CREATE ORDER STATUS HISTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT DEFAULT 'admin',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 4. ENHANCE ANALYTICS TABLE - Add Advanced Tracking
-- ============================================================
-- Add new columns to existing analytics table
ALTER TABLE analytics
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER,
ADD COLUMN IF NOT EXISTS scroll_depth_percentage INTEGER,
ADD COLUMN IF NOT EXISTS device_type TEXT,
ADD COLUMN IF NOT EXISTS browser TEXT,
ADD COLUMN IF NOT EXISTS referrer TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- ============================================================
-- 5. CREATE ADMIN ACTIVITY LOG TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_identifier TEXT NOT NULL, -- Could be email or session ID
  action TEXT NOT NULL, -- e.g., 'order_status_updated', 'product_created'
  target_type TEXT NOT NULL, -- e.g., 'order', 'product', 'customer'
  target_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ============================================================

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_last_order ON customers(last_order_date DESC);
CREATE INDEX IF NOT EXISTS idx_customers_total_spent ON customers(total_spent DESC);

-- Orders indexes (enhanced)
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at DESC);

-- Order status history indexes
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at DESC);

-- Analytics indexes (enhanced)
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_duration ON analytics(duration_seconds DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_product ON analytics(event_type, product_id);

-- Admin activity log indexes
CREATE INDEX IF NOT EXISTS idx_admin_activity_admin ON admin_activity_log(admin_identifier);
CREATE INDEX IF NOT EXISTS idx_admin_activity_target ON admin_activity_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created_at ON admin_activity_log(created_at DESC);

-- ============================================================
-- 7. CREATE FUNCTIONS FOR AUTOMATION
-- ============================================================

-- Function to update customer metrics when order is created/updated
CREATE OR REPLACE FUNCTION update_customer_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.customer_id IS NOT NULL THEN
    UPDATE customers
    SET
      total_orders = (
        SELECT COUNT(*)
        FROM orders
        WHERE customer_id = NEW.customer_id
        AND fulfillment_status NOT IN ('cancelled', 'refunded')
      ),
      total_spent = (
        SELECT COALESCE(SUM(total), 0)
        FROM orders
        WHERE customer_id = NEW.customer_id
        AND payment_status = 'paid'
      ),
      average_order_value = (
        SELECT COALESCE(AVG(total), 0)
        FROM orders
        WHERE customer_id = NEW.customer_id
        AND payment_status = 'paid'
      ),
      last_order_date = (
        SELECT MAX(created_at)
        FROM orders
        WHERE customer_id = NEW.customer_id
      ),
      first_order_date = (
        SELECT MIN(created_at)
        FROM orders
        WHERE customer_id = NEW.customer_id
      ),
      updated_at = NOW()
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log order status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.fulfillment_status IS DISTINCT FROM NEW.fulfillment_status THEN
    INSERT INTO order_status_history (order_id, previous_status, new_status, notes)
    VALUES (NEW.id, OLD.fulfillment_status, NEW.fulfillment_status, 'Status updated');
  END IF;

  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-create customer from order if not exists
CREATE OR REPLACE FUNCTION auto_create_customer_from_order()
RETURNS TRIGGER AS $$
DECLARE
  customer_id_var UUID;
  customer_email TEXT;
  customer_phone TEXT;
BEGIN
  -- Extract email and phone from contact field
  IF NEW.contact LIKE '%@%' THEN
    customer_email := NEW.contact;
    customer_phone := NULL;
  ELSE
    customer_email := NULL;
    customer_phone := NEW.contact;
  END IF;

  -- Check if customer exists
  SELECT id INTO customer_id_var
  FROM customers
  WHERE (email = customer_email AND customer_email IS NOT NULL)
     OR (phone = customer_phone AND customer_phone IS NOT NULL)
  LIMIT 1;

  -- Create customer if doesn't exist
  IF customer_id_var IS NULL THEN
    INSERT INTO customers (name, email, phone)
    VALUES (NEW.customer_name, customer_email, customer_phone)
    RETURNING id INTO customer_id_var;
  END IF;

  -- Link order to customer
  NEW.customer_id := customer_id_var;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 8. CREATE TRIGGERS
-- ============================================================

-- Trigger to update customer metrics after order insert/update
DROP TRIGGER IF EXISTS trigger_update_customer_metrics_insert ON orders;
CREATE TRIGGER trigger_update_customer_metrics_insert
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_metrics();

DROP TRIGGER IF EXISTS trigger_update_customer_metrics_update ON orders;
CREATE TRIGGER trigger_update_customer_metrics_update
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_metrics();

-- Trigger to log order status changes
DROP TRIGGER IF EXISTS trigger_log_order_status ON orders;
CREATE TRIGGER trigger_log_order_status
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- Trigger to auto-create customers from orders
DROP TRIGGER IF EXISTS trigger_auto_create_customer ON orders;
CREATE TRIGGER trigger_auto_create_customer
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_customer_from_order();

-- ============================================================
-- 9. UPDATE ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- First, ensure is_admin() function exists
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true OR
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on new tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Customers policies
DROP POLICY IF EXISTS "Admin can read customers" ON customers;
CREATE POLICY "Admin can read customers"
  ON customers FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admin can insert customers" ON customers;
CREATE POLICY "Admin can insert customers"
  ON customers FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin can update customers" ON customers;
CREATE POLICY "Admin can update customers"
  ON customers FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Order status history policies
DROP POLICY IF EXISTS "Admin can read order status history" ON order_status_history;
CREATE POLICY "Admin can read order status history"
  ON order_status_history FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admin can insert order status history" ON order_status_history;
CREATE POLICY "Admin can insert order status history"
  ON order_status_history FOR INSERT
  WITH CHECK (is_admin());

-- Admin activity log policies
DROP POLICY IF EXISTS "Admin can read activity log" ON admin_activity_log;
CREATE POLICY "Admin can read activity log"
  ON admin_activity_log FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admin can insert activity log" ON admin_activity_log;
CREATE POLICY "Admin can insert activity log"
  ON admin_activity_log FOR INSERT
  WITH CHECK (true); -- Allow any authenticated user to log

-- ============================================================
-- 10. MIGRATE EXISTING DATA
-- ============================================================

-- Create customers from existing orders
INSERT INTO customers (name, email, phone)
SELECT DISTINCT
  customer_name,
  CASE WHEN contact LIKE '%@%' THEN contact ELSE NULL END as email,
  CASE WHEN contact NOT LIKE '%@%' THEN contact ELSE NULL END as phone
FROM orders
WHERE NOT EXISTS (
  SELECT 1 FROM customers c
  WHERE (c.email = orders.contact AND orders.contact LIKE '%@%')
     OR (c.phone = orders.contact AND orders.contact NOT LIKE '%@%')
)
ON CONFLICT DO NOTHING;

-- Link existing orders to customers
UPDATE orders o
SET customer_id = c.id
FROM customers c
WHERE (c.email = o.contact AND o.contact LIKE '%@%')
   OR (c.phone = o.contact AND o.contact NOT LIKE '%@%')
AND o.customer_id IS NULL;

-- ============================================================
-- 11. CREATE HELPFUL VIEWS FOR ADMIN
-- ============================================================

-- View: Customer order summary
CREATE OR REPLACE VIEW customer_order_summary AS
SELECT
  c.id as customer_id,
  c.name,
  c.email,
  c.phone,
  c.total_orders,
  c.total_spent,
  c.average_order_value,
  c.first_order_date,
  c.last_order_date,
  EXTRACT(DAY FROM (NOW() - c.last_order_date)) as days_since_last_order,
  COUNT(CASE WHEN o.fulfillment_status = 'pending' THEN 1 END) as pending_orders,
  COUNT(CASE WHEN o.fulfillment_status = 'delivered' THEN 1 END) as completed_orders
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name, c.email, c.phone, c.total_orders, c.total_spent,
         c.average_order_value, c.first_order_date, c.last_order_date;

-- View: Product analytics summary
CREATE OR REPLACE VIEW product_analytics_summary AS
SELECT
  p.id as product_id,
  p.name as product_name,
  COUNT(CASE WHEN a.event_type = 'page_view' THEN 1 END) as total_views,
  COUNT(CASE WHEN a.event_type = 'buy_click' THEN 1 END) as total_clicks,
  COUNT(CASE WHEN a.event_type = 'add_to_cart' THEN 1 END) as total_add_to_cart,
  AVG(CASE WHEN a.duration_seconds IS NOT NULL THEN a.duration_seconds END) as avg_time_spent_seconds,
  COUNT(DISTINCT a.session_id) as unique_sessions,
  CASE
    WHEN COUNT(CASE WHEN a.event_type = 'page_view' THEN 1 END) > 0
    THEN (COUNT(CASE WHEN a.event_type = 'buy_click' THEN 1 END)::FLOAT /
          COUNT(CASE WHEN a.event_type = 'page_view' THEN 1 END)::FLOAT * 100)
    ELSE 0
  END as click_through_rate
FROM products p
LEFT JOIN analytics a ON p.id = a.product_id
GROUP BY p.id, p.name;

-- View: Daily sales summary
CREATE OR REPLACE VIEW daily_sales_summary AS
SELECT
  DATE(created_at) as sale_date,
  COUNT(*) as total_orders,
  SUM(total) as total_revenue,
  AVG(total) as average_order_value,
  COUNT(DISTINCT customer_id) as unique_customers
FROM orders
WHERE payment_status = 'paid'
GROUP BY DATE(created_at)
ORDER BY sale_date DESC;

-- ============================================================
-- DONE! Schema Enhanced Successfully
-- ============================================================
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Verify all tables and indexes are created
-- 3. Test the triggers by creating a test order
-- 4. Check that customer metrics update correctly
-- ============================================================
