'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle2, Package, Truck, Mail, Phone, MapPin, CreditCard, Tag, ArrowRight } from 'lucide-react';
import { Order } from '@/lib/types';

export const dynamic = 'force-dynamic';

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setError('Order ID is missing');
      setLoading(false);
      return;
    }

    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders?id=${orderId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'We couldn\'t find your order details.'}</p>
            <button
              onClick={() => router.push('/products')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const bulkDiscount = order.subtotal - (order.total + order.discount_amount);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Success Header */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Order Confirmed!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for your purchase, {order.customer_name}!
            </p>
            <div className="bg-gray-50 rounded-lg py-4 px-6 inline-block">
              <p className="text-sm text-gray-500 mb-1">Order Number</p>
              <p className="text-2xl font-black text-primary-700">#{order.id.slice(0, 8).toUpperCase()}</p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{order.email || 'No email'}</span>
                </div>
                {order.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{order.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-6">
                <Package className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-black text-gray-900">Order Items</h2>
              </div>

              <div className="space-y-4">
                {order.products.map((item, index) => {
                  const basePrice = item.pricePerKg * item.selectedWeight;
                  const discountedPrice = basePrice * (1 - item.appliedDiscount);
                  const itemTotal = discountedPrice * item.quantity;

                  return (
                    <div
                      key={`${item.product.id}-${item.selectedWeight}-${index}`}
                      className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                    >
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 border-gray-100">
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                        {item.quantity > 1 && (
                          <div className="absolute -top-1 -right-1 bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow">
                            {item.quantity}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-2">{item.product.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {item.product.flavor}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">
                            {item.selectedWeight}kg
                          </span>
                          {item.appliedDiscount > 0 && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">
                              -{(item.appliedDiscount * 100).toFixed(0)}% OFF
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-black text-primary-700">
                          £{itemTotal.toFixed(2)}
                          {item.quantity > 1 && (
                            <span className="text-xs text-gray-500 font-normal ml-1">
                              (£{discountedPrice.toFixed(2)} each)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-black text-gray-900">Shipping Address</h2>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-bold text-gray-900 mb-2">{order.shipping_address.fullName}</p>
                <div className="text-gray-600 text-sm space-y-1">
                  <p>{order.shipping_address.addressLine1}</p>
                  {order.shipping_address.addressLine2 && (
                    <p>{order.shipping_address.addressLine2}</p>
                  )}
                  <p>
                    {order.shipping_address.city}, {order.shipping_address.zipCode}
                  </p>
                  <p>{order.shipping_address.country}</p>
                  {order.shipping_address.phone && (
                    <p className="pt-2 flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      {order.shipping_address.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-semibold mb-1">
                  Estimated Delivery
                </p>
                <p className="text-sm text-blue-800">
                  Your order will be shipped within 24 hours and delivered in 2-3 business days.
                </p>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-black text-gray-900">Payment Information</h2>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-semibold text-gray-900 capitalize">
                    {order.payment_details.method === 'stripe' ? 'Credit/Debit Card' : 'Cash on Delivery'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`font-bold capitalize ${
                    order.payment_details.status === 'succeeded'
                      ? 'text-green-600'
                      : order.payment_details.status === 'pending'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}>
                    {order.payment_details.status}
                  </span>
                </div>
                {order.payment_details.paidAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Paid On</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(order.payment_details.paidAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-black text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">£{order.subtotal.toFixed(2)}</span>
                </div>

                {bulkDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Bulk Discount
                    </span>
                    <span className="font-bold">-£{bulkDiscount.toFixed(2)}</span>
                  </div>
                )}

                {order.discount_code && order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {order.discount_code}
                    </span>
                    <span className="font-bold">-£{order.discount_amount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold">FREE</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span className="font-semibold">£{order.tax_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold text-gray-900">Total Paid</span>
                <div className="text-right">
                  <div className="text-2xl font-black text-primary-700">
                    £{order.total.toFixed(2)}
                  </div>
                  {(bulkDiscount + order.discount_amount) > 0 && (
                    <div className="text-xs text-green-600 font-bold">
                      You saved £{(bulkDiscount + order.discount_amount).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => router.push('/products')}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  Continue Shopping
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => window.print()}
                  className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                >
                  Print Receipt
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  A confirmation email has been sent to <span className="font-semibold">{order.email}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="max-w-5xl mx-auto mt-8">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6">
            <h3 className="font-black text-gray-900 mb-4 text-lg">What's Next?</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-primary-700 font-black">1</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Order Processing</h4>
                <p className="text-sm text-gray-600">
                  We're preparing your order for shipment. You'll receive updates via email.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-primary-700 font-black">2</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Shipment</h4>
                <p className="text-sm text-gray-600">
                  Your order will ship within 24 hours with tracking information.
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-primary-700 font-black">3</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Delivery</h4>
                <p className="text-sm text-gray-600">
                  Expect delivery in 2-3 business days. Sign for your package upon arrival.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
