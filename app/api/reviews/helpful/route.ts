// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { reviewId } = await request.json();

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    // Increment helpful_count
    const { data, error } = await supabase
      .from('reviews')
      .update({ helpful_count: supabase.raw('helpful_count + 1') })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      console.error('Error updating helpful count:', error);
      return NextResponse.json({ error: 'Failed to update helpful count' }, { status: 500 });
    }

    return NextResponse.json({ success: true, helpful_count: data.helpful_count });
  } catch (error) {
    console.error('Error in helpful endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
