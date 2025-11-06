// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalClicks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get product count
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Get order count and total revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total');

      const totalRevenue = (orders as Array<{ total: number }> | null)?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

      // Get analytics count
      const { count: clickCount } = await supabase
        .from('analytics')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'buy_click');

      setStats({
        totalProducts: productCount || 0,
        totalOrders: orders?.length || 0,
        totalRevenue,
        totalClicks: clickCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-green-500',
    },
    {
      label: 'Total Revenue',
      value: `£${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      label: 'Buy Button Clicks',
      value: stats.totalClicks,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/products"
            className="border-2 border-primary-600 text-primary-600 px-6 py-4 rounded-lg hover:bg-primary-50 transition text-center font-semibold"
          >
            Manage Products
          </a>
          <a
            href="/admin/orders"
            className="border-2 border-primary-600 text-primary-600 px-6 py-4 rounded-lg hover:bg-primary-50 transition text-center font-semibold"
          >
            View Orders
          </a>
          <a
            href="/admin/analytics"
            className="border-2 border-primary-600 text-primary-600 px-6 py-4 rounded-lg hover:bg-primary-50 transition text-center font-semibold"
          >
            View Analytics
          </a>
          <a
            href="/admin/update-prices"
            className="bg-primary-600 text-white px-6 py-4 rounded-lg hover:bg-primary-700 transition text-center font-semibold shadow-lg"
          >
            Update Prices
          </a>
        </div>
      </div>
    </div>
  );
}
