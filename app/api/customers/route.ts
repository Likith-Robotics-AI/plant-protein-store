// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET all customers or search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    let query = supabase
      .from('customers')
      .select('*');

    // Search by name, email, or phone
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    // Sort
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// CREATE new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone } = body;

    // Validate required fields
    if (!name || (!email && !phone)) {
      return NextResponse.json(
        { error: 'Name and at least one contact method (email or phone) are required' },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const { data: existing } = await supabase
      .from('customers')
      .select('*')
      .or(`email.eq.${email},phone.eq.${phone}`)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Customer with this email or phone already exists' },
        { status: 409 }
      );
    }

    // Create customer
    const { data, error } = await supabase
      .from('customers')
      .insert([{
        name,
        email: email || null,
        phone: phone || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
