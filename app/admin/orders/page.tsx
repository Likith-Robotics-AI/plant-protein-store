'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { Eye, X, Download, Filter } from 'lucide-react';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/admin/OrderStatusBadge';
import OrderActionButtons from '@/components/admin/OrderActionButtons';
import { FulfillmentStatus } from '@/lib/order-status';
import { exportOrdersToCSV, getExportFilename } from '@/lib/export-utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<FulfillmentStatus | 'all'>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: FulfillmentStatus,
    trackingNumber?: string,
    notes?: string
  ) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fulfillment_status: newStatus,
          tracking_number: trackingNumber,
          admin_notes: notes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update status');
      }

      // Refresh orders
      await fetchOrders();

      // Update selected order if it's the one being updated
      if (selectedOrder?.id === orderId) {
        const updatedOrder = orders.find(o => o.id === orderId);
        if (updatedOrder) {
          setSelectedOrder(updatedOrder);
        }
      }
    } catch (error: any) {
      throw error;
    }
  };

  const handleExport = () => {
    const filtered = statusFilter === 'all'
      ? orders
      : orders.filter(o => o.fulfillment_status === statusFilter);
    exportOrdersToCSV(filtered, getExportFilename('orders'));
  };

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(order => order.fulfillment_status === statusFilter);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.fulfillment_status === 'pending').length,
    processing: orders.filter(o => o.fulfillment_status === 'processing').length,
    shipped: orders.filter(o => o.fulfillment_status === 'shipped').length,
    delivered: orders.filter(o => o.fulfillment_status === 'delivered').length,
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-gray-600 mt-1">Manage customer orders and fulfillment</p>
        </div>
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-xs mb-1">Total Orders</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-xs mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-xs mb-1">Processing</p>
          <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-xs mb-1">Shipped</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.shipped}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-xs mb-1">Delivered</p>
          <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Orders ({orders.length})</option>
            <option value="pending">Pending ({stats.pending})</option>
            <option value="processing">Processing ({stats.processing})</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped ({stats.shipped})</option>
            <option value="delivered">Delivered ({stats.delivered})</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600 text-lg">
            {statusFilter === 'all' ? 'No orders yet' : `No ${statusFilter} orders`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 font-mono text-sm">{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4">{order.customer_name}</td>
                  <td className="px-6 py-4 text-sm">{order.contact}</td>
                  <td className="px-6 py-4 font-bold text-primary-700">
                    £{Number(order.total).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm">{formatDate(order.created_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <OrderStatusBadge status={order.fulfillment_status} small />
                      <PaymentStatusBadge status={order.payment_status} small />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-mono font-semibold">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer Name</p>
                  <p className="font-semibold">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <p className="font-semibold">{selectedOrder.contact}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Fulfillment Status</p>
                  <OrderStatusBadge status={selectedOrder.fulfillment_status} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                  <PaymentStatusBadge status={selectedOrder.payment_status} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-bold text-xl text-primary-700">
                    £{Number(selectedOrder.total).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-bold text-lg mb-4">Products</h3>
                <div className="space-y-3">
                  {selectedOrder.products.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                      <div>
                        <p className="font-semibold">{item.product.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          £{(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          £{item.product.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Actions */}
              <div className="border-t pt-6 mt-6">
                <h3 className="font-bold text-lg mb-4">Order Actions</h3>
                <OrderActionButtons
                  order={selectedOrder}
                  onStatusUpdate={handleStatusUpdate}
                />
              </div>

              {/* Admin Notes */}
              {selectedOrder.admin_notes && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="font-bold text-lg mb-2">Admin Notes</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {selectedOrder.admin_notes}
                  </p>
                </div>
              )}

              {/* Tracking Info */}
              {selectedOrder.tracking_number && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="font-bold text-lg mb-2">Tracking Information</h3>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Tracking Number:</span> {selectedOrder.tracking_number}
                  </p>
                  {selectedOrder.shipped_at && (
                    <p className="text-sm text-gray-600 mt-1">
                      Shipped: {formatDate(selectedOrder.shipped_at)}
                    </p>
                  )}
                  {selectedOrder.delivered_at && (
                    <p className="text-sm text-gray-600 mt-1">
                      Delivered: {formatDate(selectedOrder.delivered_at)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
