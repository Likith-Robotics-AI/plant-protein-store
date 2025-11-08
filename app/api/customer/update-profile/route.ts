// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { validateEmail, validatePhone } from '@/lib/auth-utils';

export async function PUT(request: NextRequest) {
  try {
    const { customer_id, name, email, phone } = await request.json();

    // Validation
    if (!customer_id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (phone && !validatePhone(phone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if email is already taken by another customer
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .neq('id', customer_id)
      .single();

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, error: 'Email already in use by another account' },
        { status: 409 }
      );
    }

    // Update customer profile
    const { data: customer, error: updateError } = await supabase
      .from('customers')
      .update({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone || null,
      })
      .eq('id', customer_id)
      .select()
      .single();

    if (updateError || !customer) {
      console.error('Profile update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Remove password hash from response
    delete customer.password_hash;

    return NextResponse.json({
      success: true,
      customer,
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
