// Order Status Management Utility
// Handles order status workflows, validations, and transitions

export type FulfillmentStatus =
  | 'pending'
  | 'processing'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderStatusConfig {
  value: FulfillmentStatus;
  label: string;
  color: string;
  bgColor: string;
  description: string;
  allowedNextStatuses: FulfillmentStatus[];
  icon: string;
}

// Order status workflow configuration
export const ORDER_STATUS_CONFIG: Record<FulfillmentStatus, OrderStatusConfig> = {
  pending: {
    value: 'pending',
    label: 'Pending',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    description: 'Order received, awaiting processing',
    allowedNextStatuses: ['processing', 'cancelled'],
    icon: '⏳',
  },
  processing: {
    value: 'processing',
    label: 'Processing',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    description: 'Order is being prepared',
    allowedNextStatuses: ['confirmed', 'cancelled'],
    icon: '⚙️',
  },
  confirmed: {
    value: 'confirmed',
    label: 'Confirmed',
    color: 'text-purple-800',
    bgColor: 'bg-purple-100',
    description: 'Order confirmed and ready to ship',
    allowedNextStatuses: ['shipped', 'cancelled'],
    icon: '✓',
  },
  shipped: {
    value: 'shipped',
    label: 'Shipped',
    color: 'text-indigo-800',
    bgColor: 'bg-indigo-100',
    description: 'Order has been dispatched',
    allowedNextStatuses: ['delivered'],
    icon: '📦',
  },
  delivered: {
    value: 'delivered',
    label: 'Delivered',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    description: 'Order successfully delivered',
    allowedNextStatuses: ['refunded'],
    icon: '✅',
  },
  cancelled: {
    value: 'cancelled',
    label: 'Cancelled',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    description: 'Order has been cancelled',
    allowedNextStatuses: [],
    icon: '❌',
  },
  refunded: {
    value: 'refunded',
    label: 'Refunded',
    color: 'text-orange-800',
    bgColor: 'bg-orange-100',
    description: 'Order has been refunded',
    allowedNextStatuses: [],
    icon: '↩️',
  },
};

// Payment status configuration
export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, {
  value: PaymentStatus;
  label: string;
  color: string;
  bgColor: string;
}> = {
  pending: {
    value: 'pending',
    label: 'Pending',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
  },
  paid: {
    value: 'paid',
    label: 'Paid',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
  },
  failed: {
    value: 'failed',
    label: 'Failed',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
  },
  refunded: {
    value: 'refunded',
    label: 'Refunded',
    color: 'text-orange-800',
    bgColor: 'bg-orange-100',
  },
};

/**
 * Check if a status transition is valid
 */
export function isValidStatusTransition(
  currentStatus: FulfillmentStatus,
  newStatus: FulfillmentStatus
): boolean {
  if (currentStatus === newStatus) return false;
  const config = ORDER_STATUS_CONFIG[currentStatus];
  return config.allowedNextStatuses.includes(newStatus);
}

/**
 * Get status configuration
 */
export function getStatusConfig(status: FulfillmentStatus): OrderStatusConfig {
  return ORDER_STATUS_CONFIG[status];
}

/**
 * Get payment status configuration
 */
export function getPaymentStatusConfig(status: PaymentStatus) {
  return PAYMENT_STATUS_CONFIG[status];
}

/**
 * Get all statuses
 */
export function getAllStatuses(): FulfillmentStatus[] {
  return Object.keys(ORDER_STATUS_CONFIG) as FulfillmentStatus[];
}

/**
 * Get allowed next statuses for current status
 */
export function getAllowedNextStatuses(
  currentStatus: FulfillmentStatus
): FulfillmentStatus[] {
  return ORDER_STATUS_CONFIG[currentStatus].allowedNextStatuses;
}

/**
 * Get status badge props
 */
export function getStatusBadgeProps(status: FulfillmentStatus) {
  const config = getStatusConfig(status);
  return {
    label: config.label,
    color: config.color,
    bgColor: config.bgColor,
    icon: config.icon,
  };
}

/**
 * Get payment status badge props
 */
export function getPaymentStatusBadgeProps(status: PaymentStatus) {
  const config = getPaymentStatusConfig(status);
  return {
    label: config.label,
    color: config.color,
    bgColor: config.bgColor,
  };
}

/**
 * Check if order can be cancelled
 */
export function canCancelOrder(status: FulfillmentStatus): boolean {
  return ['pending', 'processing', 'confirmed'].includes(status);
}

/**
 * Check if order can be refunded
 */
export function canRefundOrder(status: FulfillmentStatus, paymentStatus: PaymentStatus): boolean {
  return status === 'delivered' && paymentStatus === 'paid';
}

/**
 * Check if order requires tracking number
 */
export function requiresTrackingNumber(status: FulfillmentStatus): boolean {
  return status === 'shipped';
}

/**
 * Get order progress percentage
 */
export function getOrderProgress(status: FulfillmentStatus): number {
  const progressMap: Record<FulfillmentStatus, number> = {
    pending: 0,
    processing: 20,
    confirmed: 40,
    shipped: 70,
    delivered: 100,
    cancelled: 0,
    refunded: 0,
  };
  return progressMap[status];
}

/**
 * Format status for display
 */
export function formatStatus(status: FulfillmentStatus): string {
  return ORDER_STATUS_CONFIG[status].label;
}

/**
 * Get status description
 */
export function getStatusDescription(status: FulfillmentStatus): string {
  return ORDER_STATUS_CONFIG[status].description;
}
