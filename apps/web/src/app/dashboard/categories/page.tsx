'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/dashboard/page-header';
import { SearchBar } from '@/components/ui/search-bar';
import CategoryTable from '@/components/dashboard/category-table';
import { Pagination } from '@/components/ui/pagination';
import { fetchCategory } from '@/helpers/fetch-category';
import { TCategory } from '@/models/category.model';
import { useDebounce } from 'use-debounce';

const ITEMS_PER_PAGE = 10;

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 1000);
  const [categoriesData, setCategoriesData] = useState<TCategory[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    fetchCategory(setCategoriesData);
  }, []);

  const filteredCategories = useMemo(() => {
    return categoriesData.filter((category) =>
      category.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
    );
  }, [debouncedSearchTerm, categoriesData]);

  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCategories = filteredCategories.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Categories"
        description="Manage your product categories"
        buttonText="Add Category"
        onButtonClick={() => router.push('/dashboard/categories/add')}
      />

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <SearchBar
          placeholder="Search categories..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-full sm:max-w-sm"
        />
      </div>

      <CategoryTable categories={paginatedCategories} />

      {filteredCategories.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredCategories.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          className="mt-0"
        />
      )}
    </div>
  );
};

export default Categories;
