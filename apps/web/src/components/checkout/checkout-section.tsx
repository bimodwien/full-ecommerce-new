'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { formatIDR } from '@/lib/utils';
import { fetchCarts } from '@/helpers/fetch-cart';
import { createOrder } from '@/helpers/fetch-order';
import { TCart } from '@/models/cart.model';
import { toast } from 'sonner';
import { useAppDispatch } from '@/libraries/redux/hooks';
import { decrementCartCountBy } from '@/libraries/redux/slices/cart.slice';

const CheckoutSection = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [carts, setCarts] = useState<TCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [missingCount, setMissingCount] = useState(0);
  const [snapReady, setSnapReady] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const requestedIds = useMemo(() => {
    const raw = searchParams.get('items') || '';
    return Array.from(new Set(raw.split(',').filter(Boolean)));
  }, [searchParams]);

  const apiBase = (
    process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:8000/api'
  ).replace(/\/$/, '');
  const apiOrigin = apiBase.replace(/\/api\/?$/, '');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchCarts();
        const selected = data.filter((c) => requestedIds.includes(c.id));
        setCarts(selected);
        setMissingCount(requestedIds.length - selected.length);
      } catch {
        toast.error('Failed to load checkout items.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [requestedIds]);

  const getImageUrl = (cart: TCart) => {
    const rawImage = (cart.Product as any)?.Images?.[0]?.imageUrl as
      | string
      | undefined;
    if (!rawImage) return `${apiBase}/products/image/${cart.productId}`;
    return rawImage.startsWith('http')
      ? rawImage
      : `${apiOrigin}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
  };

  const handlePayNow = useCallback(async () => {
    if (carts.length === 0) return;
    setPlacingOrder(true);
    try {
      const { order, snapToken, paymentInitError } = await createOrder(
        carts.map((c) => c.id),
      );
      setOrderPlaced(true);
      dispatch(decrementCartCountBy(carts.length));

      if (paymentInitError || !snapToken) {
        toast.error(
          'Order created, but payment setup failed. Retry from Order History.',
        );
        router.push(`/order/${order.id}`);
        return;
      }

      if (!window.snap) {
        toast.error('Payment is not ready yet, please try again.');
        router.push(`/order/${order.id}`);
        return;
      }

      window.snap.pay(snapToken, {
        onSuccess: () => {
          toast.success('Payment successful.');
          router.push(`/order/${order.id}`);
        },
        onPending: () => {
          toast.info('Payment pending.');
          router.push(`/order/${order.id}`);
        },
        onError: () => {
          toast.error('Payment failed.');
          router.push(`/order/${order.id}`);
        },
        onClose: () => {
          toast.warning(
            'Payment closed. You can finish the payment from this order.',
          );
          router.push(`/order/${order.id}`);
        },
      });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to start checkout.',
      );
    } finally {
      setPlacingOrder(false);
    }
  }, [carts, dispatch, router]);

  const totalPrice = carts.reduce((acc, cart) => {
    const price = cart.Product
      ? typeof cart.Product.price === 'string'
        ? Number(cart.Product.price)
        : cart.Product.price
      : 0;
    return acc + price * cart.quantity;
  }, 0);

  const totalItems = carts.reduce((acc, c) => acc + c.quantity, 0);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    );
  }

  if (carts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone">
        <ShoppingCart className="h-16 w-16 mb-4 text-stone" />
        <p className="text-lg font-medium text-ink">No items selected</p>
        <p className="text-sm mt-1 mb-4 text-mute">
          Go back to your cart and select items to buy.
        </p>
        <Button asChild size="pill">
          <Link href="/cart">
            <ArrowLeft className="h-4 w-4" />
            Back to cart
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Items + payment */}
      <div className="flex-1 flex flex-col gap-4">
        {missingCount > 0 && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2">
            Some selected items are no longer available and were removed from
            this order.
          </div>
        )}
        {carts.map((cart) => {
          const product = cart.Product;
          const priceNum = product
            ? typeof product.price === 'string'
              ? Number(product.price)
              : product.price
            : 0;
          const vendorName = (product as any)?.seller?.name || '';
          const categoryName = (product as any)?.Category?.name || '';

          return (
            <Card key={cart.id} className="overflow-hidden">
              <CardContent className="flex gap-4 p-4 bg-canvas border border-hairline">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-soft-cloud">
                  <Image
                    src={getImageUrl(cart)}
                    alt={product?.name || 'Product'}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-mute mb-0.5">
                    {categoryName}
                  </div>
                  <div className="text-sm font-medium text-ink truncate">
                    {product?.name || 'Product name unavailable'}
                  </div>
                  <div className="text-xs text-mute mt-0.5">
                    By <span className="text-mute">{vendorName}</span>
                  </div>
                  {cart.Variant && (
                    <div className="text-xs text-mute bg-soft-cloud px-2 py-0.5 w-fit mt-1">
                      Variant: {cart.Variant.variant}
                    </div>
                  )}
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-mute">
                      {formatIDR(priceNum)} x {cart.quantity}
                    </span>
                    <span className="font-medium text-ink">
                      {formatIDR(priceNum * cart.quantity)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Order summary */}
      <div className="w-full lg:w-72 shrink-0">
        <Card className="sticky top-4">
          <CardContent className="p-5 bg-soft-cloud">
            <h2 className="text-lg font-medium text-ink mb-4">
              Order Summary
            </h2>
            <div className="flex justify-between text-sm text-mute mb-2">
              <span>Total items</span>
              <span>{totalItems} items</span>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between font-medium text-ink">
              <span>Total</span>
              <span>{formatIDR(totalPrice)}</span>
            </div>
            <Button
              size="pill"
              className="w-full mt-4"
              onClick={handlePayNow}
              disabled={placingOrder || orderPlaced || !snapReady}
            >
              {placingOrder || orderPlaced ? 'Processing...' : 'Pay Now'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
        onLoad={() => setSnapReady(true)}
      />
    </div>
  );
};

export default CheckoutSection;
