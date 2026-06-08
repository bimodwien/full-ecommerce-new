'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatIDR } from '@/lib/utils';
import { fetchWishlists, deleteWishlist } from '@/helpers/fetch-wishlist';
import { addToCart, fetchCartCount } from '@/helpers/fetch-cart';
import { TWishlist } from '@/models/wishlist.model';
import { toast } from 'sonner';
import { useAppDispatch } from '@/libraries/redux/hooks';
import { removeWishlistProduct } from '@/libraries/redux/slices/wishlist.slice';
import { setCartCount } from '@/libraries/redux/slices/cart.slice';

const WishlistCard = () => {
  const dispatch = useAppDispatch();
  const [wishlists, setWishlists] = useState<TWishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cartLoadingId, setCartLoadingId] = useState<string | null>(null);

  const apiBase = (
    process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:8000/api'
  ).replace(/\/$/, '');
  const apiOrigin = apiBase.replace(/\/api\/?$/, '');

  const loadWishlists = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchWishlists();
      setWishlists(data);
    } catch {
      toast.error('Failed to load wishlist.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlists();
  }, [loadWishlists]);

  const handleDelete = useCallback(
    async (id: string, productId: string) => {
      setDeletingId(id);
      try {
        await deleteWishlist(id);
        setWishlists((prev) => prev.filter((w) => w.id !== id));
        dispatch(removeWishlistProduct(productId));
        toast.success('Product removed from wishlist.');
      } catch {
        toast.error('Failed to remove from wishlist.');
      } finally {
        setDeletingId(null);
      }
    },
    [dispatch],
  );

  const handleMoveToCart = useCallback(
    async (wishlist: TWishlist) => {
      if (!wishlist.productId) return;
      setCartLoadingId(wishlist.id);
      try {
        await addToCart(wishlist.productId, 1, wishlist.variantId);
        const count = await fetchCartCount();
        dispatch(setCartCount(count));
        toast.success('Product moved to cart!');
      } catch {
        toast.error('Failed to add to cart.');
      } finally {
        setCartLoadingId(null);
      }
    },
    [dispatch],
  );

  const getImageUrl = (wishlist: TWishlist) => {
    const rawImage = (wishlist.Product as any)?.Images?.[0]?.imageUrl as
      | string
      | undefined;
    if (!rawImage) return `${apiBase}/products/image/${wishlist.productId}`;
    return rawImage.startsWith('http')
      ? rawImage
      : `${apiOrigin}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
  };

  if (loading) {
    return (
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (wishlists.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-zinc-400">
        <Heart className="h-16 w-16 mb-4 text-zinc-200" />
        <p className="text-lg font-semibold">Your wishlist is empty</p>
        <p className="text-sm mt-1">
          Add your favorite products from the{' '}
          <Link href="/" className="text-emerald-500 hover:underline">
            homepage
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {wishlists.map((wishlist) => {
        const product = wishlist.Product;
        const priceNum = product
          ? typeof product.price === 'string'
            ? Number(product.price)
            : product.price
          : 0;
        const categoryName = (product as any)?.Category?.name || '';
        const vendorName = (product as any)?.seller?.name || '';

        return (
          <Card
            key={wishlist.id}
            className="relative rounded-2xl overflow-hidden p-0! gap-0!"
          >
            <div className="relative h-48 w-full">
              <Image
                src={getImageUrl(wishlist)}
                alt={product?.name || 'Product'}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <CardContent className="space-y-2 px-4 pb-4">
              <div className="pt-3 text-xs text-zinc-400 first-letter:capitalize">
                {categoryName}
              </div>
              <Link
                href={`/detail/${wishlist.productId}`}
                className="block text-sm font-bold leading-snug text-zinc-700 hover:text-emerald-600 truncate"
              >
                {product?.name || 'Product name unavailable'}
              </Link>
              <div className="text-xs">
                <span className="text-zinc-400">By </span>
                <span className="text-emerald-500">{vendorName}</span>
              </div>
              <div className="text-base font-extrabold text-emerald-600">
                {formatIDR(priceNum)}
              </div>
              {wishlist.Variant && (
                <div className="text-xs text-zinc-500 bg-zinc-100 rounded px-2 py-0.5 w-fit">
                  Variant: {wishlist.Variant.variant}
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200"
                  onClick={() => handleMoveToCart(wishlist)}
                  disabled={cartLoadingId === wishlist.id}
                >
                  <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                  Add to Cart
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500 hover:bg-red-50 border-red-200"
                  onClick={() => handleDelete(wishlist.id, wishlist.productId)}
                  disabled={deletingId === wishlist.id}
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default WishlistCard;
