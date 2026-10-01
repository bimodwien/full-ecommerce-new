'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/dashboard/shared/page-header';
import ProductFilter from '@/components/dashboard/products/product-filter';
import ProductTable from '@/components/dashboard/products/product-table';
import { Pagination } from '@/components/ui/pagination';
import {
  ITEMS_PER_PAGE,
  useProductList,
} from '@/components/dashboard/products/use-product-list';

export default function ProductsPage() {
  const router = useRouter();
  const list = useProductList();

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Products List"
        buttonText="Add Product"
        onButtonClick={() => router.push('/dashboard/products/add')}
      />

      <ProductFilter {...list.filterProps} />

      <ProductTable
        products={list.paginatedProducts}
        onDeleteSuccess={list.handleDeleteSuccess}
      />

      {list.totalItems > 0 && (
        <Pagination
          currentPage={list.currentPage}
          totalPages={list.totalPages}
          totalItems={list.totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={list.setCurrentPage}
          className="mt-0"
        />
      )}
    </div>
  );
}
