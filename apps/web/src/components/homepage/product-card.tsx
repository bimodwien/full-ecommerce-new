'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { formatIDR } from '@/lib/utils';
import { TProduct, TProductList } from '@/models/product.model';

export function ProductCard({ product }: { product: TProduct | TProductList }) {
  const router = useRouter();

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
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-base sm:text-lg font-medium text-ink">
            {formatIDR(priceNum)}
          </div>
          {(product as any).oldPrice && (
            <div className="text-xs sm:text-sm font-medium text-mute line-through">
              {formatIDR((product as any).oldPrice)}
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={goToDetail}
            className="gap-2 rounded-none cursor-pointer"
          >
            <ShoppingCart className="h-2  w-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
