-- Add More Products to Database
-- Run this in Supabase SQL Editor to add 15 more products

INSERT INTO products (name, description, price, category, flavor, ingredients, nutrition_info, image_url, stock) VALUES

-- Protein Powders
(
  'Strawberry Banana Fusion',
  'Delicious blend of strawberry and banana with premium plant protein',
  31.99,
  'protein-powder',
  'strawberry',
  'Pea Protein Isolate, Rice Protein, Strawberry Powder, Banana Powder, Natural Flavors, Stevia',
  '{"servingSize": "30g", "calories": 118, "protein": "21g", "carbs": "6g", "fat": "2g", "fiber": "4g", "sugar": "2g"}',
  'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600',
  95
),
(
  'Mocha Coffee Protein',
  'Perfect morning boost with coffee and rich chocolate flavor',
  35.99,
  'protein-powder',
  'coffee',
  'Pea Protein, Hemp Protein, Coffee Extract, Cocoa Powder, MCT Oil, Natural Mocha Flavor',
  '{"servingSize": "32g", "calories": 125, "protein": "22g", "carbs": "5g", "fat": "3g", "fiber": "3g", "sugar": "1g"}',
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600',
  78
),
(
  'Tropical Mango Paradise',
  'Exotic mango flavor with coconut for a tropical experience',
  33.99,
  'protein-powder',
  'mango',
  'Pea Protein Isolate, Mango Powder, Coconut Powder, Pineapple Powder, Natural Tropical Flavor',
  '{"servingSize": "30g", "calories": 122, "protein": "20g", "carbs": "7g", "fat": "2.5g", "fiber": "4g", "sugar": "3g"}',
  'https://images.unsplash.com/photo-1587334206515-1e4a5c3c0881?w=600',
  110
),
(
  'Peanut Butter Chocolate',
  'Classic combo of peanut butter and chocolate in one scoop',
  36.99,
  'protein-powder',
  'peanut-butter',
  'Pea Protein, Peanut Powder, Cocoa Powder, Himalayan Salt, Natural Peanut Flavor, Stevia',
  '{"servingSize": "33g", "calories": 135, "protein": "23g", "carbs": "6g", "fat": "4g", "fiber": "3g", "sugar": "2g"}',
  'https://images.unsplash.com/photo-1589227365533-cee630ffa96b?w=600',
  88
),
(
  'Cinnamon Roll Delight',
  'Sweet cinnamon flavor reminiscent of fresh baked goods',
  34.99,
  'protein-powder',
  'cinnamon',
  'Pea Protein, Rice Protein, Cinnamon, Vanilla Extract, Coconut Sugar, Natural Spice Blend',
  '{"servingSize": "31g", "calories": 128, "protein": "21g", "carbs": "7g", "fat": "2.5g", "fiber": "4g", "sugar": "3g"}',
  'https://images.unsplash.com/photo-1509365390449-ba87fd0c8a0b?w=600',
  92
),
(
  'Salted Caramel Dream',
  'Indulgent salted caramel without the guilt',
  37.99,
  'protein-powder',
  'caramel',
  'Pea Protein Isolate, Coconut Sugar, Sea Salt, Natural Caramel Flavor, Sunflower Lecithin',
  '{"servingSize": "32g", "calories": 132, "protein": "22g", "carbs": "6g", "fat": "3g", "fiber": "3g", "sugar": "2g"}',
  'https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=600',
  75
),

