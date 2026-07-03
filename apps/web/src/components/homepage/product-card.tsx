'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart } from 'lucide-react';
import { formatIDR } from '@/lib/utils';
import { TProduct, TProductList } from '@/models/product.model';
import { useAppDispatch, useAppSelector } from '@/libraries/redux/hooks';
import {
  addWishlistProduct,
  removeWishlistProduct,
} from '@/libraries/redux/slices/wishlist.slice';
import { setCartCount } from '@/libraries/redux/slices/cart.slice';
import { toggleWishlist } from '@/helpers/fetch-wishlist';
import { addToCart, fetchCartCount } from '@/helpers/fetch-cart';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export function ProductCard({ product }: { product: TProduct | TProductList }) {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);
  const wishlistProductIds = useAppSelector((s) => s.wishlist.productIds);
  const isLoggedIn = Boolean(auth.id);
  const wishlisted = wishlistProductIds.includes(product.id);

  const priceNum =
    typeof product.price === 'string' ? Number(product.price) : product.price;
  const apiBase = (
    process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:8000/api'
  ).replace(/\/$/, '');
  const apiOrigin = apiBase.replace(/\/api\/?$/, '');
  const rawImage = (product as any).Images?.[0]?.imageUrl as string | undefined;
  const imageUrl = rawImage
    ? rawImage.startsWith('http')
      ? rawImage
      : `${apiOrigin}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`
    : `${apiBase}/products/image/${product.id}`;
  const categoryName = (product as any).Category?.name || '';
  const vendorName = (product as any).seller?.name || '';

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  const handleWishlist = useCallback(async () => {
    if (!isLoggedIn) {
      toast.warning('You must be logged in to add to wishlist.');
      return;
    }
    if (wishlistLoading) return;
    setWishlistLoading(true);
    try {
      const result = await toggleWishlist(product.id);
      if (result.added) {
        dispatch(addWishlistProduct(product.id));
      } else {
        dispatch(removeWishlistProduct(product.id));
      }
      toast.success(
        result.added ? 'Added to wishlist!' : 'Removed from wishlist.',
      );
    } catch {
      toast.error('Failed to update wishlist.');
    } finally {
      setWishlistLoading(false);
    }
  }, [isLoggedIn, wishlistLoading, product.id, dispatch]);

  return (
    <Card className="group relative overflow-hidden">
      <div className="relative aspect-square w-full bg-soft-cloud">
        <Image
          src={imageUrl || 'https://placehold.co/400/fff/000'}
          alt={product.name}
          fill
          unoptimized
          sizes="(min-width: 1280px) 246px, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="object-cover"
        />
        {/* Wishlist button */}
        <button
          type="button"
          onClick={handleWishlist}
          disabled={wishlistLoading}
          className="absolute top-2 right-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-soft-cloud transition-colors disabled:opacity-60"
          aria-label={wishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
        >
          <Heart
            className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors ${wishlisted ? 'fill-ink text-ink' : 'text-mute'}`}
          />
        </button>
      </div>
      <CardContent className="space-y-2 pt-3 pb-1">
        <div className="first-letter:capitalize text-[11px] sm:text-xs text-mute">
          {categoryName}
        </div>
        <Link
          href={`/detail/${product.id}`}
          className="line-clamp-4 text-sm sm:text-base font-medium leading-snug text-ink hover:text-mute truncate"
        >
          {product.name}
        </Link>
        <div className="text-xs sm:text-sm">
          <span className="text-mute">By </span>
          <Link href="#" className="text-mute hover:underline">
            {vendorName}
          </Link>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <div className="text-base sm:text-lg font-medium text-ink">
              {formatIDR(priceNum)}
            </div>
            {(product as any).oldPrice && (
              <div className="text-xs sm:text-sm font-medium text-mute line-through">
                {formatIDR((product as any).oldPrice)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
