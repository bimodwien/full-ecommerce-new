import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/libraries/redux/hooks';
import { removeWishlistEntriesForProduct } from '@/libraries/redux/slices/wishlist.slice';
import { toggleWishlist } from '@/helpers/fetch-wishlist';

// Heart button on a product card: one heart for the whole product.
export function useCardWishlist(productId: string, goToDetail: () => void) {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((s) => s.wishlist.items);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const entries = wishlistItems.filter((i) => i.productId === productId);

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // No wishlisted variant yet — send them to detail to pick one.
    if (entries.length === 0) {
      goToDetail();
      return;
    }
    if (wishlistLoading) return;
    setWishlistLoading(true);
    try {
      // Card only shows one heart for the whole product, so unwishlist every
      // variant of it, not just the most recent one.
      await Promise.all(
        entries.map((entry) =>
          toggleWishlist(entry.productId, entry.variantId),
        ),
      );
      dispatch(removeWishlistEntriesForProduct(productId));
      toast.success('Removed from wishlist.');
    } catch {
      toast.error('Failed to update wishlist.');
    } finally {
      setWishlistLoading(false);
    }
  };

  return {
    isWishlisted: entries.length > 0,
    wishlistLoading,
    handleHeartClick,
  };
}
