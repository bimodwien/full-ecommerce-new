import { axiosInstance } from '@/libraries/axios';
import { TWishlist } from '@/models/wishlist.model';

export const fetchWishlists = async (params?: {
  page?: number;
  limit?: number;
}): Promise<TWishlist[]> => {
  const response = await axiosInstance().get('/wishlists', { params });
  return (response.data?.wishlists || []) as TWishlist[];
};

export const fetchWishlistCount = async (): Promise<number> => {
  try {
    const response = await axiosInstance().get('/wishlists', {
      params: { limit: 1, page: 1 },
    });
    return response.data?.total ?? 0;
  } catch {
    return 0;
  }
};

export const toggleWishlist = async (
  productId: string,
  variantId?: string | null,
): Promise<{ added: boolean; wishlist?: TWishlist }> => {
  const response = await axiosInstance().post('/wishlists/toggle', {
    productId,
    variantId: variantId ?? null,
  });
  // API returns { action: 'created' | 'deleted', wishlist: {...} }
  const data = response.data;
  return {
    added: data.action === 'created',
    wishlist: data.wishlist,
  };
};

export const deleteWishlist = async (id: string): Promise<void> => {
  await axiosInstance().delete(`/wishlists/${id}`);
};
