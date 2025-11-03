'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { X, ShoppingCart, Check } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export default function QuickViewModal({ product, isOpen, onClose, onAddToCart }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Reset state when modal opens with a new product
  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setAdded(false);
    }
  }, [isOpen, product]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all hover:scale-110"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
          {/* Product Image */}
          <div className="relative h-64 md:h-96 rounded-xl overflow-hidden bg-gray-100">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <div className="mb-4">
              <span className="inline-block text-xs text-primary-600 font-semibold uppercase tracking-wide bg-primary-50 px-3 py-1 rounded-full">
                {product.flavor}
              </span>
            </div>

            <h2 className="text-3xl font-black text-gray-900 mb-3">
              {product.name}
            </h2>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-black text-primary-700">
                £{product.price.toFixed(2)}
              </span>
              {product.stock > 0 && (
                <span className="text-sm text-green-600 font-semibold">
                  In Stock
                </span>
              )}
            </div>

            <p className="text-gray-600 text-base leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Key Features */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-sm text-gray-900 mb-3">Key Benefits:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>25g plant-based protein per serving</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Real fruit powder - no artificial flavors</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Naturally sweetened, zero added sugar</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>Sustainably sourced ingredients</span>
                </li>
              </ul>
            </div>

            {/* Stock Warning */}
            {product.stock < 20 && product.stock > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                <p className="text-orange-700 text-sm font-semibold">
                  ⚠️ Only {product.stock} left in stock!
                </p>
              </div>
            )}

            {product.stock === 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-700 text-sm font-semibold">
                  Out of stock
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <label className="font-semibold text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100 transition font-bold"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 font-bold border-x border-gray-300">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 hover:bg-gray-100 transition font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || added}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  added
                    ? 'bg-green-600 text-white'
                    : product.stock === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700 hover:scale-105 shadow-lg hover:shadow-xl'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
