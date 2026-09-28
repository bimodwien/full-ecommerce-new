import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TCart } from '@/models/cart.model';
import { effectivePrice, listImageUrl } from '@/lib/product-display';

export const cartItemPrice = (cart: TCart) =>
  cart.Product ? effectivePrice(cart.Product, cart.Variant) : 0;

export function cartTotals(carts: TCart[]) {
  return {
    totalPrice: carts.reduce(
      (acc, c) => acc + cartItemPrice(c) * c.quantity,
      0,
    ),
    totalItems: carts.reduce((acc, c) => acc + c.quantity, 0),
  };
}

export function CartItemImage({ cart }: { cart: TCart }) {
  return (
    <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-soft-cloud">
      <Image
        src={listImageUrl(cart.Product, cart.productId)}
        alt={cart.Product?.name || 'Product'}
        fill
        unoptimized
        className="object-cover"
      />
    </div>
  );
}

// Category, name, seller, and variant lines shown above the price row.
export function CartItemMeta({
  cart,
  linked,
}: {
  cart: TCart;
  linked?: boolean;
}) {
  const product = cart.Product as any;
  const name = product?.name || 'Product name unavailable';
  return (
    <>
      <div className="text-xs text-mute mb-0.5">
        {product?.Category?.name || ''}
      </div>
      {linked ? (
        <Link
          href={`/detail/${cart.productId}`}
          className="block text-sm font-medium text-ink hover:text-mute truncate"
        >
          {name}
        </Link>
      ) : (
        <div className="text-sm font-medium text-ink truncate">{name}</div>
      )}
      <div className="text-xs text-mute mt-0.5">
        By <span className="text-mute">{product?.seller?.name || ''}</span>
      </div>
      {cart.Variant && (
        <div className="text-xs text-mute bg-soft-cloud px-2 py-0.5 w-fit mt-1">
          Variant: {cart.Variant.variant}
        </div>
      )}
    </>
  );
}
