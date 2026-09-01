'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatIDR } from '@/lib/utils';
import { fetchCategory } from '@/helpers/fetch-category';
import { TCategory } from '@/models/category.model';
import { fetchProduct, type GetProductsQuery } from '@/helpers/fetch-product';
import { TProductList } from '@/models/product.model';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

// Dynamic categories from API
type CategoryItem = TCategory;

const HomepageSidebar = () => {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [newest, setNewest] = useState<TProductList[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const selectedCategoryId = searchParams.get('categoryId');

  // fetch categories
  useEffect(() => {
    fetchCategory(setCategories).catch(() => {});
  }, []);

  // fetch newest 3 products
  useEffect(() => {
    const params: GetProductsQuery = { sort: 'newest', limit: 3, page: 1 };
    fetchProduct(setNewest, params).catch(() => {});
  }, []);

  // no-op effect: selection derived from URL via useSearchParams

  const hasMoreCategories = categories.length > 5;
  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, 5);

  return (
    <aside className="w-full max-w-72">
      <Card className="gap-2">
        <CardHeader>
          <div>
            <CardTitle className="text-xl text-ink font-semibold">
              Categories
            </CardTitle>
            <div className="mt-2 h-0.5 w-16 bg-hairline" />
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <nav aria-label="Product categories">
            <ul id="sidebar-categories" className="flex flex-col gap-0">
              {visibleCategories.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams(
                        searchParams.toString(),
                      );
                      if (selectedCategoryId === item.id) {
                        params.delete('categoryId');
                      } else {
                        params.set('categoryId', item.id);
                      }
                      const qs = params.toString();
                      router.replace(qs ? `${pathname}?${qs}` : pathname, {
                        scroll: false,
                      });
                    }}
                    className={`w-full text-left flex items-center justify-between gap-1 py-2 px-2 text-sm transition-colors ${
                      selectedCategoryId === item.id
                        ? 'bg-soft-cloud text-ink font-medium'
                        : 'text-ink hover:bg-soft-cloud'
                    }`}
                  >
                    <span className="truncate">{item.name}</span>
                    <Badge
                      variant="secondary"
                      aria-label={`${item.productCount ?? 0} items`}
                    >
                      {item.productCount ?? 0}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
            {hasMoreCategories && (
              <div className="mt-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="cursor-pointer"
                  aria-expanded={showAllCategories}
                  aria-controls="sidebar-categories"
                  onClick={() => setShowAllCategories((v) => !v)}
                >
                  {showAllCategories ? 'Show less' : '...more'}
                </Button>
              </div>
            )}
          </nav>
        </CardContent>
      </Card>

      {/* New products - top 3 newest */}
      <Card className="mt-6 gap-2">
        <CardHeader>
          <div>
            <CardTitle className="text-xl text-ink font-semibold">
              New products
            </CardTitle>
            <div className="mt-2 h-0.5 w-16 bg-hairline" />
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <ul className="divide-y divide-hairline">
            {newest.slice(0, 3).map((p) => (
              <li key={p.id} className="py-3">
                <a
                  href={`/detail/${p.id}`}
                  className="grid grid-cols-[56px_1fr] items-center gap-3"
                >
                  {/* Image */}
                  {(() => {
                    const apiBase = (
                      process.env.NEXT_PUBLIC_BASE_API_URL ||
                      'http://localhost:8000/api'
                    ).replace(/\/$/, '');
                    const apiOrigin = apiBase.replace(/\/api\/?$/, '');
                    const rawImage = (p as any).Images?.[0]?.imageUrl as
                      string | undefined;
                    const src = rawImage
                      ? rawImage.startsWith('http')
                        ? rawImage
                        : `${apiOrigin}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`
                      : `${apiBase}/products/image/${p.id}`;
                    return (
                      <Image
                        src={src}
                        alt={p.name}
                        className="h-14 w-14 object-cover bg-soft-cloud"
                        width={56}
                        height={56}
                      />
                    );
                  })()}
                  {/* Info */}
                  <div className="min-w-0">
                    <div className="truncate font-md text-ink">{p.name}</div>
                    <div className="text-ink text-sm">
                      {formatIDR(
                        typeof p.price === 'string' ? Number(p.price) : p.price,
                      )}
                    </div>
                  </div>
                </a>
              </li>
            ))}
            {newest.length === 0 && (
              <li className="py-3 text-sm text-mute">No products</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </aside>
  );
};

export default HomepageSidebar;
