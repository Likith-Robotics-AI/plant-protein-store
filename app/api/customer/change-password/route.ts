// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { hashPassword, verifyPassword, validatePassword } from '@/lib/auth-utils';

export async function PUT(request: NextRequest) {
  try {
    const { customer_id, current_password, new_password } = await request.json();

    // Validation
    if (!customer_id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    if (!current_password) {
      return NextResponse.json(
        { success: false, error: 'Current password is required' },
        { status: 400 }
      );
    }

    if (!new_password) {
      return NextResponse.json(
        { success: false, error: 'New password is required' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(new_password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.error },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get customer with password hash
    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('id, password_hash')
      .eq('id', customer_id)
      .single();

    if (fetchError || !customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isValidPassword = await verifyPassword(current_password, customer.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(new_password);

    // Update password
    const { error: updateError } = await supabase
      .from('customers')
      .update({
        password_hash: newPasswordHash,
      })
      .eq('id', customer_id);

    if (updateError) {
      console.error('Password update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error: any) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
