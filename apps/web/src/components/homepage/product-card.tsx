'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Plus, ShoppingCart } from 'lucide-react';
import { formatIDR } from '@/lib/utils';

export type Product = {
  id: string;
  image: string;
  category: string;
  title: string;
  vendor: string;
  price: number;
  oldPrice?: number;
  label?: 'Hot' | 'Sale' | 'New';
  rating?: number; // 0..5
};

function LabelPill({ label }: { label?: Product['label'] }) {
  if (!label) return null;
  const styles: Record<NonNullable<Product['label']>, string> = {
    Hot: 'bg-pink-500',
    Sale: 'bg-sky-500',
    New: 'bg-emerald-500',
  };
  return (
    <span
      className={`absolute left-0 top-0 rounded-tl-2xl rounded-br-[20px] px-3 py-1 text-xs font-semibold text-white ${styles[label]}`}
    >
      {label}
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="group relative rounded-2xl overflow-hidden !p-0 !gap-0">
      <div className="relative h-40 sm:h-56 md:h-64 w-full">
        <Image
          src={product.image || 'https://placehold.co/400/fff/000'}
          alt={product.title}
          fill
          unoptimized
          sizes="(min-width: 1280px) 246px, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="object-cover"
        />
        <LabelPill label={product.label} />
      </div>
      <CardContent className="space-y-2 px-3 sm:px-4 md:px-5 pb-4 md:pb-5">
        <div className="pt-2 text-[11px] sm:text-xs text-zinc-400">
          {product.category}
        </div>
        <Link
          href="#"
          className="line-clamp-2 text-sm sm:text-base font-bold leading-snug text-zinc-700 hover:text-emerald-600"
        >
          {product.title}
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-zinc-500">
          <Star
            className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400"
            fill="currentColor"
          />
          <span>({product.rating?.toFixed(1) ?? '4.0'})</span>
        </div>
        <div className="text-xs sm:text-sm">
          <span className="text-zinc-400">By </span>
          <Link href="#" className="text-emerald-500 hover:underline">
            {product.vendor}
          </Link>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <div className="text-base sm:text-lg font-extrabold text-emerald-600">
              {formatIDR(product.price)}
            </div>
            {product.oldPrice && (
              <div className="text-xs sm:text-sm font-semibold text-zinc-400 line-through">
                {formatIDR(product.oldPrice)}
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
