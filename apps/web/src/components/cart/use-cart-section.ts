import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { fetchCarts } from '@/helpers/fetch-cart';
import { TCart } from '@/models/cart.model';
import { useAppDispatch } from '@/libraries/redux/hooks';
import { matchesProductFilter } from '@/lib/product-display';
import { cartTotals } from './cart-item-meta';
import { useCartSelection } from './use-cart-selection';
import { changeQuantity, removeCartItem } from './cart-actions';

function useCartItems() {
  const [carts, setCarts] = useState<TCart[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setCarts(await fetchCarts());
      } catch {
        toast.error('Failed to load cart.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  return { carts, setCarts, loading };
}

function useFilteredCarts(carts: TCart[]) {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || '';
  const categoryId = searchParams.get('categoryId') || '';
  return useMemo(
    () =>
      carts.filter((c) => matchesProductFilter(c.Product, name, categoryId)),
    [carts, name, categoryId],
  );
}

export function useCartSection() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { carts, setCarts, loading } = useCartItems();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const filteredCarts = useFilteredCarts(carts);
  const selection = useCartSelection(filteredCarts);
  const { selectedIds, unselect } = selection;

  const handleQuantityChange = (cart: TCart, delta: number) =>
    changeQuantity(cart, delta, setCarts, setUpdatingId);
  const handleDelete = (id: string) =>
    removeCartItem(id, { setCarts, setDeletingId, unselect, dispatch });
  const handleProceedToCheckout = () => {
    const ids = Array.from(selectedIds).join(',');
    router.push(`/checkout?items=${encodeURIComponent(ids)}`);
  };
  const totals = cartTotals(carts.filter((c) => selectedIds.has(c.id)));

  return {
    carts,
    loading,
    filteredCarts,
    updatingId,
    deletingId,
    selection,
    ...totals,
    handleQuantityChange,
    handleDelete,
    handleProceedToCheckout,
  };
}

export type CartSectionState = ReturnType<typeof useCartSection>;
