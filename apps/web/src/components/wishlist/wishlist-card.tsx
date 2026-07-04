'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
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
import { useSearchParams } from 'next/navigation';

const WishlistCard = () => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const [wishlists, setWishlists] = useState<TWishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cartLoadingId, setCartLoadingId] = useState<string | null>(null);

  const name = searchParams.get('name') || '';
  const categoryId = searchParams.get('categoryId') || '';

  const filteredWishlists = useMemo(() => {
    return wishlists.filter((wishlist) => {
      const product = wishlist.Product as any;
      const matchesName = name
        ? product?.name?.toLowerCase().includes(name.toLowerCase())
        : true;
      const matchesCategory = categoryId
        ? product?.categoryId === categoryId
        : true;
      return matchesName && matchesCategory;
    });
  }, [wishlists, name, categoryId]);

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
      <div className="flex-1 grid grid-cols-1 tablet-narrow:grid-cols-2 desktop-small:grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    );
  }

  if (wishlists.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-stone">
        <Heart className="h-16 w-16 mb-4 text-stone" />
        <p className="text-lg font-medium text-ink">Your wishlist is empty</p>
        <p className="text-sm mt-1 mb-4 text-mute">
          Add your favorite products from the homepage.
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

  if (filteredWishlists.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
        <p className="text-base font-medium">No wishlist items found</p>
        <p className="text-sm">Try changing your search or filter.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 grid grid-cols-1 tablet-narrow:grid-cols-2 desktop-small:grid-cols-3 gap-2">
      {filteredWishlists.map((wishlist) => {
        const product = wishlist.Product;
        const priceNum = product
          ? typeof product.price === 'string'
            ? Number(product.price)
            : product.price
          : 0;
        const categoryName = (product as any)?.Category?.name || '';
        const vendorName = (product as any)?.seller?.name || '';

        return (
          <Card key={wishlist.id} className="relative overflow-hidden">
            <div className="relative aspect-square w-full bg-soft-cloud">
              <Image
                src={getImageUrl(wishlist)}
                alt={product?.name || 'Product'}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <CardContent className="space-y-2 pt-3 pb-1">
              <div className="text-xs text-mute first-letter:capitalize">
                {categoryName}
              </div>
              <Link
                href={`/detail/${wishlist.productId}`}
                className="block text-sm font-medium leading-snug text-ink hover:text-mute truncate"
              >
                {product?.name || 'Product name unavailable'}
              </Link>
              <div className="text-xs">
                <span className="text-mute">By </span>
                <span className="text-mute">{vendorName}</span>
              </div>
              <div className="text-base font-medium text-ink">
                {formatIDR(priceNum)}
              </div>
              {wishlist.Variant && (
                <div className="text-xs text-mute bg-soft-cloud px-2 py-0.5 w-fit">
                  Variant: {wishlist.Variant.variant}
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => handleMoveToCart(wishlist)}
                  disabled={cartLoadingId === wishlist.id}
                >
                  <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                  Add to Cart
                </Button>
                <button
                  type="button"
                  onClick={() => handleDelete(wishlist.id, wishlist.productId)}
                  disabled={deletingId === wishlist.id}
                  aria-label="Remove from wishlist"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-soft-cloud text-ink hover:bg-hairline-soft disabled:opacity-60"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default WishlistCard;
