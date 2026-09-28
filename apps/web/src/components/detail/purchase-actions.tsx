import React from 'react';
import {
  ChevronUp,
  ChevronDown,
  ShoppingCart,
  Heart,
  Shuffle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductDetailState } from './use-product-detail';

const iconButton =
  'flex-1 flex items-center justify-center text-ink hover:bg-soft-cloud';

function QtyStepper({ detail }: { detail: ProductDetailState }) {
  const { qty, setQty, selectedVariant } = detail;
  const max = selectedVariant?.stock ?? 99;
  return (
    <div className="flex items-stretch h-12 w-24 rounded-full border border-hairline overflow-hidden bg-canvas">
      <div className="flex-1 flex items-center justify-center text-ink text-base">
        {qty}
      </div>
      <div className="w-8 flex flex-col">
        <button
          type="button"
          className={iconButton}
          onClick={() => setQty((q) => Math.min(q + 1, max))}
          aria-label="Increase quantity"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={iconButton}
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          aria-label="Decrease quantity"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function WishlistButton({ detail }: { detail: ProductDetailState }) {
  const { wishlisted } = detail;
  return (
    <button
      type="button"
      onClick={detail.handleWishlist}
      disabled={detail.wishlistLoading}
      className="h-12 w-12 rounded-full bg-soft-cloud flex items-center justify-center transition-colors disabled:opacity-60"
      aria-label={wishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          wishlisted ? 'fill-ink text-ink' : 'text-mute'
        }`}
      />
    </button>
  );
}

export default function PurchaseActions({
  detail,
}: {
  detail: ProductDetailState;
}) {
  return (
    <div className="flex items-center gap-3 pt-5">
      <QtyStepper detail={detail} />
      <Button
        size="pill"
        onClick={detail.handleAddToCart}
        disabled={detail.cartLoading}
        className="font-medium tracking-wide flex items-center gap-1 disabled:opacity-60"
      >
        <ShoppingCart className="h-5 w-5" />
        Add to cart
      </Button>
      <WishlistButton detail={detail} />
      <button
        type="button"
        className="h-12 w-12 rounded-full bg-soft-cloud text-mute flex items-center justify-center"
        aria-label="Compare"
      >
        <Shuffle className="h-5 w-5" />
      </button>
    </div>
  );
}
