import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { fetchCategory } from '@/helpers/fetch-category';
import { TCategory } from '@/models/category.model';

// Replace the current URL's query string without scrolling.
function useReplaceParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (edit: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    edit(params);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
}

// Desktop search input, debounced into ?name= on the URL.
function useNameQuery() {
  const searchParams = useSearchParams();
  const replaceParams = useReplaceParams();
  const initialName = searchParams.get('name') || '';
  const [query, setQuery] = useState(initialName);
  const [debouncedQuery] = useDebounce(query, 500);
  // Keep local state in sync when the URL changes externally
  const [prevInitialName, setPrevInitialName] = useState(initialName);
  if (initialName !== prevInitialName) {
    setPrevInitialName(initialName);
    setQuery(initialName);
  }
  useEffect(() => {
    replaceParams((params) => {
      if (debouncedQuery && debouncedQuery.trim() !== '')
        params.set('name', debouncedQuery.trim());
      else params.delete('name');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);
  return { query, setQuery };
}

export function useHeaderSearch() {
  const searchParams = useSearchParams();
  const replaceParams = useReplaceParams();
  const [categories, setCategories] = useState<TCategory[]>([]);
  useEffect(() => {
    fetchCategory(setCategories).catch(() => {});
  }, []);

  const selectedCategoryId = searchParams.get('categoryId') || '';
  const selectedCategoryLabel = useMemo(
    () =>
      categories.find((c) => c.id === selectedCategoryId)?.name ||
      'All Categories',
    [categories, selectedCategoryId],
  );

  // null clears the filter ("All Categories").
  const selectCategory = (id: string | null) =>
    replaceParams((params) => {
      if (id) params.set('categoryId', id);
      else params.delete('categoryId');
    });

  return {
    categories,
    selectedCategoryLabel,
    selectCategory,
    ...useNameQuery(),
  };
}

export type HeaderSearch = ReturnType<typeof useHeaderSearch>;
