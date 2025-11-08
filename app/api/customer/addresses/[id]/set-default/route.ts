// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// PUT - Set an address as default
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { customer_id } = await request.json();

    if (!customer_id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Unset all default addresses for this customer
    await supabase
      .from('customer_addresses')
      .update({ is_default: false })
      .eq('customer_id', customer_id);

    // Set the specified address as default
    const { data: address, error: updateError } = await supabase
      .from('customer_addresses')
      .update({ is_default: true })
      .eq('id', id)
      .eq('customer_id', customer_id)
      .select()
      .single();

    if (updateError || !address) {
      console.error('Set default address error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to set default address' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Default address updated successfully',
      address,
    });
  } catch (error: any) {
    console.error('Set default error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