-- Protein Bars
(
  'Chocolate Chip Cookie Dough Bar',
  'Soft and chewy protein bar with chocolate chips',
  3.99,
  'protein-bar',
  'chocolate',
  'Pea Protein, Almond Butter, Chocolate Chips, Dates, Vanilla, Sea Salt',
  '{"servingSize": "60g", "calories": 220, "protein": "15g", "carbs": "24g", "fat": "8g", "fiber": "6g", "sugar": "10g"}',
  'https://images.unsplash.com/photo-1604908815097-cc51e9efa2f4?w=600',
  150
),
(
  'Peanut Butter Crunch Bar',
  'Crunchy peanut butter protein bar with whole peanuts',
  3.99,
  'protein-bar',
  'peanut-butter',
  'Peanut Butter, Pea Protein, Peanuts, Brown Rice Syrup, Sea Salt',
  '{"servingSize": "55g", "calories": 210, "protein": "14g", "carbs": "20g", "fat": "9g", "fiber": "5g", "sugar": "8g"}',
  'https://images.unsplash.com/photo-1606312619070-d48b4f0b1f73?w=600',
  140
),
(
  'Berry Almond Bliss Bar',
  'Mixed berries and almonds for a fruity protein boost',
  4.29,
  'protein-bar',
  'berry',
  'Almond Butter, Pea Protein, Dried Berries, Dates, Almonds, Natural Berry Flavor',
  '{"servingSize": "58g", "calories": 215, "protein": "13g", "carbs": "26g", "fat": "7g", "fiber": "7g", "sugar": "12g"}',
  'https://images.unsplash.com/photo-1521986329282-0436c1f1e212?w=600',
  125
),

-- Ready-to-Drink Shakes
(
  'Vanilla Cream Shake',
  'Creamy ready-to-drink vanilla protein shake',
  5.99,
  'ready-to-drink',
  'vanilla',
  'Filtered Water, Pea Protein, Vanilla Extract, Coconut Cream, Natural Flavors, Stevia',
  '{"servingSize": "325ml", "calories": 160, "protein": "20g", "carbs": "8g", "fat": "4g", "fiber": "2g", "sugar": "3g"}',
  'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600',
  80
),
(
  'Chocolate Fudge Shake',
  'Rich chocolate protein shake ready to drink',
  5.99,
  'ready-to-drink',
  'chocolate',
  'Filtered Water, Pea Protein, Cocoa Powder, Coconut Cream, Dates, Natural Chocolate Flavor',
  '{"servingSize": "325ml", "calories": 170, "protein": "21g", "carbs": "9g", "fat": "5g", "fiber": "3g", "sugar": "4g"}',
  'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=600',
  72
),
(
  'Coffee Mocha Shake',
  'Cold brew coffee meets chocolate protein',
  6.49,
  'ready-to-drink',
  'coffee',
  'Cold Brew Coffee, Pea Protein, Cocoa, Coconut Cream, MCT Oil, Natural Mocha Flavor',
  '{"servingSize": "325ml", "calories": 175, "protein": "22g", "carbs": "7g", "fat": "6g", "fiber": "2g", "sugar": "2g"}',
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600',
  68
),

-- Protein Snacks
(
  'Chocolate Protein Bites',
  'Bite-sized energy balls with chocolate and dates',
  8.99,
  'protein-snack',
  'chocolate',
  'Dates, Pea Protein, Cocoa Powder, Almond Butter, Chia Seeds, Coconut Flakes',
  '{"servingSize": "40g (4 bites)", "calories": 180, "protein": "10g", "carbs": "22g", "fat": "6g", "fiber": "5g", "sugar": "14g"}',
  'https://images.unsplash.com/photo-1599785209796-786432b228bc?w=600',
  95
),
(
  'Coconut Vanilla Clusters',
  'Crunchy protein clusters with coconut and vanilla',
  9.99,
  'protein-snack',
  'vanilla',
  'Pea Protein, Coconut Flakes, Almonds, Vanilla, Maple Syrup, Pumpkin Seeds',
  '{"servingSize": "45g", "calories": 195, "protein": "12g", "carbs": "18g", "fat": "8g", "fiber": "6g", "sugar": "10g"}',
  'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600',
  85
),
(
  'Peanut Butter Protein Balls',
  'No-bake protein balls with peanut butter and oats',
  8.49,
  'protein-snack',
  'peanut-butter',
  'Peanut Butter, Pea Protein, Oats, Honey, Chia Seeds, Dark Chocolate Chips',
  '{"servingSize": "40g (3 balls)", "calories": 188, "protein": "11g", "carbs": "20g", "fat": "7g", "fiber": "5g", "sugar": "11g"}',
  'https://images.unsplash.com/photo-1606890737921-894a43ff269f?w=600',
  105
);
