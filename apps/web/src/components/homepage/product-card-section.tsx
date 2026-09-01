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
        className="grid grid-cols-1 mobile-landscape:grid-cols-2 tablet:grid-cols-3 desktop-small:grid-cols-4 gap-4"
      >
        {loading && (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="overflow-hidden">
                <div className="aspect-square w-full animate-pulse bg-soft-cloud" />
                <div className="pt-3 space-y-2">
                  <div className="h-3 w-24 animate-pulse bg-soft-cloud" />
                  <div className="h-4 w-full animate-pulse bg-soft-cloud" />
                  <div className="h-4 w-2/3 animate-pulse bg-soft-cloud" />
                  <div className="h-5 w-28 animate-pulse bg-soft-cloud mt-2" />
                </div>
              </div>
            ))}
          </>
        )}
        {error && products.length === 0 && (
          <div className="col-span-full text-sm text-sale">{error}</div>
        )}
        {!loading && !error && products.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <p className="text-base font-medium">No products found</p>
            <p className="text-sm">Try changing your search or filter.</p>
          </div>
        )}
        {!loading &&
          visibleProducts.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      {hasMore && !showAll && (
        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="cursor-pointer"
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
