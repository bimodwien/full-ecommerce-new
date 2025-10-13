'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { formatIDR } from '@/lib/utils';
import { TProduct, TProductList } from '@/models/product.model';

export function ProductCard({ product }: { product: TProduct | TProductList }) {
  const apiBase = (
    process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:8000/api'
  ).replace(/\/$/, '');
  const priceNum =
    typeof product.price === 'string' ? Number(product.price) : product.price;
  const imageUrl = `${apiBase}/products/image/${product.id}`;
  const categoryName = (product as any).Category?.name || '';
  const vendorName = (product as any).seller?.name || '';
  return (
    <Card className="group relative rounded-2xl overflow-hidden !p-0 !gap-0">
      <div className="relative h-40 sm:h-56 md:h-64 w-full">
        <Image
          src={imageUrl || 'https://placehold.co/400/fff/000'}
          alt={product.name}
          fill
          unoptimized
          sizes="(min-width: 1280px) 246px, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="object-cover"
        />
      </div>
      <CardContent className="space-y-2 px-3 sm:px-4 md:px-5 pb-4 md:pb-5">
        <div className="pt-4 first-letter:capitalize text-[11px] sm:text-xs text-zinc-400">
          {categoryName}
        </div>
        <Link
          href="#"
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
            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200 px-2 sm:px-3"
          >
            <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="ml-1 hidden sm:inline">Add</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
