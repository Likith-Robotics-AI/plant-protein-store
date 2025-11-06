// @ts-nocheck
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { ShoppingCart } from 'lucide-react';
import { trackBuyClick, trackAddToCart } from '@/lib/analytics-tracker';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Track the click
    await trackBuyClick(product.id, window.location.pathname);

    onAddToCart(product);
  };

  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden cursor-pointer h-full flex flex-col group">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        <div className="p-4 flex-grow flex flex-col">
          <span className="text-xs text-primary-600 font-semibold uppercase tracking-wide">
            {product.flavor}
          </span>
          <h3 className="text-lg font-bold mt-1 mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between mt-auto">
            <span className="text-2xl font-bold text-primary-700">
              £{product.price.toFixed(2)}
            </span>
            <button
              onClick={handleBuyNow}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          </div>

          {product.stock < 20 && product.stock > 0 && (
            <p className="text-orange-600 text-xs mt-2">Only {product.stock} left!</p>
          )}
          {product.stock === 0 && (
            <p className="text-red-600 text-xs mt-2">Out of stock</p>
          )}
        </div>
      </div>
    </Link>
  );
}
