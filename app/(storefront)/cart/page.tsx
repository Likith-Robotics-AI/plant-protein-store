'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import { Trash2, Plus, Minus, Tag } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, total } = useCart();

  // Calculate subtotal (before discounts)
  const subtotal = cart.reduce((sum, item) => {
    return sum + (item.pricePerKg * item.selectedWeight * item.quantity);
  }, 0);

  // Calculate total discount amount
  const totalDiscount = subtotal - total;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added any protein powder yet!</p>
            <button
              onClick={() => router.push('/products')}
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-bold shadow-lg hover:shadow-xl"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">{cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => {
              const basePrice = item.pricePerKg * item.selectedWeight;
              const discountedPrice = basePrice * (1 - item.appliedDiscount);
              const itemTotal = discountedPrice * item.quantity;
              const itemSavings = (basePrice - discountedPrice) * item.quantity;

              return (
                <div
                  key={`${item.product.id}-${item.selectedWeight}-${index}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-5"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden border-2 border-gray-100">
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 pr-4">
                          <h3 className="font-black text-lg text-gray-900 mb-1 line-clamp-2">
                            {item.product.name}
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="inline-flex items-center bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold">
                              Flavour: {item.product.flavor}
                            </span>
                            <span className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                              Size: {item.selectedWeight}kg
                            </span>
                            {item.appliedDiscount > 0 && (
                              <span className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                <Tag className="w-3 h-3 mr-1" />
                                {(item.appliedDiscount * 100).toFixed(0)}% OFF
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedWeight)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Price and Quantity Row */}
                      <div className="flex items-end justify-between">
                        {/* Quantity Controls */}
                        <div className="flex flex-col gap-2">
                          <span className="text-xs text-gray-500 font-medium">Quantity</span>
                          <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.selectedWeight, item.quantity - 1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4 text-gray-600" />
                            </button>
                            <span className="px-4 font-bold text-gray-900 min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.selectedWeight, item.quantity + 1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>

                        {/* Price Display */}
                        <div className="text-right">
                          {item.appliedDiscount > 0 ? (
                            <>
                              <div className="text-sm text-gray-400 line-through mb-1">
                                £{(basePrice * item.quantity).toFixed(2)}
                              </div>
                              <div className="text-2xl font-black text-primary-700">
                                £{itemTotal.toFixed(2)}
                              </div>
                              <div className="text-xs text-green-600 font-bold mt-1">
                                Save £{itemSavings.toFixed(2)}
                              </div>
                            </>
                          ) : (
                            <div className="text-2xl font-black text-gray-900">
                              £{itemTotal.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-black text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">£{subtotal.toFixed(2)}</span>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      Bulk Discount
                    </span>
                    <span className="font-bold">-£{totalDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold">FREE</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <div className="text-right">
                  <div className="text-2xl font-black text-primary-700">
                    £{total.toFixed(2)}
                  </div>
                  {totalDiscount > 0 && (
                    <div className="text-xs text-gray-500">
                      You save £{totalDiscount.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-black text-lg shadow-lg hover:shadow-xl mb-3"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => router.push('/products')}
                className="w-full border-2 border-primary-600 text-primary-600 py-4 rounded-xl hover:bg-primary-50 transition-all font-bold"
              >
                Continue Shopping
              </button>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Secure Checkout</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                  </svg>
                  <span className="font-medium">Ships in 24 hours</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Quality Guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
