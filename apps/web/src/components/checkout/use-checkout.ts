import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { fetchCarts } from '@/helpers/fetch-cart';
import { TCart } from '@/models/cart.model';
import { useAppDispatch } from '@/libraries/redux/hooks';
import { cartTotals } from '@/components/cart/cart-item-meta';
import { placeOrder } from './place-order';

// Loads the carts picked on the cart page (?items=id1,id2).
function useCheckoutItems() {
  const searchParams = useSearchParams();
  const [carts, setCarts] = useState<TCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [missingCount, setMissingCount] = useState(0);

  const requestedIds = useMemo(() => {
    const raw = searchParams.get('items') || '';
    return Array.from(new Set(raw.split(',').filter(Boolean)));
  }, [searchParams]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchCarts();
        const selected = data.filter((c) => requestedIds.includes(c.id));
        setCarts(selected);
        setMissingCount(requestedIds.length - selected.length);
      } catch {
        toast.error('Failed to load checkout items.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [requestedIds]);

  return { carts, loading, missingCount };
}

export function useCheckout() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { carts, loading, missingCount } = useCheckoutItems();
  const [snapReady, setSnapReady] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handlePayNow = useCallback(async () => {
    if (carts.length === 0) return;
    setPlacingOrder(true);
    await placeOrder(carts, {
      dispatch,
      go: (url) => router.push(url),
      onPlaced: () => setOrderPlaced(true),
    });
    setPlacingOrder(false);
  }, [carts, dispatch, router]);

  const totals = cartTotals(carts);
  const busy = placingOrder || orderPlaced;

  return {
    carts,
    loading,
    missingCount,
    snapReady,
    setSnapReady,
    busy,
    ...totals,
    handlePayNow,
  };
}
