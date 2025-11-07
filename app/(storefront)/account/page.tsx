'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ShoppingBag,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Order } from '@/lib/types';

export default function AccountPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading, logout } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && customer) {
      fetchRecentOrders();
    }
  }, [isAuthenticated, customer]);

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch(`/api/orders?customer_id=${customer?.id}&limit=3`);
      if (response.ok) {
        const data = await response.json();
        setRecentOrders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black mb-2">Welcome back, {customer.name}!</h1>
              <p className="text-primary-100">Manage your account and track your orders</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <div className="text-center mb-6 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-black text-gray-900">{customer.name}</h2>
                {customer.email && (
                  <p className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                    <Mail className="w-3 h-3" />
                    {customer.email}
                  </p>
                )}
                {customer.phone && (
                  <p className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                    <Phone className="w-3 h-3" />
                    {customer.phone}
                  </p>
                )}
              </div>

              <nav className="space-y-2">
                <Link
                  href="/account/orders"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all font-semibold text-gray-700 hover:text-primary-700"
                >
                  <Package className="w-5 h-5" />
                  Order History
                </Link>
                <Link
                  href="/account/wishlist"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all font-semibold text-gray-700 hover:text-primary-700"
                >
                  <Heart className="w-5 h-5" />
                  Wishlist
                </Link>
                <Link
                  href="/account/addresses"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all font-semibold text-gray-700 hover:text-primary-700"
                >
                  <MapPin className="w-5 h-5" />
                  Addresses
                </Link>
                <Link
                  href="/account/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all font-semibold text-gray-700 hover:text-primary-700"
                >
                  <Settings className="w-5 h-5" />
                  Profile Settings
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <ShoppingBag className="w-8 h-8 text-primary-600" />
                  <span className="text-xs font-semibold text-gray-500">ALL TIME</span>
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">
                  {customer.total_orders || 0}
                </div>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <span className="text-xs font-semibold text-gray-500">TOTAL SPENT</span>
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">
                  £{(customer.total_spent || 0).toFixed(2)}
                </div>
                <p className="text-sm text-gray-600">Lifetime Value</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-8 h-8 text-blue-600" />
                  <span className="text-xs font-semibold text-gray-500">MEMBER</span>
                </div>
                <div className="text-3xl font-black text-gray-900 mb-1">
                  {new Date(customer.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                </div>
                <p className="text-sm text-gray-600">Since</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <Package className="w-6 h-6 text-primary-600" />
                  Recent Orders
                </h2>
                <Link
                  href="/account/orders"
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                >
                  View All
                </Link>
              </div>

              {loadingOrders ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/order-confirmation?orderId=${order.id}`}
                      className="block border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50/50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-900">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-700'
                            : order.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {new Date(order.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="font-black text-primary-700">£{order.total.toFixed(2)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
                  <Link
                    href="/products"
                    className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6">
              <h2 className="text-lg font-black text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link
                  href="/products"
                  className="bg-white p-4 rounded-lg hover:shadow-md transition-all"
                >
                  <ShoppingBag className="w-6 h-6 text-primary-600 mb-2" />
                  <h3 className="font-bold text-gray-900 mb-1">Continue Shopping</h3>
                  <p className="text-sm text-gray-600">Browse our protein products</p>
                </Link>
                <Link
                  href="/account/wishlist"
                  className="bg-white p-4 rounded-lg hover:shadow-md transition-all"
                >
                  <Heart className="w-6 h-6 text-red-600 mb-2" />
                  <h3 className="font-bold text-gray-900 mb-1">View Wishlist</h3>
                  <p className="text-sm text-gray-600">Check your saved items</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
