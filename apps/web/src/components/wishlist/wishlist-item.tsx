import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatIDR } from '@/lib/utils';
import { effectivePrice, listImageUrl } from '@/lib/product-display';
import { TWishlist } from '@/models/wishlist.model';
import { WishlistState } from './use-wishlist';

type Props = { wishlist: TWishlist; state: WishlistState };

function ItemActions({ wishlist, state }: Props) {
  return (
    <div className="flex gap-2 pt-1">
      <Button
        size="sm"
        variant="secondary"
        className="flex-1"
        onClick={() => state.handleMoveToCart(wishlist)}
        disabled={state.cartLoadingId === wishlist.id}
      >
        <ShoppingCart className="h-3.5 w-3.5 mr-1" />
        Add to Cart
      </Button>
      <button
        type="button"
        onClick={() => state.handleDelete(wishlist)}
        disabled={state.deletingId === wishlist.id}
        aria-label="Remove from wishlist"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-soft-cloud text-ink hover:bg-hairline-soft disabled:opacity-60"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function WishlistItem({ wishlist, state }: Props) {
  const product = wishlist.Product as any;
  return (
    <Card className="relative overflow-hidden">
      <div className="relative aspect-square w-full bg-soft-cloud">
        <Image
          src={listImageUrl(product, wishlist.productId)}
          alt={product?.name || 'Product'}
          fill
          unoptimized
          className="object-cover"
        />
      </div>
      <CardContent className="space-y-2 pt-3 pb-1">
        <div className="text-xs text-mute first-letter:capitalize">
          {product?.Category?.name || ''}
        </div>
        <Link
          href={`/detail/${wishlist.productId}`}
          className="block text-sm font-medium leading-snug text-ink hover:text-mute truncate"
        >
          {product?.name || 'Product name unavailable'}
        </Link>
        <div className="text-xs">
          <span className="text-mute">By </span>
          <span className="text-mute">{product?.seller?.name || ''}</span>
        </div>
        <div className="text-base font-medium text-ink">
          {formatIDR(product ? effectivePrice(product, wishlist.Variant) : 0)}
        </div>
        {wishlist.Variant && (
          <div className="text-xs text-mute bg-soft-cloud px-2 py-0.5 w-fit">
            Variant: {wishlist.Variant.variant}
          </div>
        )}
        <ItemActions wishlist={wishlist} state={state} />
      </CardContent>
    </Card>
  );
}
