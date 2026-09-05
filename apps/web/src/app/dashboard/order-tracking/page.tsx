'use client';
import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/dashboard/page-header';
import OrderTrackingFilter from '@/components/dashboard/order-tracking-filter';
import OrderTrackingTable from '@/components/dashboard/order-tracking-table';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchAdminOrders } from '@/helpers/fetch-order';
import { TOrder } from '@/models/order.model';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

export default function OrderTrackingPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [orders, setOrders] = useState<TOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async (page: number, status: string) => {
    try {
      setLoading(true);
      const data = await fetchAdminOrders(page, ITEMS_PER_PAGE, status);
      setOrders(data.orders);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(currentPage, statusFilter);
  }, [loadOrders, currentPage, statusFilter]);

  const handleStatusChange = (value: string) => {
    setCurrentPage(1);
    setStatusFilter(value);
  };

  const handleOrderUpdated = (updated: TOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)),
    );
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Order Tracking"
        description="Manage shipping status for paid orders"
      />

      <OrderTrackingFilter
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
      />

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : (
        <>
          <OrderTrackingTable
            orders={orders}
            onOrderUpdated={handleOrderUpdated}
          />

          {orders.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={total}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
              className="mt-0"
            />
          )}
        </>
      )}
    </div>
  );
}
