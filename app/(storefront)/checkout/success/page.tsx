'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle className="w-24 h-24 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>

        <p className="text-gray-600 mb-2">
          Thank you for your order. Your order has been received and is being processed.
        </p>

        {orderId && (
          <p className="text-sm text-gray-500 mb-8">
            Order ID: <span className="font-mono font-semibold">{orderId}</span>
          </p>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-blue-800">
            <strong>Mock Checkout:</strong> This was a demonstration order. No actual payment was processed.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push('/')}
            className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
