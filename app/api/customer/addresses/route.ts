// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// GET - Fetch all addresses for a customer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customer_id = searchParams.get('customer_id');

    if (!customer_id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('customer_id', customer_id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch addresses error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch addresses' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      addresses: addresses || [],
    });
  } catch (error: any) {
    console.error('Get addresses error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new address
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_id,
      address_type,
      is_default,
      full_name,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      phone,
    } = body;

    // Validation
    if (!customer_id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    if (!address_type || !['shipping', 'billing', 'both'].includes(address_type)) {
      return NextResponse.json(
        { success: false, error: 'Valid address type is required (shipping, billing, or both)' },
        { status: 400 }
      );
    }

    if (!full_name || !address_line1 || !city || !postal_code || !country) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // If this is set as default, unset other default addresses
    if (is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('customer_id', customer_id);
    }

    // Create the address
    const { data: address, error: createError } = await supabase
      .from('addresses')
      .insert({
        customer_id,
        address_type,
        is_default: is_default || false,
        full_name: full_name.trim(),
        address_line1: address_line1.trim(),
        address_line2: address_line2?.trim() || null,
        city: city.trim(),
        state: state?.trim() || null,
        postal_code: postal_code.trim(),
        country: country.trim(),
        phone: phone?.trim() || null,
      })
      .select()
      .single();

    if (createError) {
      console.error('Create address error:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to create address' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Address created successfully',
      address,
    });
  } catch (error: any) {
    console.error('Post address error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
