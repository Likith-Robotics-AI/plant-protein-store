// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { PaymentDetails, ShippingAddress, CartItem } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_name,
      contact,
      email,
      phone,
      products,
      subtotal,
      total,
      discount_amount = 0,
      discount_code,
      shipping_address,
      billing_address,
      payment_details,
      notes,
    } = body;

    // Validate required fields
    if (!customer_name || !contact || !products || products.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_name, contact, and products are required' },
        { status: 400 }
      );
    }

    if (!shipping_address || !shipping_address.fullName || !shipping_address.addressLine1 || !shipping_address.city || !shipping_address.zipCode) {
      return NextResponse.json(
        { error: 'Complete shipping address is required' },
        { status: 400 }
      );
    }

    if (!payment_details || !payment_details.method) {
      return NextResponse.json(
        { error: 'Payment details are required' },
        { status: 400 }
      );
    }

    // Validate cart items structure
    const validProducts = products.every((item: CartItem) =>
      item.product &&
      item.product.id &&
      item.quantity > 0 &&
      item.selectedWeight > 0
    );

    if (!validProducts) {
      return NextResponse.json(
        { error: 'Invalid product data in cart' },
        { status: 400 }
      );
    }

    // Calculate totals for verification
    const calculatedSubtotal = products.reduce((sum: number, item: CartItem) => {
      const basePrice = item.pricePerKg * item.selectedWeight;
      const discountedPrice = basePrice * (1 - item.appliedDiscount);
      return sum + (discountedPrice * item.quantity);
    }, 0);

    // Allow small floating point differences
    if (Math.abs(calculatedSubtotal - (subtotal - discount_amount)) > 0.01) {
      return NextResponse.json(
        { error: 'Price calculation mismatch. Please refresh and try again.' },
        { status: 400 }
      );
    }

    // Determine order status based on payment
    let orderStatus: 'pending' | 'processing' | 'confirmed' = 'pending';

    if (payment_details.method === 'stripe' && payment_details.status === 'succeeded') {
      orderStatus = 'confirmed';
    } else if (payment_details.method === 'cash_on_delivery') {
      orderStatus = 'processing';
    }

    // Create order object
    const orderData = {
      customer_name,
      contact,
      email: email || null,
      phone: phone || null,
      products,
      subtotal: calculatedSubtotal,
      discount_amount: discount_amount || 0,
      discount_code: discount_code || null,
      shipping_cost: 0, // Free shipping
      tax_amount: 0, // No tax for now
      total,
      shipping_address,
      billing_address: billing_address || shipping_address,
      payment_details,
      status: orderStatus,
      notes: notes || null,
    };

    // Insert order into database
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create order in database', details: error.message },
        { status: 500 }
      );
    }

    // Update discount code usage if applicable
    if (discount_code) {
      await supabase.rpc('increment_discount_usage', {
        discount_code: discount_code,
      });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    if (orderId) {
      // Get specific order by ID
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(data);
    } else if (email || phone) {
      // Get orders by contact
      const contact = email || phone;
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('contact', contact)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch orders' },
          { status: 500 }
        );
      }

      return NextResponse.json(data);
    } else {
      // Get all orders (ADMIN ONLY - requires authentication)
      const { verifyAdminAccess } = await import('@/lib/admin-check');
      const authCheck = await verifyAdminAccess(request);
      if (authCheck.error) return authCheck.error;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch orders' },
          { status: 500 }
        );
      }

      return NextResponse.json(data);
    }
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
