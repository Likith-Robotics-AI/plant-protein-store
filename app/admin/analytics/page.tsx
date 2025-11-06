// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp, Eye, ShoppingCart, MousePointerClick } from 'lucide-react';

interface AnalyticsData {
  totalPageViews: number;
  totalBuyClicks: number;
  totalAddToCart: number;
  topProducts: Array<{ product_id: string; product_name: string; count: number }>;
  recentEvents: Array<{
    id: string;
    event_type: string;
    page: string;
    created_at: string;
    product_id?: string;
  }>;
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalPageViews: 0,
    totalBuyClicks: 0,
    totalAddToCart: 0,
    topProducts: [],
    recentEvents: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Get total page views
      const { count: pageViews } = await supabase
        .from('analytics')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view');

      // Get total buy clicks
      const { count: buyClicks } = await supabase
        .from('analytics')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'buy_click');

      // Get total add to cart
      const { count: addToCart } = await supabase
        .from('analytics')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'add_to_cart');

      // Get top products by buy clicks
      const { data: clickData } = await supabase
        .from('analytics')
        .select('product_id')
        .eq('event_type', 'buy_click')
        .not('product_id', 'is', null);

      // Count products
      const productCounts: { [key: string]: number } = {};
      clickData?.forEach((event: any) => {
        if (event.product_id) {
          productCounts[event.product_id] = (productCounts[event.product_id] || 0) + 1;
        }
      });

      // Get product names for top products
      const topProductIds = Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .in('id', topProductIds);

      const topProducts = topProductIds
        .map((id) => {
          const product = (products as Array<{ id: string; name: string }> | null)?.find((p) => p.id === id);
          return {
            product_id: id,
            product_name: product?.name || 'Unknown Product',
            count: productCounts[id],
          };
        })
        .filter((p) => p.product_name !== 'Unknown Product');

      // Get recent events
      const { data: recentEvents } = await supabase
        .from('analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      setAnalytics({
        totalPageViews: pageViews || 0,
        totalBuyClicks: buyClicks || 0,
        totalAddToCart: addToCart || 0,
        topProducts,
        recentEvents: recentEvents || [],
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatEventType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <Eye className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Page Views</p>
          <p className="text-3xl font-bold">{analytics.totalPageViews}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500 p-3 rounded-lg">
              <MousePointerClick className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Buy Button Clicks</p>
          <p className="text-3xl font-bold">{analytics.totalBuyClicks}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-500 p-3 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Add to Cart Actions</p>
          <p className="text-3xl font-bold">{analytics.totalAddToCart}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold">Top Products by Buy Clicks</h2>
          </div>

          {analytics.topProducts.length === 0 ? (
            <p className="text-gray-600">No data available</p>
          ) : (
            <div className="space-y-3">
              {analytics.topProducts.map((product, index) => (
                <div key={product.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-gray-400">#{index + 1}</span>
                    <span className="font-medium">{product.product_name}</span>
                  </div>
                  <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {product.count} clicks
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>

          {analytics.recentEvents.length === 0 ? (
            <p className="text-gray-600">No activity yet</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {analytics.recentEvents.map((event) => (
                <div key={event.id} className="border-l-4 border-primary-500 pl-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      event.event_type === 'buy_click' ? 'bg-green-100 text-green-700' :
                      event.event_type === 'page_view' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {formatEventType(event.event_type)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{event.page}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(event.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Conversion Metrics</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-600 text-sm mb-2">Click-through Rate</p>
            <p className="text-2xl font-bold text-primary-700">
              {analytics.totalPageViews > 0
                ? ((analytics.totalBuyClicks / analytics.totalPageViews) * 100).toFixed(2)
                : 0}
              %
            </p>
            <p className="text-xs text-gray-500 mt-1">
              (Buy Clicks / Page Views)
            </p>
          </div>

          <div>
            <p className="text-gray-600 text-sm mb-2">Add to Cart Rate</p>
            <p className="text-2xl font-bold text-primary-700">
              {analytics.totalPageViews > 0
                ? ((analytics.totalAddToCart / analytics.totalPageViews) * 100).toFixed(2)
                : 0}
              %
            </p>
            <p className="text-xs text-gray-500 mt-1">
              (Add to Cart / Page Views)
            </p>
          </div>

          <div>
            <p className="text-gray-600 text-sm mb-2">Total Events</p>
            <p className="text-2xl font-bold text-primary-700">
              {analytics.totalPageViews + analytics.totalBuyClicks + analytics.totalAddToCart}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              All tracked actions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
