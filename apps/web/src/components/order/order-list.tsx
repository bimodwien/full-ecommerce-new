'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Pagination } from '@/components/ui/pagination';
import { formatIDR } from '@/lib/utils';
import { fetchOrders } from '@/helpers/fetch-order';
import { TOrder } from '@/models/order.model';
import OrderStatusBadge from './order-status-badge';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

const OrderList = () => {
  const [orders, setOrders] = useState<TOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadOrders = useCallback(async (targetPage: number) => {
    try {
      setLoading(true);
      const data = await fetchOrders(targetPage, ITEMS_PER_PAGE);
      setOrders(data.orders);
      setTotalPages(data.totalPages);
      setTotalItems(data.total);
    } catch {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(page);
  }, [loadOrders, page]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone">
        <Package className="h-16 w-16 mb-4 text-stone" />
        <p className="text-lg font-medium text-ink">No orders yet</p>
        <p className="text-sm mt-1 mb-4 text-mute">
          Your orders will show up here after checkout.
        </p>
        <Button asChild size="pill">
          <Link href="/">
            Go to homepage
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => {
        const totalAmount =
          typeof order.totalAmount === 'string'
            ? Number(order.totalAmount)
            : order.totalAmount;
        const itemCount = (order.OrderItems || []).reduce(
          (acc, item) => acc + item.quantity,
          0,
        );

        return (
          <Link key={order.id} href={`/order/${order.id}`}>
            <Card className="overflow-hidden hover:border-ink/30 transition-colors">
              <CardContent className="p-4 bg-canvas border border-hairline">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <div className="text-xs text-mute">Order ID</div>
                    <div className="text-sm font-medium text-ink truncate max-w-55">
                      {order.id}
                    </div>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between text-sm text-mute">
                  <span>{itemCount} item(s)</span>
                  <span>
                    {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-mute">Total</span>
                  <span className="text-base font-medium text-ink">
                    {formatIDR(totalAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}

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
