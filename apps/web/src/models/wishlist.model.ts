import type { TProduct, TProductVariant } from './product.model';

export type TWishlist = {
  id: string;
  userId: string;
  productId: string;
  variantId?: string | null;
  createdAt: string;
  updatedAt: string;
  // Optional includes from API
  Product?: TProduct;
  Variant?: TProductVariant | null;
};
