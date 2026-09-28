import { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';
import { deleteWishlist } from '@/helpers/fetch-wishlist';
import { addToCart, fetchCartCount } from '@/helpers/fetch-cart';
import { TWishlist } from '@/models/wishlist.model';
import { AppDispatch } from '@/libraries/redux/store';
import { removeWishlistEntry } from '@/libraries/redux/slices/wishlist.slice';
import { setCartCount } from '@/libraries/redux/slices/cart.slice';

type SetId = Dispatch<SetStateAction<string | null>>;

type RemoveDeps = {
  setWishlists: Dispatch<SetStateAction<TWishlist[]>>;
  setDeletingId: SetId;
  dispatch: AppDispatch;
};

export async function removeWishlistItem(
  wishlist: TWishlist,
  deps: RemoveDeps,
) {
  const { id, productId, variantId } = wishlist;
  deps.setDeletingId(id);
  try {
    await deleteWishlist(id);
    deps.setWishlists((prev) => prev.filter((w) => w.id !== id));
    deps.dispatch(removeWishlistEntry({ id, productId, variantId }));
    toast.success('Product removed from wishlist.');
  } catch {
    toast.error('Failed to remove from wishlist.');
  } finally {
    deps.setDeletingId(null);
  }
}

export async function moveWishlistToCart(
  wishlist: TWishlist,
  setCartLoadingId: SetId,
  dispatch: AppDispatch,
) {
  if (!wishlist.productId) return;
  setCartLoadingId(wishlist.id);
  try {
    await addToCart(wishlist.productId, 1, wishlist.variantId);
    dispatch(setCartCount(await fetchCartCount()));
    toast.success('Product moved to cart!');
  } catch {
    toast.error('Failed to add to cart.');
  } finally {
    setCartLoadingId(null);
  }
}
