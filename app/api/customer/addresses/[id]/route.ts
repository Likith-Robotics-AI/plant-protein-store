// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// GET - Fetch a single address
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const supabase = createClient();

    const { data: address, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !address) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      address,
    });
  } catch (error: any) {
    console.error('Get address error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update an address
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
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

    // Get the address to find customer_id
    const { data: existingAddress } = await supabase
      .from('addresses')
      .select('customer_id')
      .eq('id', id)
      .single();

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      );
    }

    // If this is set as default, unset other default addresses
    if (is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('customer_id', existingAddress.customer_id);
    }

    // Update the address
    const { data: address, error: updateError } = await supabase
      .from('addresses')
      .update({
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
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Update address error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update address' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Address updated successfully',
      address,
    });
  } catch (error: any) {
    console.error('Put address error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an address
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete address error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete address' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete address error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
