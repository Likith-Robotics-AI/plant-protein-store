// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const supabase = createClient();

    // Check if session exists and is not expired
    const { data: session } = await supabase
      .from('customer_sessions')
      .select('*')
      .eq('customer_id', decoded.id)
      .eq('token_hash', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session expired or invalid' },
        { status: 401 }
      );
    }

    // Update last activity
    await supabase
      .from('customer_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', session.id);

    // Get customer data
    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (fetchError || !customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Remove password hash from response
    delete customer.password_hash;

    return NextResponse.json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
