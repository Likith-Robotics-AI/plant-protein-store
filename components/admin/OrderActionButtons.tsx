'use client';

import { useState } from 'react';
import { Order } from '@/lib/types';
import { FulfillmentStatus, getAllowedNextStatuses, requiresTrackingNumber } from '@/lib/order-status';
import { Check, X, Truck, Package, Ban } from 'lucide-react';

interface OrderActionButtonsProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: FulfillmentStatus, trackingNumber?: string, notes?: string) => Promise<void>;
}

export default function OrderActionButtons({ order, onStatusUpdate }: OrderActionButtonsProps) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<FulfillmentStatus | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');

  const allowedStatuses = getAllowedNextStatuses(order.fulfillment_status);

  const handleStatusClick = (status: FulfillmentStatus) => {
    setSelectedStatus(status);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedStatus) return;

    if (requiresTrackingNumber(selectedStatus) && !trackingNumber) {
      alert('Tracking number is required for shipped status');
      return;
    }

    setLoading(true);
    try {
      await onStatusUpdate(order.id, selectedStatus, trackingNumber || undefined, notes || undefined);
      setShowModal(false);
      setTrackingNumber('');
      setNotes('');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const getButtonConfig = (status: FulfillmentStatus) => {
    const configs = {
      processing: { label: 'Mark Processing', icon: Package, color: 'bg-blue-600 hover:bg-blue-700' },
      confirmed: { label: 'Confirm Order', icon: Check, color: 'bg-purple-600 hover:bg-purple-700' },
      shipped: { label: 'Mark Shipped', icon: Truck, color: 'bg-indigo-600 hover:bg-indigo-700' },
      delivered: { label: 'Mark Delivered', icon: Check, color: 'bg-green-600 hover:bg-green-700' },
      cancelled: { label: 'Cancel Order', icon: Ban, color: 'bg-red-600 hover:bg-red-700' },
      refunded: { label: 'Refund', icon: X, color: 'bg-orange-600 hover:bg-orange-700' },
      pending: { label: 'Mark Pending', icon: Package, color: 'bg-yellow-600 hover:bg-yellow-700' },
    };
    return configs[status];
  };

  if (allowedStatuses.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No further actions available for this order
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {allowedStatuses.map((status) => {
          const config = getButtonConfig(status);
          const Icon = config.icon;
          return (
            <button
              key={status}
              onClick={() => handleStatusClick(status)}
              className={`${config.color} text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition`}
            >
              <Icon className="w-4 h-4" />
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {showModal && selectedStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              Update Order Status
            </h3>

            <p className="text-gray-600 mb-4">
              Change order status to <span className="font-bold">{selectedStatus}</span>?
            </p>

            {requiresTrackingNumber(selectedStatus) && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Tracking Number *
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter tracking number"
                  required
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Add any notes about this status change..."
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Confirm'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setTrackingNumber('');
                  setNotes('');
                }}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
