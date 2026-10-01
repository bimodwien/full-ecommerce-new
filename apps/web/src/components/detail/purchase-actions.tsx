import React from 'react';
import {
  ChevronUp,
  ChevronDown,
  ShoppingCart,
  Heart,
  Shuffle,
} from 'lucide-react';
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

// Icon-only at rest; the label slides out on hover (same as the wishlist card).
function AddToCartButton({ detail }: { detail: ProductDetailState }) {
  return (
    <button
      type="button"
      onClick={detail.handleAddToCart}
      disabled={detail.cartLoading}
      aria-label="Add to cart"
      className="group/cart flex h-12 items-center rounded-full bg-ink px-3.5 text-canvas hover:bg-ink/90 disabled:opacity-60 hover:cursor-pointer"
    >
      <ShoppingCart className="h-5 w-5 shrink-0" strokeWidth={1.5} />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm transition-all duration-200 group-hover/cart:ml-2 group-hover/cart:max-w-24">
        Add to cart
      </span>
    </button>
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
        strokeWidth={1.5}
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
      <AddToCartButton detail={detail} />
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
