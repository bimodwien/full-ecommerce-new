import type { TProduct, TProductVariant } from './product.model';

export type TCart = {
  id: string;
  userId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  // Optional includes from API
  Product?: TProduct;
  Variant?: TProductVariant | null;
};
