import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { fetchOrders } from '@/helpers/fetch-order';
import { TOrder } from '@/models/order.model';

export const ITEMS_PER_PAGE = 10;

export function useOrderList() {
  const [orders, setOrders] = useState<TOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchOrders(page, ITEMS_PER_PAGE);
        setOrders(data.orders);
        setTotalPages(data.totalPages);
        setTotalItems(data.total);
      } catch {
        toast.error('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  return { orders, loading, page, setPage, totalPages, totalItems };
}
