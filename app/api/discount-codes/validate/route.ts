import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { DiscountCode } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || typeof subtotal !== 'number') {
      return NextResponse.json({ error: 'Code and subtotal are required' }, { status: 400 });
    }

    // Fetch discount code from database
    const { data: discountCodes, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !discountCodes) {
      return NextResponse.json(
        { valid: false, error: 'Invalid or expired discount code' },
        { status: 200 }
      );
    }

    const discount: DiscountCode = discountCodes as DiscountCode;

    // Validate expiry date
    const now = new Date();
    const validFrom = new Date(discount.valid_from);
    const validUntil = new Date(discount.valid_until);

    if (now < validFrom || now > validUntil) {
      return NextResponse.json(
        { valid: false, error: 'This discount code has expired' },
        { status: 200 }
      );
    }

    // Validate usage limit
    if (discount.usage_limit && discount.times_used >= discount.usage_limit) {
      return NextResponse.json(
        { valid: false, error: 'This discount code has reached its usage limit' },
        { status: 200 }
      );
    }

    // Validate minimum purchase amount
    if (discount.min_purchase_amount && subtotal < discount.min_purchase_amount) {
      return NextResponse.json(
        {
          valid: false,
          error: `Minimum purchase of £${discount.min_purchase_amount.toFixed(2)} required`,
        },
        { status: 200 }
      );
    }

    // Calculate discount amount
    let discountAmount = 0;

    if (discount.type === 'percentage') {
      discountAmount = (subtotal * discount.value) / 100;

      // Apply max discount cap if set
      if (discount.max_discount_amount && discountAmount > discount.max_discount_amount) {
        discountAmount = discount.max_discount_amount;
      }
    } else {
      // Fixed amount
      discountAmount = discount.value;
    }

    // Ensure discount doesn't exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    return NextResponse.json({
      valid: true,
      code: discount.code,
      description: discount.description,
      discountAmount,
      type: discount.type,
      value: discount.value,
    });
  } catch (error) {
    console.error('Error validating discount code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
