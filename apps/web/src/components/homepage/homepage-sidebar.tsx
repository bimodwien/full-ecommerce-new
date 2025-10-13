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
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-xl text-zinc-700 font-semibold">
              Categories
            </CardTitle>
            <div className="mt-2 h-0.5 w-16 rounded bg-emerald-300" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <nav aria-label="Product categories">
            <ul id="sidebar-categories" className="flex flex-col gap-2">
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
                    className={`w-full text-left flex items-center justify-between gap-2 rounded-md py-2 px-2 text-sm transition-colors ${
                      selectedCategoryId === item.id
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-zinc-700 hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden
                        className="h-2 w-2 shrink-0 rounded-full bg-emerald-600"
                      />
                      <span className="truncate pl-1">{item.name}</span>
                    </span>
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
                  variant="ghost"
                  size="sm"
                  className="px-2 text-emerald-600 text-sm hover:text-emerald-700 cursor-pointer"
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
      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle className="text-xl text-zinc-700 font-semibold">
              New products
            </CardTitle>
            <div className="mt-2 h-0.5 w-16 rounded bg-emerald-300" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="divide-y divide-zinc-200">
            {newest.slice(0, 3).map((p) => (
              <li key={p.id} className="py-3">
                <a
                  href={`#/product/${p.id}`}
                  className="grid grid-cols-[56px_1fr] items-center gap-3"
                >
                  {/* Image */}
                  <Image
                    src={`http://localhost:8000/api/products/image/${p.id}`}
                    alt={p.name}
                    className="h-14 w-14 rounded-md object-cover border border-emerald-100 bg-emerald-50"
                    width={56}
                    height={56}
                  />
                  {/* Info */}
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-emerald-600">
                      {p.name}
                    </div>
                    <div className="text-zinc-700 text-sm">
                      {formatIDR(
                        typeof p.price === 'string' ? Number(p.price) : p.price,
                      )}
                    </div>
                  </div>
                </a>
              </li>
            ))}
            {newest.length === 0 && (
              <li className="py-3 text-sm text-zinc-500">No products</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </aside>
  );
};

export default HomepageSidebar;
