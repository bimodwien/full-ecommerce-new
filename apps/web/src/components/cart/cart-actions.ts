import { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';
import { updateCartQuantity, deleteCart } from '@/helpers/fetch-cart';
import { TCart } from '@/models/cart.model';
import { AppDispatch } from '@/libraries/redux/store';
import { decrementCartCount } from '@/libraries/redux/slices/cart.slice';

type SetCarts = Dispatch<SetStateAction<TCart[]>>;
type SetId = Dispatch<SetStateAction<string | null>>;

export async function changeQuantity(
  cart: TCart,
  delta: number,
  setCarts: SetCarts,
  setUpdatingId: SetId,
) {
  const newQty = cart.quantity + delta;
  if (newQty < 1) return;
  setUpdatingId(cart.id);
  try {
    const updated = await updateCartQuantity(cart.id, newQty);
    const quantity = updated.quantity ?? newQty;
    setCarts((prev) =>
      prev.map((c) => (c.id === cart.id ? { ...c, quantity } : c)),
    );
  } catch {
    toast.error('Failed to update product quantity.');
  } finally {
    setUpdatingId(null);
  }
}

type RemoveDeps = {
  setCarts: SetCarts;
  setDeletingId: SetId;
  unselect: (id: string) => void;
  dispatch: AppDispatch;
};

export async function removeCartItem(id: string, deps: RemoveDeps) {
  deps.setDeletingId(id);
  try {
    await deleteCart(id);
    deps.setCarts((prev) => prev.filter((c) => c.id !== id));
    deps.unselect(id);
    deps.dispatch(decrementCartCount());
    toast.success('Product removed from cart.');
  } catch {
    toast.error('Failed to remove product from cart.');
  } finally {
    deps.setDeletingId(null);
  }
}
