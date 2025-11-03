import { Customer } from '@/lib/types';
import { Mail, Phone, ShoppingBag, DollarSign, Calendar } from 'lucide-react';

interface CustomerCardProps {
  customer: Customer & {
    pending_orders?: number;
    completed_orders?: number;
  };
  onClick?: () => void;
}

export default function CustomerCard({ customer, onClick }: CustomerCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md p-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{customer.name}</h3>
          <div className="flex flex-col gap-1 mt-2">
            {customer.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{customer.phone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-primary-700">
            £{customer.total_spent.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">Total Spent</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div>
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-sm font-medium">Orders</span>
          </div>
          <div className="text-xl font-bold">{customer.total_orders}</div>
          {customer.pending_orders !== undefined && customer.completed_orders !== undefined && (
            <div className="text-xs text-gray-500">
              {customer.pending_orders} pending, {customer.completed_orders} completed
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">Avg Order</span>
          </div>
          <div className="text-xl font-bold">
            £{customer.average_order_value.toFixed(2)}
          </div>
        </div>
      </div>

      {customer.last_order_date && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              Last order: {new Date(customer.last_order_date).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
