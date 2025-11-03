-- Update all product prices to around £12 per kg (base price for 1kg)
UPDATE products SET price = 11.99 WHERE name = 'Vanilla Protein Blast';
UPDATE products SET price = 12.49 WHERE name = 'Berry Blast Protein';
UPDATE products SET price = 12.99 WHERE name = 'Chocolate Peanut Power';
UPDATE products SET price = 11.49 WHERE name = 'Green Superfood Protein';

-- If you have additional products from add-more-products.sql, update them too:
UPDATE products SET price = 12.99 WHERE category = 'protein-powder' AND price > 20;
UPDATE products SET price = 11.99 WHERE category = 'protein-bar' AND price > 20;
UPDATE products SET price = 13.49 WHERE category = 'ready-to-drink' AND price > 20;
