'use client';
import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import OrderReturnDialog from './order-return-dialog';
import {
  OrderItemRow,
  OrderSummaryHeader,
  OrderTotalCard,
} from './order-detail-parts';
import { useOrderDetail } from './use-order-detail';

function BackToOrders({ asButton }: { asButton?: boolean }) {
  const content = (
    <>
      <ArrowLeft className="h-4 w-4" />
      Back to orders
    </>
  );
  if (asButton) {
    return (
      <Button asChild size="pill" className="mt-4 rounded-none">
        <Link href="/order">{content}</Link>
      </Button>
    );
  }
  return (
    <Link
      href="/order"
      className="inline-flex items-center gap-1 text-sm text-mute hover:text-ink w-fit"
    >
      {content}
    </Link>
  );
}

function OrderFallback({ loading }: { loading: boolean }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-24" />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center py-20 text-stone">
      <p className="text-lg font-medium text-ink">Order not found</p>
      <BackToOrders asButton />
    </div>
  );
}

const OrderDetail = ({ orderId }: { orderId: string }) => {
  const state = useOrderDetail(orderId);
  const { order } = state;

  if (state.loading || !order) return <OrderFallback loading={state.loading} />;

  return (
    <div className="flex flex-col gap-4">
      <BackToOrders />
      <OrderSummaryHeader order={order} />
      <div className="flex flex-col gap-3">
        {(order.OrderItems || []).map((item) => (
          <OrderItemRow key={item.id} item={item} />
        ))}
      </div>
      <OrderTotalCard order={order} state={state} />
      <OrderReturnDialog
        orderId={order.id}
        open={state.returnDialogOpen}
        onOpenChange={state.setReturnDialogOpen}
        onSuccess={state.setOrder}
      />
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
        onLoad={() => state.setSnapReady(true)}
      />
    </div>
  );
};

export default OrderDetail;
