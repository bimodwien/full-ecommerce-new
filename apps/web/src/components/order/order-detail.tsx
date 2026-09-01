'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatIDR } from '@/lib/utils';
import { fetchOrderById, retryOrderPayment } from '@/helpers/fetch-order';
import { TOrder, TOrderItem } from '@/models/order.model';
import OrderStatusBadge from './order-status-badge';
import { toast } from 'sonner';

const apiBase = (
  process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:8000/api'
).replace(/\/$/, '');
const apiOrigin = apiBase.replace(/\/api\/?$/, '');

const OrderDetail = ({ orderId }: { orderId: string }) => {
  const [order, setOrder] = useState<TOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [snapReady, setSnapReady] = useState(false);

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchOrderById(orderId);
      setOrder(data);
    } catch {
      toast.error('Failed to load order.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const getImageUrl = (item: TOrderItem) => {
    const rawImage = (item.Product as any)?.Images?.[0]?.imageUrl as
      | string
      | undefined;
    if (!rawImage) return `${apiBase}/products/image/${item.productId}`;
    return rawImage.startsWith('http')
      ? rawImage
      : `${apiOrigin}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
  };

  const handlePayNow = useCallback(async () => {
    if (!order) return;
    setPaying(true);
    try {
      let token = order.snapToken;
      if (!token) {
        const result = await retryOrderPayment(order.id);
        token = result.snapToken;
      }
      if (!window.snap || !token) {
        toast.error('Payment is not ready yet, please try again.');
        return;
      }
      window.snap.pay(token, {
        onSuccess: () => {
          toast.success('Payment successful.');
          loadOrder();
        },
        onPending: () => {
          toast.info('Payment pending.');
          loadOrder();
        },
        onError: () => {
          toast.error('Payment failed.');
        },
        onClose: () => {
          toast.warning('Payment popup closed.');
        },
      });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to initialize payment.',
      );
    } finally {
      setPaying(false);
    }
  }, [order, loadOrder]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone">
        <p className="text-lg font-medium text-ink">Order not found</p>
        <Button asChild size="pill" className="mt-4">
          <Link href="/order">
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>
        </Button>
      </div>
    );
  }

  const totalAmount =
    typeof order.totalAmount === 'string'
      ? Number(order.totalAmount)
      : order.totalAmount;

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/order"
        className="inline-flex items-center gap-1 text-sm text-mute hover:text-ink w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <Card>
        <CardContent className="p-5 bg-canvas border border-hairline flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-xs text-mute">Order ID</div>
            <div className="text-sm font-medium text-ink">{order.id}</div>
          </div>
          <OrderStatusBadge status={order.status} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {(order.OrderItems || []).map((item) => {
          const priceNum =
            typeof item.price === 'string' ? Number(item.price) : item.price;
          return (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="flex gap-4 p-4 bg-canvas border border-hairline">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-soft-cloud">
                  <Image
                    src={getImageUrl(item)}
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
        })}
      </div>

      <Card>
        <CardContent className="p-5 bg-soft-cloud">
          <div className="flex justify-between font-medium text-ink">
            <span>Total</span>
            <span>{formatIDR(totalAmount)}</span>
          </div>
          {order.status === 'PENDING' && (
            <Button
              size="pill"
              className="w-full mt-4"
              onClick={handlePayNow}
              disabled={paying || !snapReady}
            >
              {paying ? 'Processing...' : 'Pay Now'}
            </Button>
          )}
        </CardContent>
      </Card>

      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
        onLoad={() => setSnapReady(true)}
      />
    </div>
  );
};

export default OrderDetail;
