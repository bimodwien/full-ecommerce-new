import { Cart, ProductVariant } from '@prisma/client';
import { TProduct } from './product.model';
import { TProductVariant } from './productVariant.model';
import { TUser } from './user.model';

export type TCart = {
  id: string;
  quantity: number;
  productId: string;
  variantId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  Product?: TProduct;
  Variant?: TProductVariant;
  User?: TUser;
};

// Prisma cart row with whichever relations the query included.
export type CartRow = Cart & {
  Product?: unknown;
  Variant?: ProductVariant | null;
};
