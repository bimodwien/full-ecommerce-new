'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/dashboard/page-header';
import ProductFilter from '@/components/dashboard/product-filter';
import ProductTable from '@/components/dashboard/product-table';
import { Pagination } from '@/components/ui/pagination';
import { fetchProduct } from '@/helpers/fetch-product';
import { fetchCategory } from '@/helpers/fetch-category';
import { TProductList } from '@/models/product.model';
import { TCategory } from '@/models/category.model';
import { useDebounce } from 'use-debounce';

const ITEMS_PER_PAGE = 10;

export default function ProductsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 1000);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [currentPage, setCurrentPage] = useState(1);

  const [products, setProducts] = useState<TProductList[]>([]);
  const [categoriesData, setCategoriesData] = useState<TCategory[]>([]);

  useEffect(() => {
    void fetchProduct(setProducts);
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

  const filteredProducts = useMemo(() => {
    return (products || []).filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || product.stockStatus === statusFilter;
      const matchesCategory = (() => {
        if (categoryFilter === 'All Categories') return true;
        if (categoryFilter === 'Uncategorized')
          return (
            (product.Category?.name || 'Uncategorized') === 'Uncategorized'
          );
        return (
          (product.Category?.name || '').trim().toLowerCase() ===
          (categoryFilter || '').trim().toLowerCase()
        );
      })();

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, debouncedSearchTerm, statusFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // Reset to first page when filters change
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);
    switch (filterType) {
      case 'search':
        setSearchTerm(value);
        break;
      case 'status':
        setStatusFilter(value);
        break;
      case 'category':
        setCategoryFilter(value);
        break;
    }
  };

  const handleAddProduct = () => {
    router.push('/dashboard/products/add');
  };

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

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Products List"
        buttonText="Add Product"
        onButtonClick={handleAddProduct}
      />

      <ProductFilter
        searchTerm={searchTerm}
        onSearchChange={(value) => handleFilterChange('search', value)}
        statusFilter={statusFilter}
        onStatusChange={(value) => handleFilterChange('status', value)}
        categoryFilter={categoryFilter}
        onCategoryChange={(value) => handleFilterChange('category', value)}
        categories={categories}
      />

      <ProductTable
        products={paginatedProducts}
        onDeleteSuccess={handleDeleteSuccess}
      />

      {filteredProducts.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredProducts.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          className="mt-0"
        />
      )}
    </div>
  );
}
