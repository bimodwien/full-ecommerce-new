'use client';
import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatIDR } from '@/lib/utils';
import { TCart } from '@/models/cart.model';
import {
  CartItemImage,
  CartItemMeta,
  cartItemPrice,
} from '@/components/cart/cart-item-meta';
import OrderSummaryCard from '@/components/cart/order-summary-card';
import { useCheckout } from './use-checkout';

function CheckoutSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <Skeleton key={i} className="h-36" />
      ))}
    </div>
  );
}

function NoItems() {
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

function CheckoutItem({ cart }: { cart: TCart }) {
  const priceNum = cartItemPrice(cart);
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex gap-4 p-4 bg-canvas border border-hairline">
        <CartItemImage cart={cart} />
        <div className="flex-1 min-w-0">
          <CartItemMeta cart={cart} />
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
}

function CheckoutItems({
  carts,
  missingCount,
}: {
  carts: TCart[];
  missingCount: number;
}) {
  return (
    <div className="flex-1 flex flex-col gap-4">
      {missingCount > 0 && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2">
          Some selected items are no longer available and were removed from this
          order.
        </div>
      )}
      {carts.map((cart) => (
        <CheckoutItem key={cart.id} cart={cart} />
      ))}
    </div>
  );
}

const CheckoutSection = () => {
  const state = useCheckout();

  if (state.loading) return <CheckoutSkeleton />;
  if (state.carts.length === 0) return <NoItems />;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <CheckoutItems carts={state.carts} missingCount={state.missingCount} />

      <OrderSummaryCard
        itemsLabel="Total items"
        totalItems={state.totalItems}
        totalPrice={state.totalPrice}
        action={
          <Button
            size="pill"
            className="w-full mt-4"
            onClick={state.handlePayNow}
            disabled={state.busy || !state.snapReady}
          >
            {state.busy ? 'Processing...' : 'Pay Now'}
          </Button>
        }
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

export default CheckoutSection;
