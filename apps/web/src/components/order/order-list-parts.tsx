import React from 'react';
import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { formatIDR, formatDate } from '@/lib/utils';
import { TOrder } from '@/models/order.model';
import OrderStatusBadge from './order-status-badge';

export const OrderListSkeleton = () => (
  <div className="flex flex-col gap-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <Skeleton key={i} className="h-28" />
    ))}
  </div>
);

export const OrderListEmpty = () => (
  <div className="flex flex-col items-center justify-center py-20 text-stone">
    <Package className="h-16 w-16 mb-4 text-stone" />
    <p className="text-lg font-medium text-ink">No orders yet</p>
    <p className="text-sm mt-1 mb-4 text-mute">
      Your orders will show up here after checkout.
    </p>
    <Button asChild size="pill">
      <Link href="/">
        Go to homepage
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  </div>
);

const OrderCardHeader = ({ order }: { order: TOrder }) => (
  <div className="flex items-center justify-between gap-2 flex-wrap">
    <div>
      <div className="text-xs text-mute">Order ID</div>
      <div className="text-sm font-medium text-ink truncate max-w-55">
        {order.id}
      </div>
      {order.seller?.name && (
        <div className="text-xs text-mute mt-1">
          Seller: {order.seller.name}
        </div>
      )}
    </div>
    <OrderStatusBadge status={order.status} />
  </div>
);

export const OrderCard = ({ order }: { order: TOrder }) => {
  const totalAmount =
    typeof order.totalAmount === 'string'
      ? Number(order.totalAmount)
      : order.totalAmount;
  const itemCount = (order.OrderItems || []).reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  return (
    <Link href={`/order/${order.id}`}>
      <Card className="overflow-hidden hover:border-ink/30 transition-colors">
        <CardContent className="p-4 bg-canvas border border-hairline">
          <OrderCardHeader order={order} />
          <Separator className="my-3" />
          <div className="flex items-center justify-between text-sm text-mute">
            <span>{itemCount} item(s)</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-mute">Total</span>
            <span className="text-base font-medium text-ink">
              {formatIDR(totalAmount)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
