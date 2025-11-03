import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isValidStatusTransition } from '@/lib/order-status';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      fulfillment_status,
      payment_status,
      tracking_number,
      admin_notes,
      cancellation_reason,
    } = body;

    // Get current order
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Validate status transition if changing fulfillment status
    if (fulfillment_status && fulfillment_status !== currentOrder.fulfillment_status) {
      if (!isValidStatusTransition(currentOrder.fulfillment_status, fulfillment_status)) {
        return NextResponse.json(
          { error: `Invalid status transition from ${currentOrder.fulfillment_status} to ${fulfillment_status}` },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (fulfillment_status) {
      updateData.fulfillment_status = fulfillment_status;

      // Set timestamps based on status
      if (fulfillment_status === 'shipped' && !currentOrder.shipped_at) {
        updateData.shipped_at = new Date().toISOString();
      }
      if (fulfillment_status === 'delivered' && !currentOrder.delivered_at) {
        updateData.delivered_at = new Date().toISOString();
      }
      if (fulfillment_status === 'cancelled' && !currentOrder.cancelled_at) {
        updateData.cancelled_at = new Date().toISOString();
        if (cancellation_reason) {
          updateData.cancellation_reason = cancellation_reason;
        }
      }
    }

    if (payment_status !== undefined) {
      updateData.payment_status = payment_status;
    }

    if (tracking_number !== undefined) {
      updateData.tracking_number = tracking_number;
    }

    if (admin_notes !== undefined) {
      updateData.admin_notes = admin_notes;
    }

    // Update order
    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    // Log admin activity
    await supabase.from('admin_activity_log').insert({
      admin_identifier: 'admin', // TODO: Get actual admin identifier
      action: 'order_status_updated',
      target_type: 'order',
      target_id: id,
      details: {
        previous_status: currentOrder.fulfillment_status,
        new_status: fulfillment_status,
        tracking_number,
        admin_notes,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get order status history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch order status history' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching order status history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
