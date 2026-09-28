import React from 'react';
import { formatIDR, formatDate } from '@/lib/utils';
import { toPrice } from '@/lib/product-display';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import OrderStatusBadge from '@/components/order/order-status-badge';
import { TOrder } from '@/models/order.model';
import { OrderTrackingActions } from './use-order-tracking-actions';

// Mirrors CANCELLABLE_AFTER_MS in the API; the server is the real gatekeeper,
// this only keeps the button from offering an action that would be rejected.
const CANCELLABLE_AFTER_MS = 24 * 60 * 60 * 1000;

type Props = { order: TOrder; actions: OrderTrackingActions; now: number };

function RowAction({ order, actions, now }: Props) {
  if (order.status === 'PAID') {
    const shipping = actions.shippingId === order.id;
    return (
      <Button
        size="sm"
        onClick={() => actions.handleShip(order.id)}
        disabled={shipping}
      >
        {shipping ? 'Processing…' : 'Mark as Shipped'}
      </Button>
    );
  }
  if (order.status !== 'PENDING') return null;
  const canCancel =
    now - new Date(order.createdAt).getTime() >= CANCELLABLE_AFTER_MS;
  const cancelling = actions.cancellingId === order.id;
  return (
    <Button
      variant="outline"
      size="sm"
      className="text-red-600 hover:text-red-700"
      onClick={() => actions.setSelected(order)}
      disabled={!canCancel || cancelling}
      title={
        canCancel
          ? undefined
          : 'Can be cancelled 24 hours after the order was created'
      }
    >
      {cancelling ? 'Processing…' : 'Cancel'}
    </Button>
  );
}

export default function OrderTrackingRow(props: Props) {
  const { order } = props;
  const itemCount = (order.OrderItems || []).reduce(
    (acc, item) => acc + item.quantity,
    0,
  );
  return (
    <TableRow>
      <TableCell>
        <span className="font-medium text-sm truncate block max-w-40">
          {order.id}
        </span>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <div className="min-w-0">
          <span className="block truncate">{order.user?.name || '-'}</span>
          <span className="text-xs text-zinc-500 block truncate">
            {order.user?.email || ''}
          </span>
        </div>
      </TableCell>
      <TableCell>{itemCount}</TableCell>
      <TableCell className="font-medium hidden md:table-cell">
        {formatIDR(toPrice(order.totalAmount))}
      </TableCell>
      <TableCell>
        <OrderStatusBadge status={order.status} />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {formatDate(order.createdAt)}
      </TableCell>
      <TableCell>
        <RowAction {...props} />
      </TableCell>
    </TableRow>
  );
}
