// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const productId = searchParams.get('product_id');
    const type = searchParams.get('type') || 'summary'; // summary, products, funnel, timeline

    // Build base query
    let query = supabase.from('analytics').select('*');

    // Apply date filters
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (type === 'summary') {
      // Get comprehensive analytics summary
      const [
        pageViewsRes,
        buyClicksRes,
        addToCartRes,
        productViewsRes,
        sessionsRes,
        avgTimeRes,
      ] = await Promise.all([
        supabase.from('analytics').select('*', { count: 'exact', head: true }).eq('event_type', 'page_view'),
        supabase.from('analytics').select('*', { count: 'exact', head: true }).eq('event_type', 'buy_click'),
        supabase.from('analytics').select('*', { count: 'exact', head: true }).eq('event_type', 'add_to_cart'),
        supabase.from('analytics').select('*', { count: 'exact', head: true }).eq('event_type', 'product_view'),
        supabase.from('analytics').select('session_id').not('session_id', 'is', null),
        supabase.from('analytics').select('duration_seconds').not('duration_seconds', 'is', null),
      ]);

      const uniqueSessions = new Set(sessionsRes.data?.map(d => d.session_id)).size;
      const durations = avgTimeRes.data?.map(d => d.duration_seconds) || [];
      const avgTime = durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : 0;

      return NextResponse.json({
        total_page_views: pageViewsRes.count || 0,
        total_buy_clicks: buyClicksRes.count || 0,
        total_add_to_cart: addToCartRes.count || 0,
        total_product_views: productViewsRes.count || 0,
        unique_sessions: uniqueSessions,
        average_time_spent_seconds: Math.round(avgTime),
        conversion_rate: pageViewsRes.count > 0
          ? ((buyClicksRes.count || 0) / pageViewsRes.count * 100).toFixed(2)
          : 0,
      });
    }

    if (type === 'products') {
      // Get product-level analytics using the view
      const { data, error } = await supabase
        .from('product_analytics_summary')
        .select('*')
        .order('total_views', { ascending: false })
        .limit(20);

      if (error) throw error;
      return NextResponse.json(data);
    }

    if (type === 'funnel') {
      // Conversion funnel analysis
      const { data, error } = await query;
      if (error) throw error;

      const funnelSteps = {
        page_views: data.filter(e => e.event_type === 'page_view').length,
        product_views: data.filter(e => e.event_type === 'product_view').length,
        add_to_cart: data.filter(e => e.event_type === 'add_to_cart').length,
        buy_clicks: data.filter(e => e.event_type === 'buy_click').length,
      };

      // Get actual orders for final conversion
      const { count: orders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('created_at', endDate || new Date().toISOString());

      return NextResponse.json({
        funnel: [
          { step: 'Page Views', count: funnelSteps.page_views, percentage: 100 },
          { step: 'Product Views', count: funnelSteps.product_views, percentage: (funnelSteps.product_views / funnelSteps.page_views * 100).toFixed(1) },
          { step: 'Add to Cart', count: funnelSteps.add_to_cart, percentage: (funnelSteps.add_to_cart / funnelSteps.page_views * 100).toFixed(1) },
          { step: 'Buy Clicks', count: funnelSteps.buy_clicks, percentage: (funnelSteps.buy_clicks / funnelSteps.page_views * 100).toFixed(1) },
          { step: 'Orders', count: orders || 0, percentage: ((orders || 0) / funnelSteps.page_views * 100).toFixed(1) },
        ],
      });
    }

    if (type === 'timeline') {
      // Get timeline data grouped by day
      const { data, error } = await query.order('created_at', { ascending: true });
      if (error) throw error;

      // Group by date
      const timeline: { [key: string]: any } = {};
      data.forEach(event => {
        const date = new Date(event.created_at).toISOString().split('T')[0];
        if (!timeline[date]) {
          timeline[date] = {
            date,
            page_views: 0,
            product_views: 0,
            add_to_cart: 0,
            buy_clicks: 0,
          };
        }
        timeline[date][event.event_type] = (timeline[date][event.event_type] || 0) + 1;
      });

      return NextResponse.json(Object.values(timeline));
    }

    // Default: return raw data
    const { data, error } = await query.order('created_at', { ascending: false }).limit(1000);
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching advanced analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
