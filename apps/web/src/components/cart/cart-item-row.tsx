import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatIDR } from '@/lib/utils';
import { TCart } from '@/models/cart.model';
import { CartItemImage, CartItemMeta, cartItemPrice } from './cart-item-meta';
import { CartSectionState } from './use-cart-section';

type Props = { cart: TCart; state: CartSectionState };

function QuantityControl({ cart, state }: Props) {
  const busy = state.updatingId === cart.id || state.deletingId === cart.id;
  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="outline"
        className="h-7 w-7"
        onClick={() => state.handleQuantityChange(cart, -1)}
        disabled={busy || cart.quantity <= 1}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="min-w-8 text-center text-sm font-medium text-ink">
        {cart.quantity}
      </span>
      <Button
        size="icon"
        variant="outline"
        className="h-7 w-7"
        onClick={() => state.handleQuantityChange(cart, 1)}
        disabled={busy}
        aria-label="Increase quantity"
      >
        <Plus className="h-3 w-3" />
      </Button>
      <button
        type="button"
        onClick={() => state.handleDelete(cart.id)}
        disabled={busy}
        aria-label="Remove product"
        className="flex h-7 w-7 items-center justify-center rounded-full ml-2 bg-soft-cloud text-ink hover:bg-hairline-soft disabled:opacity-60"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

export default function CartItemRow({ cart, state }: Props) {
  const priceNum = cartItemPrice(cart);
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex gap-4 p-4 bg-canvas border border-hairline">
        <input
          type="checkbox"
          className="h-4 w-4 mt-1 shrink-0 accent-ink"
          checked={state.selection.selectedIds.has(cart.id)}
          onChange={() => state.selection.toggleSelect(cart.id)}
          aria-label={`Select ${cart.Product?.name || 'product'}`}
        />
        <CartItemImage cart={cart} />
        <div className="flex-1 min-w-0">
          <CartItemMeta cart={cart} linked />
          <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
            <span className="text-base font-medium text-ink">
              {formatIDR(priceNum)}
            </span>
            <QuantityControl cart={cart} state={state} />
          </div>
          <div className="text-xs text-mute mt-1">
            Subtotal:{' '}
            <span className="font-medium text-ink">
              {formatIDR(priceNum * cart.quantity)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
