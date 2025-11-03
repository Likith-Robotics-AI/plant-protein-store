-- ============================================
-- LIVOZA Plant Protein - Reviews System Schema
-- ============================================
-- Features: Auto-approved reviews, Email collection (GDPR), Photo uploads, Discount incentives
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. CREATE REVIEWS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,

  -- User Information (Email required for GDPR compliance and verification)
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,

  -- Review Content
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,

  -- Photo Uploads (Array of Supabase Storage URLs)
  photo_urls TEXT[], -- e.g., ['review-photos/abc123.jpg', 'review-photos/def456.jpg']

  -- Trust Signals
  verified_purchase BOOLEAN DEFAULT false,
  purchase_date DATE,

  -- Social Proof (Helpful voting)
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,

  -- Review Moderation (Auto-approved by default per your choice)
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,

  -- Discount Incentive (10% off code generated after submission)
  discount_code TEXT UNIQUE, -- e.g., 'REVIEW-ABC123'
  discount_used BOOLEAN DEFAULT false,
  discount_expires_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_discount_code ON reviews(discount_code) WHERE discount_code IS NOT NULL;

-- Composite index for most common query (product reviews that are approved)
CREATE INDEX IF NOT EXISTS idx_reviews_product_approved
  ON reviews(product_id, status, created_at DESC)
  WHERE status = 'approved';

-- ============================================
-- 3. ADD REVIEW AGGREGATES TO PRODUCTS TABLE
-- ============================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS average_rating DECIMAL(2,1) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Update existing products to have 0 rating
UPDATE products SET average_rating = 0, review_count = 0
WHERE average_rating IS NULL OR review_count IS NULL;

-- ============================================
-- 4. CREATE TRIGGER TO AUTO-UPDATE PRODUCT RATINGS
-- ============================================

CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update average rating and count for the product
  UPDATE products SET
    average_rating = (
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
      FROM reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND status = 'approved'
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND status = 'approved'
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger on INSERT, UPDATE, DELETE
CREATE TRIGGER update_product_rating_trigger
AFTER INSERT OR UPDATE OF status, rating OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- ============================================
-- 5. CREATE FUNCTION TO AUTO-UPDATE UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public can read approved reviews
CREATE POLICY "Public read approved reviews" ON reviews
  FOR SELECT USING (status = 'approved');

-- Anyone can submit reviews (auto-approved)
CREATE POLICY "Anyone can submit reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- Users can update their own reviews (by email)
CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Admin can do everything (requires service role key in admin dashboard)
-- No policy needed - use service role key for admin operations

-- ============================================
-- 7. CREATE STORAGE BUCKET FOR REVIEW PHOTOS
-- ============================================

-- NOTE: You need to manually create this bucket in Supabase Dashboard:
-- 1. Go to Storage → Create Bucket
-- 2. Name: "review-photos"
-- 3. Set to PUBLIC (so photos are accessible)
-- 4. Max file size: 5MB

-- Example path: review-photos/[product_id]/[timestamp]-[random].jpg

-- ============================================
-- 8. SEED REALISTIC UK CUSTOMER REVIEWS
-- ============================================

-- Helper function to generate discount codes
CREATE OR REPLACE FUNCTION generate_review_discount_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'REVIEW-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Seed reviews for each product (10-15 per product)
DO $$
DECLARE
  product_record RECORD;
  discount_code TEXT;
BEGIN
  FOR product_record IN SELECT id, name FROM products LOOP
    -- Review 1 (5 stars)
    discount_code := generate_review_discount_code();
    INSERT INTO reviews (product_id, user_name, user_email, rating, title, comment, verified_purchase, status, discount_code, discount_expires_at, created_at) VALUES
    (product_record.id, 'Sarah M.', 'sarah.m@example.com', 5,
     'Best ' || SPLIT_PART(product_record.name, ' ', 1) || ' protein I''ve tried!',
     'Absolutely love this! Mixes smoothly with oat milk and doesn''t have that chalky texture some protein powders have. Been using it for 3 weeks post-workout and already seeing results. Delivery was quick to London. Will definitely buy again!',
     true, 'approved', discount_code, NOW() + INTERVAL '30 days', NOW() - INTERVAL '5 days');

    -- Review 2 (5 stars with photo)
    discount_code := generate_review_discount_code();
    INSERT INTO reviews (product_id, user_name, user_email, rating, title, comment, verified_purchase, status, discount_code, discount_expires_at, helpful_count, created_at) VALUES
    (product_record.id, 'James P.', 'james.p@example.com', 5,
     'Tastes amazing, great macros',
     'Coming from whey protein, I was skeptical about plant-based. This completely changed my mind. Taste is fantastic, 22g protein per serving, and I actually feel better after switching. My gym mates have all asked what I''m using!',
     true, 'approved', discount_code, NOW() + INTERVAL '30 days', 12, NOW() - INTERVAL '12 days');

    -- Review 3 (4 stars)
    discount_code := generate_review_discount_code();
    INSERT INTO reviews (product_id, user_name, user_email, rating, title, comment, verified_purchase, status, discount_code, discount_expires_at, helpful_count, created_at) VALUES
    (product_record.id, 'Emma L.', 'emma.l@example.com', 4,
     'Really good, slightly pricey',
     'Quality is excellent and I love the plant-based aspect. Only reason for 4 stars instead of 5 is the price - it''s a bit more expensive than other brands. That said, you get what you pay for, and this is premium quality.',
     true, 'approved', discount_code, NOW() + INTERVAL '30 days', 8, NOW() - INTERVAL '18 days');

    -- Review 4 (5 stars - vegan perspective)
    discount_code := generate_review_discount_code();
    INSERT INTO reviews (product_id, user_name, user_email, rating, title, comment, verified_purchase, status, discount_code, discount_expires_at, helpful_count, created_at) VALUES
    (product_record.id, 'Priya K.', 'priya.k@example.com', 5,
     'Perfect for vegan diet',
     'Been vegan for 2 years and struggled to find a protein powder that actually tastes good. This is a game-changer. No weird aftertaste, mixes well in smoothies, and the nutritional profile is spot on. Highly recommend!',
     true, 'approved', discount_code, NOW() + INTERVAL '30 days', 15, NOW() - INTERVAL '22 days');

    -- Review 5 (5 stars - athlete)
    discount_code := generate_review_discount_code();
    INSERT INTO reviews (product_id, user_name, user_email, rating, title, comment, verified_purchase, status, discount_code, discount_expires_at, helpful_count, created_at) VALUES
    (product_record.id, 'Mark T.', 'mark.t@example.com', 5,
     'Fueling my marathon training',
     'Training for London Marathon and needed clean protein. This ticks all boxes - great taste, clean ingredients, and I''ve noticed faster recovery times. The 5kg bag is brilliant value for money.',
     true, 'approved', discount_code, NOW() + INTERVAL '30 days', 9, NOW() - INTERVAL '28 days');

    -- Review 6 (4 stars - texture comment)
    discount_code := generate_review_discount_code();
    INSERT INTO reviews (product_id, user_name, user_email, rating, title, comment, verified_purchase, status, discount_code, discount_expires_at, helpful_count, created_at) VALUES
    (product_record.id, 'Rachel W.', 'rachel.w@example.com', 4,
     'Good taste, slightly grainy',
     'Overall very pleased. Taste is much better than expected for plant protein. Texture is slightly grainier than whey but nothing a good shake can''t fix. Great protein content and love that it''s sustainable.',
     true, 'approved', discount_code, NOW() + INTERVAL '30 days', 6, NOW() - INTERVAL '35 days');

    -- Review 7 (5 stars - weight loss)
    discount_code := generate_review_discount_code();
    INSERT INTO reviews (product_id, user_name, user_email, rating, title, comment, verified_purchase, status, discount_code, discount_expires_at, helpful_count, created_at) VALUES
    (product_record.id, 'Tom H.', 'tom.h@example.com', 5,
     'Helping with my weight loss journey',
     'Down 8kg in 6 weeks using this as meal replacement for breakfast. Keeps me full until lunch, tastes great with almond milk, and low in calories. Customer service was also brilliant when I had a question about ingredients.',
     true, 'approved', discount_code, NOW() + INTERVAL '30 days', 18, NOW() - INTERVAL '40 days');

    -- Review 8 (5 stars - family use)
    discount_code := generate_review_discount_code();
    INSERT INTO reviews (product_id, user_name, user_email, rating, title, comment, verified_purchase, status, discount_code, discount_expires_at, helpful_count, created_at) VALUES
    (product_record.id, 'Lisa B.', 'lisa.b@example.com', 5,
     'Whole family loves it!',
     'Bought the 5kg bag and we''re all hooked. My teenage son uses it post-football training, I have it in my morning smoothie, and even my husband (who''s picky) enjoys it. Brilliant value for a family of 4.',
     true, 'approved', discount_code, NOW() + INTERVAL '30 days', 11, NOW() - INTERVAL '45 days');

    -- Review 9 (4 stars - flavor specific)
    discount_code := generate_review_discount_code();
    INSERT INTO reviews (product_id, user_name, user_email, rating, title, comment, verified_purchase, status, discount_code, discount_expires_at, helpful_count, created_at) VALUES
    (product_record.id, 'Dan S.', 'dan.s@example.com', 4,
     'Great protein, wish more flavours',
     'Quality is top-notch. Would love to see more flavor options in future - maybe salted caramel? That said, current flavors are really good and not too sweet. Mixes easily even with just a spoon.',
     true, 'approved', discount_code, NOW() + INTERVAL '30 days', 7, NOW() - INTERVAL '50 days');

    -- Review 10 (5 stars - digestibility)
    discount_code := generate_review_discount_code();
    INSERT INTO reviews (product_id, user_name, user_email, rating, title, comment, verified_purchase, status, discount_code, discount_expires_at, helpful_count, created_at) VALUES
    (product_record.id, 'Sophie C.', 'sophie.c@example.com', 5,
     'Easy on the stomach',
     'I have a sensitive stomach and most protein powders cause bloating. Not this one! Sits perfectly, no digestive issues whatsoever. The pea protein isolate is clearly high quality. Received in Manchester within 2 days.',
     true, 'approved', discount_code, NOW() + INTERVAL '30 days', 13, NOW() - INTERVAL '55 days');

  END LOOP;
END $$;

-- ============================================
-- 9. HELPFUL STATISTICS QUERIES (For Reference)
-- ============================================

-- Get all reviews for a product with user info
-- SELECT * FROM reviews WHERE product_id = 'xxx' AND status = 'approved' ORDER BY created_at DESC;

-- Get rating distribution for a product
-- SELECT rating, COUNT(*) as count
-- FROM reviews
-- WHERE product_id = 'xxx' AND status = 'approved'
-- GROUP BY rating
-- ORDER BY rating DESC;

-- Get products with highest ratings
-- SELECT name, average_rating, review_count
-- FROM products
-- WHERE review_count > 0
-- ORDER BY average_rating DESC, review_count DESC;

-- ============================================
-- ✅ SCHEMA COMPLETE
-- ============================================
-- Next steps:
-- 1. Run this entire file in Supabase SQL Editor
-- 2. Create "review-photos" Storage bucket (manual step in Dashboard)
-- 3. Build frontend components to display and submit reviews
-- 4. Celebrate! 🎉
