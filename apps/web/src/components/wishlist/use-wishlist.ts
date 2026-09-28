import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { fetchWishlists } from '@/helpers/fetch-wishlist';
import { TWishlist } from '@/models/wishlist.model';
import { useAppDispatch } from '@/libraries/redux/hooks';
import { matchesProductFilter } from '@/lib/product-display';
import { moveWishlistToCart, removeWishlistItem } from './wishlist-actions';

function useWishlistItems() {
  const searchParams = useSearchParams();
  const [wishlists, setWishlists] = useState<TWishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const name = searchParams.get('name') || '';
  const categoryId = searchParams.get('categoryId') || '';

  const filteredWishlists = useMemo(
    () =>
      wishlists.filter((w) =>
        matchesProductFilter(w.Product, name, categoryId),
      ),
    [wishlists, name, categoryId],
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setWishlists(await fetchWishlists());
      } catch {
        toast.error('Failed to load wishlist.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { wishlists, setWishlists, filteredWishlists, loading };
}

export function useWishlist() {
  const dispatch = useAppDispatch();
  const items = useWishlistItems();
  const { setWishlists } = items;
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cartLoadingId, setCartLoadingId] = useState<string | null>(null);

  const handleDelete = useCallback(
    (wishlist: TWishlist) =>
      removeWishlistItem(wishlist, { setWishlists, setDeletingId, dispatch }),
    [setWishlists, dispatch],
  );
  const handleMoveToCart = useCallback(
    (wishlist: TWishlist) =>
      moveWishlistToCart(wishlist, setCartLoadingId, dispatch),
    [dispatch],
  );

  return {
    wishlists: items.wishlists,
    filteredWishlists: items.filteredWishlists,
    loading: items.loading,
    deletingId,
    cartLoadingId,
    handleDelete,
    handleMoveToCart,
  };
}

export type WishlistState = ReturnType<typeof useWishlist>;
