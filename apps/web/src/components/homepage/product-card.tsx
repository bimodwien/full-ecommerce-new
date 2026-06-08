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

  const handleAddToCart = useCallback(async () => {
    if (!isLoggedIn) {
      toast.warning('You must be logged in to add to cart.');
      return;
    }
    if (cartLoading) return;
    setCartLoading(true);
    try {
      await addToCart(product.id, 1);
      const count = await fetchCartCount();
      dispatch(setCartCount(count));
      toast.success('Product added to cart!');
    } catch {
      toast.error('Failed to add to cart.');
    } finally {
      setCartLoading(false);
    }
  }, [isLoggedIn, cartLoading, product.id, dispatch]);

  return (
    <Card className="group relative rounded-2xl overflow-hidden p-0! gap-0!">
      <div className="relative h-40 sm:h-56 md:h-64 w-full">
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
          className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white shadow transition-colors disabled:opacity-60"
          aria-label={wishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
        >
          <Heart
            className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-zinc-400 hover:text-red-400'}`}
          />
        </button>
      </div>
      <CardContent className="space-y-2 px-3 sm:px-4 md:px-5 pb-4 md:pb-5">
        <div className="pt-4 first-letter:capitalize text-[11px] sm:text-xs text-zinc-400">
          {categoryName}
        </div>
        <Link
          href={`/detail/${product.id}`}
          className="line-clamp-4 text-sm sm:text-base font-bold leading-snug text-zinc-700 hover:text-emerald-600 truncate"
        >
          {product.name}
        </Link>
        {/* Rating removed per request */}
        <div className="text-xs sm:text-sm">
          <span className="text-zinc-400">By </span>
          <Link href="#" className="text-emerald-500 hover:underline">
            {vendorName}
          </Link>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <div className="text-base sm:text-lg font-extrabold text-emerald-600">
              {formatIDR(priceNum)}
            </div>
            {(product as any).oldPrice && (
              <div className="text-xs sm:text-sm font-semibold text-zinc-400 line-through">
                {formatIDR((product as any).oldPrice)}
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddToCart}
            disabled={cartLoading}
            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200 px-2 sm:px-3 disabled:opacity-60"
          >
            <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="ml-1 hidden sm:inline">Add</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
