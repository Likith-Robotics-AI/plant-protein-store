// @ts-nocheck
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function UpdatePricesPage() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const updatePrices = async () => {
    setLoading(true);
    setStatus('Updating prices...');

    try {
      // Get all products
      const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('*');

      if (fetchError) throw fetchError;

      if (!products) {
        setStatus('No products found');
        setLoading(false);
        return;
      }

      // Update each product with new price around £12
      const priceMap: { [key: string]: number } = {
        'Vanilla Protein Blast': 11.99,
        'Berry Blast Protein': 12.49,
        'Chocolate Peanut Power': 12.99,
        'Green Superfood Protein': 11.49,
      };

      let updated = 0;
      for (const product of products) {
        const newPrice = priceMap[product.name] || 12.99;

        const { error } = await supabase
          .from('products')
          .update({ price: newPrice })
          .eq('id', product.id);

        if (error) {
          console.error(`Error updating ${product.name}:`, error);
        } else {
          updated++;
        }
      }

      setStatus(`Successfully updated ${updated} products!`);
    } catch (error) {
      console.error('Error:', error);
      setStatus(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Update Product Prices</h1>

        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-bold text-blue-900 mb-2">New Prices (per kg):</h2>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Vanilla Protein Blast: £11.99</li>
            <li>• Berry Blast Protein: £12.49</li>
            <li>• Chocolate Peanut Power: £12.99</li>
            <li>• Green Superfood Protein: £11.49</li>
            <li>• Other products: £12.99</li>
          </ul>
        </div>

        <button
          onClick={updatePrices}
          disabled={loading}
          className="w-full bg-primary-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-4"
        >
          {loading ? 'Updating...' : 'Update All Prices'}
        </button>

        {status && (
          <div className={`p-4 rounded-lg ${
            status.includes('Error')
              ? 'bg-red-50 text-red-800 border border-red-200'
              : status.includes('Successfully')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {status}
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p>This will update all products in your Supabase database to have prices around £12 per kg.</p>
          <p className="mt-2">After updating, you can view the products at <a href="/products" className="text-primary-600 hover:underline">/products</a></p>
        </div>
      </div>
    </div>
  );
}
