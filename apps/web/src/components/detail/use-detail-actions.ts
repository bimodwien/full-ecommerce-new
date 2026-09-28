import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { toggleWishlist } from '@/helpers/fetch-wishlist';
import { addToCart, fetchCartCount } from '@/helpers/fetch-cart';
import { useAppDispatch, useAppSelector } from '@/libraries/redux/hooks';
import {
  addWishlistEntry,
  removeWishlistEntry,
} from '@/libraries/redux/slices/wishlist.slice';
import { setCartCount } from '@/libraries/redux/slices/cart.slice';

function useWishlistToggle(id: string, variantId: string | null) {
  const dispatch = useAppDispatch();
  const isLoggedIn = Boolean(useAppSelector((s) => s.auth).id);
  const wishlistItems = useAppSelector((s) => s.wishlist.items);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Wishlist status must match the currently selected variant, not just
  // "this product has some wishlisted variant".
  const wishlisted = wishlistItems.some(
    (i) => i.productId === id && (i.variantId ?? null) === variantId,
  );

  const handleWishlist = useCallback(async () => {
    if (!isLoggedIn) {
      toast.warning('You must be logged in to add to wishlist.');
      return;
    }
    if (wishlistLoading) return;
    setWishlistLoading(true);
    try {
      const result = await toggleWishlist(id, variantId);
      if (result.added && result.wishlist) {
        const entry = { id: result.wishlist.id, productId: id, variantId };
        dispatch(addWishlistEntry(entry));
      } else {
        dispatch(removeWishlistEntry({ productId: id, variantId }));
      }
      toast.success(
        result.added ? 'Added to wishlist!' : 'Removed from wishlist.',
      );
    } catch {
      toast.error('Failed to update wishlist.');
    } finally {
      setWishlistLoading(false);
    }
  }, [isLoggedIn, wishlistLoading, id, variantId, dispatch]);

  return { wishlisted, wishlistLoading, handleWishlist };
}

function useAddToCartAction(id: string, qty: number, variantId: string | null) {
  const dispatch = useAppDispatch();
  const isLoggedIn = Boolean(useAppSelector((s) => s.auth).id);
  const [cartLoading, setCartLoading] = useState(false);

  const handleAddToCart = useCallback(async () => {
    if (!isLoggedIn) {
      toast.warning('You must be logged in to add to cart.');
      return;
    }
    if (cartLoading) return;
    setCartLoading(true);
    try {
      await addToCart(id, qty, variantId);
      dispatch(setCartCount(await fetchCartCount()));
      toast.success('Product added to cart!');
    } catch {
      toast.error('Failed to add to cart.');
    } finally {
      setCartLoading(false);
    }
  }, [isLoggedIn, cartLoading, id, qty, variantId, dispatch]);

  return { cartLoading, handleAddToCart };
}

// Wishlist and add-to-cart for the product detail page.
export function useDetailActions(
  id: string,
  qty: number,
  selectedVariantId: string | null,
) {
  const variantId = selectedVariantId ?? null;
  return {
    ...useWishlistToggle(id, variantId),
    ...useAddToCartAction(id, qty, variantId),
  };
}
