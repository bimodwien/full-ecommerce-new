'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { formatIDR } from '@/lib/utils';
import { TProduct, TProductList } from '@/models/product.model';
import { useAppDispatch, useAppSelector } from '@/libraries/redux/hooks';
import { removeWishlistEntriesForProduct } from '@/libraries/redux/slices/wishlist.slice';
import { toggleWishlist } from '@/helpers/fetch-wishlist';
import { toast } from 'sonner';

export function ProductCard({ product }: { product: TProduct | TProductList }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((s) => s.wishlist.items);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const productWishlistEntries = wishlistItems.filter(
    (i) => i.productId === product.id,
  );
  const isWishlisted = productWishlistEntries.length > 0;

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

  const goToDetail = () => router.push(`/detail/${product.id}`);

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // No wishlisted variant yet — send them to detail to pick one.
    if (productWishlistEntries.length === 0) {
      goToDetail();
      return;
    }
    if (wishlistLoading) return;
    setWishlistLoading(true);
    try {
      // Card only shows one heart for the whole product, so unwishlist every
      // variant of it, not just the most recent one.
      await Promise.all(
        productWishlistEntries.map((entry) =>
          toggleWishlist(entry.productId, entry.variantId),
        ),
      );
      dispatch(removeWishlistEntriesForProduct(product.id));
      toast.success('Removed from wishlist.');
    } catch {
      toast.error('Failed to update wishlist.');
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <Card
      className="group relative overflow-hidden cursor-pointer"
      role="link"
      tabIndex={0}
      onClick={goToDetail}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToDetail();
        }
      }}
    >
      <div className="relative aspect-square w-full bg-soft-cloud">
        <Image
          src={imageUrl || 'https://placehold.co/400/fff/000'}
          alt={product.name}
          fill
          unoptimized
          sizes="(min-width: 1280px) 246px, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="object-cover"
        />
      </div>
      <CardContent className="space-y-2 pt-3 pb-1">
        <div className="first-letter:capitalize text-[11px] sm:text-xs text-mute">
          {categoryName}
        </div>
        <div className="line-clamp-2 min-h-[3.5em] text-sm sm:text-base font-medium leading-snug text-ink hover:text-mute">
          {product.name}
        </div>
        <div className="text-xs sm:text-sm">
          <span className="text-mute">By </span>
          <Link
            href="#"
            className="text-mute hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {vendorName}
          </Link>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-base sm:text-lg font-medium text-ink">
            {formatIDR(priceNum)}
          </div>
          {(product as any).oldPrice && (
            <div className="text-xs sm:text-sm font-medium text-mute line-through">
              {formatIDR((product as any).oldPrice)}
            </div>
          )}
          <button
            type="button"
            onClick={handleHeartClick}
            disabled={wishlistLoading}
            aria-label={
              isWishlisted ? 'Remove from wishlist' : 'View to wishlist'
            }
            className="h-9 w-9 flex items-center justify-center rounded-full bg-soft-cloud hover:bg-hairline-soft disabled:opacity-60 cursor-pointer"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isWishlisted ? 'fill-ink text-ink' : 'text-mute'
              }`}
            />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
