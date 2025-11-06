// @ts-nocheck
import { FulfillmentStatus, PaymentStatus, getStatusBadgeProps, getPaymentStatusBadgeProps } from '@/lib/order-status';

interface OrderStatusBadgeProps {
  status: FulfillmentStatus;
  small?: boolean;
}

export function OrderStatusBadge({ status, small = false }: OrderStatusBadgeProps) {
  const props = getStatusBadgeProps(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold ${
        small ? 'text-xs' : 'text-sm'
      } ${props.bgColor} ${props.color}`}
    >
      <span>{props.icon}</span>
      <span>{props.label}</span>
    </span>
  );
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  small?: boolean;
}

export function PaymentStatusBadge({ status, small = false }: PaymentStatusBadgeProps) {
  const props = getPaymentStatusBadgeProps(status);

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full font-semibold ${
        small ? 'text-xs' : 'text-sm'
      } ${props.bgColor} ${props.color}`}
    >
      {props.label}
    </span>
  );
}
