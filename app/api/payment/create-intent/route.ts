import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent, formatAmountForStripe } from '@/lib/stripe';
import { CartItem } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { cart, discountAmount = 0 } = await request.json();

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { error: 'Cart is required and must contain items' },
        { status: 400 }
      );
    }

    // Calculate total from cart items
    let subtotal = 0;
    const lineItems: any[] = [];

    cart.forEach((item: CartItem) => {
      const basePrice = item.pricePerKg * item.selectedWeight;
      const discountedPrice = basePrice * (1 - item.appliedDiscount);
      const itemTotal = discountedPrice * item.quantity;

      subtotal += itemTotal;

      lineItems.push({
        productId: item.product.id,
        name: item.product.name,
        flavor: item.product.flavor,
        weight: item.selectedWeight,
        quantity: item.quantity,
        unitPrice: discountedPrice,
        total: itemTotal,
        bulkDiscount: item.appliedDiscount,
      });
    });

    // Apply discount code if present
    const finalTotal = Math.max(subtotal - discountAmount, 0);

    // Create payment intent
    const paymentIntent = await createPaymentIntent(finalTotal, 'gbp', {
      subtotal: subtotal.toFixed(2),
      discount_amount: discountAmount.toFixed(2),
      total: finalTotal.toFixed(2),
      items_count: cart.length.toString(),
      line_items: JSON.stringify(lineItems),
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: finalTotal,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
