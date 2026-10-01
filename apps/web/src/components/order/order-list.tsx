'use client';
import React from 'react';
import { Pagination } from '@/components/ui/pagination';
import { ITEMS_PER_PAGE, useOrderList } from './use-order-list';
import {
  OrderCard,
  OrderListEmpty,
  OrderListSkeleton,
} from './order-list-parts';

const OrderList = () => {
  const { orders, loading, page, setPage, totalPages, totalItems } =
    useOrderList();

  if (loading) return <OrderListSkeleton />;
  if (orders.length === 0) return <OrderListEmpty />;

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default OrderList;
