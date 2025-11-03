-- Plant Protein Store Database Schema
-- Run this in your Supabase SQL Editor

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  flavor TEXT NOT NULL,
  ingredients TEXT NOT NULL,
  nutrition_info JSONB NOT NULL,
  image_url TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  products JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  page TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_flavor ON products(flavor);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_product_id ON analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert to orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert to analytics" ON analytics
  FOR INSERT WITH CHECK (true);

-- Note: For the admin dashboard, you'll need to use the service role key
-- or create an admin authentication system with appropriate policies

-- Insert sample products (prices are per kg)
INSERT INTO products (name, description, price, category, flavor, ingredients, nutrition_info, image_url, stock) VALUES
(
  'Vanilla Protein Blast',
  'Smooth vanilla protein powder blended with banana and mango powder for a tropical twist',
  11.99,
  'protein-powder',
  'vanilla',
  'Pea Protein Isolate, Brown Rice Protein, Banana Powder, Mango Powder, Natural Vanilla Extract, Monk Fruit Sweetener',
  '{"servingSize": "30g", "calories": 120, "protein": "22g", "carbs": "5g", "fat": "2g", "fiber": "3g", "sugar": "1g"}',
  'https://images.unsplash.com/photo-1571768804490-d6fe432e2dd4?w=600',
  100
),
(
  'Berry Blast Protein',
  'Mixed berry flavored protein with strawberry, blueberry, and raspberry powder',
  12.49,
  'protein-powder',
  'berry',
  'Pea Protein Isolate, Hemp Protein, Strawberry Powder, Blueberry Powder, Raspberry Powder, Natural Berry Flavor, Stevia',
  '{"servingSize": "30g", "calories": 115, "protein": "20g", "carbs": "6g", "fat": "2.5g", "fiber": "4g", "sugar": "2g"}',
  'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600',
  85
),
(
  'Chocolate Peanut Power',
  'Rich chocolate protein with peanut powder for extra flavor and nutrition',
  12.99,
  'protein-powder',
  'chocolate',
  'Pea Protein Concentrate, Peanut Powder, Cocoa Powder, Coconut Sugar, Himalayan Pink Salt, Natural Chocolate Flavor',
  '{"servingSize": "32g", "calories": 130, "protein": "21g", "carbs": "7g", "fat": "3g", "fiber": "3g", "sugar": "3g"}',
  'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600',
  120
),
(
  'Green Superfood Protein',
  'Plant protein enriched with spirulina, matcha, and apple powder',
  11.49,
  'protein-powder',
  'green',
  'Pea Protein Isolate, Spirulina, Matcha Green Tea Powder, Apple Powder, Spinach Powder, Chlorella, Natural Mint Flavor',
  '{"servingSize": "30g", "calories": 110, "protein": "23g", "carbs": "4g", "fat": "1.5g", "fiber": "5g", "sugar": "0g"}',
  'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=600',
  60
);

-- Storage bucket for product images (run this if using Supabase Storage)
-- You'll need to create this bucket in the Supabase dashboard under Storage
-- Bucket name: product-images
-- Set it to public for easy image access
