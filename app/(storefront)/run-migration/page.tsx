'use client';

import { useState } from 'react';
import { Copy, CheckCircle, ExternalLink } from 'lucide-react';

export default function RunMigrationPage() {
  const [copied, setCopied] = useState(false);

  const migrationSQL = `-- Customer Authentication System Migration (Fixed)
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
COMMENT ON VIEW customer_order_history IS 'Customer order history with customer profile email';`;

  const handleCopy = () => {
    navigator.clipboard.writeText(migrationSQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dashboardUrl = 'https://supabase.com/dashboard/project/twuhmpldymazfszqmuvx/sql';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-black text-gray-900 mb-4">
            Run Database Migration
          </h1>
          <p className="text-gray-600 mb-6">
            Follow these steps to set up the customer authentication system in your database:
          </p>

          {/* Instructions */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Step-by-Step Instructions:</h2>
            <ol className="space-y-3 text-blue-900">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <span>Click the button below to copy the migration SQL to your clipboard</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <span>Open your Supabase SQL Editor (link below)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <span>Click "New Query" in the SQL Editor</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </span>
                <span>Paste the SQL into the editor</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  5
                </span>
                <span>Click "Run" or press Ctrl+Enter</span>
              </li>
            </ol>
          </div>

          {/* Copy Button */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleCopy}
              className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-3"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Migration SQL
                </>
              )}
            </button>

            <a
              href={dashboardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-all font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-3"
            >
              <ExternalLink className="w-5 h-5" />
              Open SQL Editor
            </a>
          </div>

          {/* SQL Preview */}
          <div className="mt-6">
            <h3 className="text-sm font-bold text-gray-700 mb-2">SQL Preview:</h3>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
              <pre className="text-xs font-mono">{migrationSQL}</pre>
            </div>
          </div>

          {/* What This Does */}
          <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-green-900 mb-3">What This Migration Does:</h3>
            <ul className="space-y-2 text-green-900 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Adds password_hash, email_verified, and last_login columns to customers table</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Creates wishlist table for customer saved items</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Creates customer_addresses table for saved addresses</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Creates customer_sessions table for JWT token management</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Adds performance indexes and Row Level Security policies</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
