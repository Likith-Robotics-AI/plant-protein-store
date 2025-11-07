'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Trash2, ShoppingCart, ArrowLeft, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { WishlistItem } from '@/lib/types';

export default function WishlistPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && customer) {
      fetchWishlist();
    }
  }, [isAuthenticated, customer]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch(`/api/wishlist?customer_id=${customer?.id}`);
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    setRemovingIds(new Set(removingIds).add(itemId));

    try {
      const response = await fetch(`/api/wishlist/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWishlistItems(wishlistItems.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    } finally {
      const newSet = new Set(removingIds);
      newSet.delete(itemId);
      setRemovingIds(newSet);
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    if (item.product) {
      addToCart(item.product, 1); // Default to 1kg
    }
  };

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Account
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-600 fill-red-600" />
                My Wishlist
              </h1>
              <p className="text-gray-600">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>
        </div>

        {/* Wishlist Grid */}
        {loadingWishlist ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your wishlist...</p>
          </div>
        ) : wishlistItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => {
              if (!item.product) return null;

              const isRemoving = removingIds.has(item.id);

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all ${
                    isRemoving ? 'opacity-50' : ''
                  }`}
                >
                  {/* Product Image */}
                  <Link href={`/products/${item.product.id}`} className="block relative h-64 bg-gray-100">
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                    {item.product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Product Details */}
                  <div className="p-5">
                    <Link href={`/products/${item.product.id}`}>
                      <h3 className="font-black text-gray-900 text-lg mb-2 hover:text-primary-700 transition">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.product.description}
                    </p>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {item.product.category}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {item.product.flavor}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-2xl font-black text-primary-700">
                          £{item.product.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">per kg</p>
                      </div>
                      {item.product.stock > 0 && (
                        <div className="text-sm">
                          <span className={`font-bold ${
                            item.product.stock < 10 ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {item.product.stock} in stock
                          </span>
                        </div>
                      )}
                    </div>

                    {item.notes && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-xs text-gray-700 italic">
                          Note: {item.notes}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={item.product.stock === 0 || isRemoving}
                        className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={isRemoving}
                        className="bg-red-50 text-red-600 p-3 rounded-lg hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove from wishlist"
                      >
                        {isRemoving ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">
              Save your favorite products to easily find them later
            </p>
            <Link
              href="/products"
              className="inline-block bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-bold shadow-md hover:shadow-lg"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
