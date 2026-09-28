import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatIDR } from '@/lib/utils';
import { listImageUrl, toPrice } from '@/lib/product-display';
import { TOrder, TOrderItem } from '@/models/order.model';
import OrderStatusBadge from './order-status-badge';
import { OrderDetailState } from './use-order-detail';

export function OrderSummaryHeader({ order }: { order: TOrder }) {
  return (
    <Card>
      <CardContent className="p-5 bg-canvas border border-hairline flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-xs text-mute">Order ID</div>
          <div className="text-sm font-medium text-ink">{order.id}</div>
          {order.seller?.name && (
            <div className="text-xs text-mute mt-1">
              Seller: {order.seller.name}
            </div>
          )}
        </div>
        <OrderStatusBadge status={order.status} />
      </CardContent>
    </Card>
  );
}

export function OrderItemRow({ item }: { item: TOrderItem }) {
  const priceNum = toPrice(item.price);
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex gap-4 p-4 bg-canvas border border-hairline">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-soft-cloud">
          <Image
            src={listImageUrl(item.Product, String(item.productId))}
            alt={item.Product?.name || 'Product'}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-ink truncate">
            {item.Product?.name || 'Product name unavailable'}
          </div>
          {item.Variant && (
            <div className="text-xs text-mute bg-soft-cloud px-2 py-0.5 w-fit mt-1">
              Variant: {item.Variant.variant}
            </div>
          )}
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-mute">
              {formatIDR(priceNum)} x {item.quantity}
            </span>
            <span className="font-medium text-ink">
              {formatIDR(priceNum * item.quantity)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ShippedActions({ state }: { state: OrderDetailState }) {
  return (
    <div className="flex justify-end gap-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        className="rounded-none cursor-pointer"
        onClick={() => state.setReturnDialogOpen(true)}
        disabled={state.completing}
      >
        Submit Return
      </Button>
      <Button
        size="sm"
        className="rounded-none cursor-pointer"
        onClick={state.handleComplete}
        disabled={state.completing}
      >
        {state.completing ? 'Processing...' : 'Completed the Order'}
      </Button>
    </div>
  );
}

type TotalProps = { order: TOrder; state: OrderDetailState };

// Total, plus Pay Now (pending) or complete/return (shipped).
export function OrderTotalCard({ order, state }: TotalProps) {
  const totalAmount = toPrice(order.totalAmount);
  // Orders from the same checkout are paid together in one Midtrans transaction
  const siblingOrderCount = (order.Payment?._count.Orders ?? 1) - 1;
  const paymentTotal = Number(order.Payment?.totalAmount ?? totalAmount);
  const pending = order.status === 'PENDING';
  return (
    <Card>
      <CardContent className="p-5 bg-soft-cloud">
        <div className="flex justify-between font-medium text-ink">
          <span className="underline">Total</span>
          <span>{formatIDR(totalAmount)}</span>
        </div>
        {pending && siblingOrderCount > 0 && (
          <p className="mt-3 text-xs text-mute">
            This payment also covers {siblingOrderCount} other order(s) from the
            same checkout. Total to pay: {formatIDR(paymentTotal)}
          </p>
        )}
        {pending && (
          <Button
            size="pill"
            className="w-full mt-4 rounded-none"
            onClick={state.handlePayNow}
            disabled={state.paying || !state.snapReady}
          >
            {state.paying ? 'Processing...' : 'Pay Now'}
          </Button>
        )}
        {order.status === 'SHIPPED' && <ShippedActions state={state} />}
      </CardContent>
    </Card>
  );
}
