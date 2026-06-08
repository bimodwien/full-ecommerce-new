import { axiosInstance } from '@/libraries/axios';
import { TCart } from '@/models/cart.model';

export const fetchCarts = async (): Promise<TCart[]> => {
  const response = await axiosInstance().get('/carts');
  return (response.data?.carts || []) as TCart[];
};

export const fetchCartCount = async (): Promise<number> => {
  try {
    const response = await axiosInstance().get('/carts', {
      params: { limit: 1, page: 1 },
    });
    return response.data?.total ?? 0;
  } catch {
    return 0;
  }
};

export const addToCart = async (
  productId: string,
  quantity: number = 1,
  variantId?: string | null,
): Promise<TCart> => {
  const response = await axiosInstance().post('/carts', {
    productId,
    quantity,
    variantId: variantId ?? null,
  });
  return response.data?.cart as TCart;
};

export const updateCartQuantity = async (
  id: string,
  quantity: number,
): Promise<TCart> => {
  const response = await axiosInstance().patch(`/carts/${id}`, { quantity });
  return response.data?.cart as TCart;
};

export const deleteCart = async (id: string): Promise<void> => {
  await axiosInstance().delete(`/carts/${id}`);
};
