'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/homepage/product-card';
import { fetchProduct, type GetProductsQuery } from '@/helpers/fetch-product';
import { TProductList } from '@/models/product.model';
import { useSearchParams } from 'next/navigation';

const ProductCardSection = () => {
  const [products, setProducts] = useState<TProductList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        if (mounted) setLoading(true);
        const categoryId = searchParams.get('categoryId') || undefined;
        const name = searchParams.get('name') || undefined;
        const params: GetProductsQuery = {
          categoryId,
          name,
          sort: 'newest',
          page: 1,
          limit: 20,
        };
        await fetchProduct((data) => {
          if (!mounted) return;
          setProducts(data);
        }, params);
      } catch (e) {
        if (!mounted) return;
        setError('Failed to load products');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [searchParams]);

  const itemsPerPage = 8;
  const [showAll, setShowAll] = useState(false);
  const hasMore = products.length > itemsPerPage;
  const visibleProducts = showAll ? products : products.slice(0, itemsPerPage);

  return (
    <section>
      <div
        id="product-grid"
        className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
      >
        {loading && (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="animate-pulse rounded-2xl overflow-hidden border border-zinc-200"
              >
                <div className="h-40 sm:h-56 md:h-64 w-full bg-zinc-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 w-24 bg-zinc-200 rounded" />
                  <div className="h-4 w-full bg-zinc-200 rounded" />
                  <div className="h-4 w-2/3 bg-zinc-200 rounded" />
                  <div className="h-5 w-28 bg-zinc-200 rounded mt-2" />
                </div>
              </div>
            ))}
          </>
        )}
        {error && products.length === 0 && (
          <div className="col-span-full text-sm text-red-500">{error}</div>
        )}
        {!loading &&
          visibleProducts.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      {hasMore && !showAll && (
        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="px-2 text-emerald-600 text-sm hover:text-emerald-700 cursor-pointer"
            aria-controls="product-grid"
            onClick={() => setShowAll(true)}
          >
            ...more
          </Button>
        </div>
      )}
    </section>
  );
};

export default ProductCardSection;
