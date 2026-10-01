import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { fetchMyProducts } from '@/helpers/fetch-product';
import { fetchCategory } from '@/helpers/fetch-category';
import { TProductList } from '@/models/product.model';
import { TCategory } from '@/models/category.model';

export const ITEMS_PER_PAGE = 10;

interface FilterCriteria {
  search: string;
  status: string;
  category: string;
}

const matchesCategory = (product: TProductList, category: string) => {
  if (category === 'All Categories') return true;
  if (category === 'Uncategorized')
    return (product.Category?.name || 'Uncategorized') === 'Uncategorized';
  return (
    (product.Category?.name || '').trim().toLowerCase() ===
    (category || '').trim().toLowerCase()
  );
};

const filterProducts = (
  products: TProductList[],
  { search, status, category }: FilterCriteria,
) =>
  (products || []).filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) &&
      (status === 'all' || product.stockStatus === status) &&
      matchesCategory(product, category),
  );

function useProductData() {
  const [products, setProducts] = useState<TProductList[]>([]);
  const [categoriesData, setCategoriesData] = useState<TCategory[]>([]);

  useEffect(() => {
    // Filtering and pagination happen client-side, so fetch the max page size
    void fetchMyProducts(setProducts, { limit: 100 });
    void fetchCategory(setCategoriesData);
  }, []);

  const categories = useMemo(
    () => [
      'All Categories',
      'Uncategorized',
      ...categoriesData.map((c) => c.name),
    ],
    [categoriesData],
  );

  return { products, setProducts, categories };
}

function useProductFilters(resetPage: () => void) {
  const [searchTerm, setSearchTerm] = useState('');
  const [search] = useDebounce(searchTerm, 1000);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  // Reset to first page when filters change
  const withReset = (setter: (value: string) => void) => (value: string) => {
    resetPage();
    setter(value);
  };

  return {
    search,
    filterProps: {
      searchTerm,
      onSearchChange: withReset(setSearchTerm),
      statusFilter,
      onStatusChange: withReset(setStatusFilter),
      categoryFilter,
      onCategoryChange: withReset(setCategoryFilter),
    },
  };
}

export function useProductList() {
  const { products, setProducts, categories } = useProductData();
  const [currentPage, setCurrentPage] = useState(1);
  const { search, filterProps } = useProductFilters(() => setCurrentPage(1));
  const { statusFilter: status, categoryFilter: category } = filterProps;

  const filteredProducts = useMemo(
    () => filterProducts(products, { search, status, category }),
    [products, search, status, category],
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const handleDeleteSuccess = (id: string) => {
    setProducts((prev) => prev.filter((p) => String(p.id) !== id));
    // If current page becomes empty after deletion, move back one page when possible
    setCurrentPage((prevPage) => {
      const newFilteredCount = filteredProducts.length - 1;
      const newTotalPages = Math.max(
        1,
        Math.ceil(newFilteredCount / ITEMS_PER_PAGE),
      );
      return Math.min(prevPage, newTotalPages);
    });
  };

  return {
    filterProps: { ...filterProps, categories },
    paginatedProducts: filteredProducts.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE,
    ),
    totalItems: filteredProducts.length,
    totalPages: Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1,
    currentPage,
    setCurrentPage,
    handleDeleteSuccess,
  };
}
