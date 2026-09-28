'use client';
import React from 'react';
import Link from 'next/link';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import CartItemRow from './cart-item-row';
import OrderSummaryCard from './order-summary-card';
import { CartSectionState, useCartSection } from './use-cart-section';

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-stone">
      <ShoppingCart className="h-16 w-16 mb-4 text-stone" />
      <p className="text-lg font-medium text-ink">Your cart is empty</p>
      <p className="text-sm mt-1 mb-4 text-mute">
        Start shopping at the homepage.
      </p>
      <Button asChild size="pill">
        <Link href="/">
          Go to homepage
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

function CartItems({ state }: { state: CartSectionState }) {
  const { filteredCarts, selection } = state;
  return (
    <div className="flex-1 flex flex-col gap-4">
      {filteredCarts.length > 0 && (
        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
          <input
            ref={(el) => {
              if (el)
                el.indeterminate =
                  selection.someFilteredSelected &&
                  !selection.allFilteredSelected;
            }}
            type="checkbox"
            className="h-4 w-4 accent-ink"
            checked={selection.allFilteredSelected}
            onChange={selection.toggleSelectAll}
            aria-label="Select all items"
          />
          Select all
        </label>
      )}
      {filteredCarts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
          <p className="text-base font-medium">No cart items found</p>
          <p className="text-sm">Try changing your search or filter.</p>
        </div>
      )}
      {filteredCarts.map((cart) => (
        <CartItemRow key={cart.id} cart={cart} state={state} />
      ))}
    </div>
  );
}

const CartSection = () => {
  const state = useCartSection();

  if (state.loading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    );
  }
  if (state.carts.length === 0) return <EmptyCart />;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <CartItems state={state} />
      <OrderSummaryCard
        itemsLabel="Selected items"
        totalItems={state.totalItems}
        totalPrice={state.totalPrice}
        action={
          <Button
            size="pill"
            className="w-full mt-4"
            onClick={state.handleProceedToCheckout}
            disabled={state.selection.selectedIds.size === 0}
          >
            Proceed to Checkout
          </Button>
        }
      />
    </div>
  );
};

export default CartSection;
