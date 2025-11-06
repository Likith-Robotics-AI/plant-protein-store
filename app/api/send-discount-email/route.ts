// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Generate a random discount code
function generateDiscountCode(): string {
  const prefix = 'EARLY';
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${randomPart}`;
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, mobile, orderTotal } = await request.json();

    if (!email && !mobile) {
      return NextResponse.json(
        { error: 'Email or mobile is required' },
        { status: 400 }
      );
    }

    // Generate unique discount code
    const discountCode = generateDiscountCode();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // Valid for 30 days

    // Store the discount code in database
    const { data: discountData, error: discountError } = await supabase
      .from('discount_codes')
      .insert({
        code: discountCode,
        description: 'Early supporter discount - 15% off your order',
        type: 'percentage',
        value: 15,
        min_purchase_amount: 0,
        max_discount_amount: null,
        usage_limit: 1, // Can only be used once
        times_used: 0,
        valid_from: new Date().toISOString(),
        valid_until: expiryDate.toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (discountError) {
      console.error('Error creating discount code:', discountError);
      return NextResponse.json(
        { error: 'Failed to create discount code', details: discountError.message },
        { status: 500 }
      );
    }

    // Store the email subscription for notifications
    const { error: subscriptionError } = await supabase
      .from('email_subscriptions')
      .insert({
        email: email || null,
        phone: mobile || null,
        name: name || null,
        discount_code: discountCode,
        order_total: orderTotal || 0,
        subscribed_at: new Date().toISOString(),
        status: 'active',
      });

    // Note: Actual email sending would be done here with a service like SendGrid, Resend, etc.
    // For now, we'll return success with the discount code
    // In production, you would integrate with an email service:
    /*
    const emailResponse = await sendEmail({
      to: email,
      subject: 'Your Exclusive 15% Discount Code!',
      html: generateEmailTemplate(name, discountCode, expiryDate),
    });
    */

    return NextResponse.json({
      success: true,
      message: 'Discount code created and will be emailed shortly',
      discountCode: discountCode,
      expiryDate: expiryDate.toISOString(),
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error processing discount email:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
