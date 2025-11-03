import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, productId } = await request.json();

    if (!email || !productId) {
      return NextResponse.json({ error: 'Email and product ID are required' }, { status: 400 });
    }

    // Check if user has purchased this product
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('contact', email)
      .eq('status', 'completed');

    if (orderError) {
      console.error('Error checking orders:', orderError);
      return NextResponse.json({ error: 'Failed to verify purchase' }, { status: 500 });
    }

    // Check if any of the orders contain this product
    let hasPurchased = false;
    let purchaseDate = null;

    if (orders && orders.length > 0) {
      for (const order of orders) {
        const products = order.products || [];
        const foundProduct = products.find((item: any) => item.product?.id === productId);
        if (foundProduct) {
          hasPurchased = true;
          purchaseDate = order.created_at;
          break;
        }
      }
    }

    if (!hasPurchased) {
      return NextResponse.json({
        verified: false,
        message: 'No purchase found for this product with the provided email address.'
      }, { status: 200 });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token in a temporary table or use a simple in-memory store
    // For now, we'll return the token (in production, you'd send it via email)

    return NextResponse.json({
      verified: true,
      hasPurchased: true,
      purchaseDate,
      verificationToken,
      expiresAt: expiresAt.toISOString(),
      message: 'Purchase verified! You can now submit your review.'
    });

  } catch (error) {
    console.error('Error in verify-purchase endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
