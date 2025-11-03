-- Update Database to Support Multiple Product Images
-- Run this in Supabase SQL Editor

-- Add images column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS images JSONB;

-- Update existing products with multiple images
-- Sample image URLs for demonstration (main product, result, package, back label)

UPDATE products SET images = '{
  "main": "https://images.unsplash.com/photo-1571768804490-d6fe432e2dd4?w=600",
  "result": "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600",
  "package": "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=600",
  "back": "https://images.unsplash.com/photo-1607623814439-5669e235e693?w=600"
}'::jsonb WHERE name = 'Vanilla Protein Blast';

UPDATE products SET images = '{
  "main": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600",
  "result": "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600",
  "package": "https://images.unsplash.com/photo-1521986329282-0436c1f1e212?w=600",
  "back": "https://images.unsplash.com/photo-1607623814439-5669e235e693?w=600"
}'::jsonb WHERE name = 'Berry Blast Protein';

UPDATE products SET images = '{
  "main": "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600",
  "result": "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=600",
  "package": "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600",
  "back": "https://images.unsplash.com/photo-1607623814439-5669e235e693?w=600"
}'::jsonb WHERE name = 'Chocolate Peanut Power';

UPDATE products SET images = '{
  "main": "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=600",
  "result": "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600",
  "package": "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=600",
  "back": "https://images.unsplash.com/photo-1607623814439-5669e235e693?w=600"
}'::jsonb WHERE name = 'Green Superfood Protein';

-- Add images to new products
UPDATE products SET images = '{
  "main": "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600",
  "result": "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600",
  "package": "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=600",
  "back": "https://images.unsplash.com/photo-1607623814439-5669e235e693?w=600"
}'::jsonb WHERE name = 'Strawberry Banana Fusion';

UPDATE products SET images = '{
  "main": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600",
  "result": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600",
  "package": "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=600",
  "back": "https://images.unsplash.com/photo-1607623814439-5669e235e693?w=600"
}'::jsonb WHERE name = 'Mocha Coffee Protein';

UPDATE products SET images = '{
  "main": "https://images.unsplash.com/photo-1587334206515-1e4a5c3c0881?w=600",
  "result": "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600",
  "package": "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=600",
  "back": "https://images.unsplash.com/photo-1607623814439-5669e235e693?w=600"
}'::jsonb WHERE name = 'Tropical Mango Paradise';

-- Protein Bars
UPDATE products SET images = '{
  "main": "https://images.unsplash.com/photo-1604908815097-cc51e9efa2f4?w=600",
  "result": "https://images.unsplash.com/photo-1606312619070-d48b4f0b1f73?w=600",
  "package": "https://images.unsplash.com/photo-1521986329282-0436c1f1e212?w=600",
  "back": "https://images.unsplash.com/photo-1607623814439-5669e235e693?w=600"
}'::jsonb WHERE category = 'protein-bar';

-- Ready to Drink
UPDATE products SET images = '{
  "main": "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600",
  "result": "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=600",
  "package": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600",
  "back": "https://images.unsplash.com/photo-1607623814439-5669e235e693?w=600"
}'::jsonb WHERE category = 'ready-to-drink';

-- Protein Snacks
UPDATE products SET images = '{
  "main": "https://images.unsplash.com/photo-1599785209796-786432b228bc?w=600",
  "result": "https://images.unsplash.com/photo-1606890737921-894a43ff269f?w=600",
  "package": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600",
  "back": "https://images.unsplash.com/photo-1607623814439-5669e235e693?w=600"
}'::jsonb WHERE category = 'protein-snack';
