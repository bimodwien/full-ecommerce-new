'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { formatIDR } from '@/lib/utils';
import { listImageUrl, toPrice } from '@/lib/product-display';
import { TProduct, TProductList } from '@/models/product.model';
import { useCardWishlist } from './use-card-wishlist';

type CardProduct = TProduct | TProductList;

// "Rp X – Rp Y" when variants are priced differently, else a single price.
function CardPrice({ product }: { product: CardProduct }) {
  const min = toPrice(product.price);
  const max = product.priceMax ?? min;
  return (
    <div className="text-base sm:text-lg font-medium text-ink">
      {max > min ? `${formatIDR(min)} – ${formatIDR(max)}` : formatIDR(min)}
    </div>
  );
}

type HeartProps = ReturnType<typeof useCardWishlist>;

function HeartButton({
  isWishlisted,
  wishlistLoading,
  handleHeartClick,
}: HeartProps) {
  return (
    <button
      type="button"
      onClick={handleHeartClick}
      disabled={wishlistLoading}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'View to wishlist'}
      className="h-9 w-9 flex items-center justify-center rounded-full bg-soft-cloud hover:bg-hairline-soft disabled:opacity-60 cursor-pointer"
    >
      <Heart
        className={`h-4 w-4 transition-colors ${
          isWishlisted ? 'fill-ink text-ink' : 'text-mute'
        }`}
      />
    </button>
  );
}

function CardBody({
  product,
  heart,
}: {
  product: CardProduct;
  heart: HeartProps;
}) {
  const p = product as any;
  return (
    <CardContent className="space-y-2 pt-3 pb-1">
      <div className="first-letter:capitalize text-[11px] sm:text-xs text-mute">
        {p.Category?.name || ''}
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
          {p.seller?.name || ''}
        </Link>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <CardPrice product={product} />
        {p.oldPrice && (
          <div className="text-xs sm:text-sm font-medium text-mute line-through">
            {formatIDR(p.oldPrice)}
          </div>
        )}
        <HeartButton {...heart} />
      </div>
    </CardContent>
  );
}

export function ProductCard({ product }: { product: CardProduct }) {
  const router = useRouter();
  const goToDetail = () => router.push(`/detail/${product.id}`);
  const heart = useCardWishlist(product.id, goToDetail);

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
          src={listImageUrl(product, product.id)}
          alt={product.name}
          loading="eager"
          fill
          unoptimized
          sizes="(min-width: 1280px) 246px, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="object-cover"
        />
      </div>
      <CardBody product={product} heart={heart} />
    </Card>
  );
}
