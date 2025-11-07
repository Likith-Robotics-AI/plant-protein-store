// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id');

    if (!customerId) {
      return NextResponse.json(
        { error: 'customer_id is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get wishlist items with product details
    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        *,
        products (*)
      `)
      .eq('customer_id', customerId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Wishlist fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch wishlist' },
        { status: 500 }
      );
    }

    // Transform data to match WishlistItem type
    const wishlistItems = data.map(item => ({
      ...item,
      product: item.products
    }));

    return NextResponse.json(wishlistItems);
  } catch (error) {
    console.error('Wishlist GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { customer_id, product_id, notes } = await request.json();

    if (!customer_id || !product_id) {
      return NextResponse.json(
        { error: 'customer_id and product_id are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if item already in wishlist
    const { data: existing } = await supabase
      .from('wishlist')
      .select('id')
      .eq('customer_id', customer_id)
      .eq('product_id', product_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Item already in wishlist' },
        { status: 409 }
      );
    }

    // Add to wishlist
    const { data, error } = await supabase
      .from('wishlist')
      .insert({
        customer_id,
        product_id,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Wishlist insert error:', error);
      return NextResponse.json(
        { error: 'Failed to add to wishlist' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Wishlist POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
