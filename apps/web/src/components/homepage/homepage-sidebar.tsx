'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatIDR } from '@/lib/utils';

type CategoryItem = {
  label: string;
  count: number;
  href?: string;
};

const CATEGORIES: CategoryItem[] = [
  { label: 'Milks & Dairies', count: 3 },
  { label: 'Clothing', count: 4 },
  { label: 'Pet Foods', count: 5 },
  { label: 'Baking material', count: 8 },
  { label: 'Fresh Fruit', count: 10 },
  // Extra items to demonstrate "...more" behavior
  { label: 'Vegetables', count: 12 },
  { label: 'Beverages', count: 7 },
  { label: 'Snacks', count: 9 },
];

type ProductItem = {
  name: string;
  price: number;
  href?: string;
};

const NEW_PRODUCTS: ProductItem[] = [
  { name: 'Chen Cardigan', price: 99500 },
  { name: 'Chen Sweater', price: 89500 },
  { name: 'Colorful Jacket', price: 25000 },
];

const HomepageSidebar = () => {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const hasMoreCategories = CATEGORIES.length > 5;
  const visibleCategories = showAllCategories
    ? CATEGORIES
    : CATEGORIES.slice(0, 5);

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
                <li key={item.label}>
                  <a
                    href={item.href ?? '#'}
                    className="flex items-center justify-between gap-2 rounded-md py-2 text-sm text-zinc-700 hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden
                        className="h-2 w-2 shrink-0 rounded-full bg-emerald-600"
                      />
                      <span className="truncate pl-1">{item.label}</span>
                    </span>
                    <Badge
                      variant="secondary"
                      aria-label={`${item.count} items`}
                    >
                      {item.count}
                    </Badge>
                  </a>
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

      {/* New products */}
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
            {NEW_PRODUCTS.map((p) => (
              <li key={p.name} className="py-3">
                <a
                  href="#"
                  className="grid grid-cols-[56px_1fr] items-center gap-3"
                >
                  {/* Image placeholder */}
                  <div className="h-14 w-14 rounded-md bg-emerald-50 border border-emerald-100" />
                  {/* Info */}
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-emerald-600">
                      {p.name}
                    </div>
                    <div className="text-zinc-700 text-sm">{formatIDR(p.price)}</div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </aside>
  );
};

export default HomepageSidebar;
