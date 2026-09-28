import { Wishlist, ProductVariant } from '@prisma/client';
import { TProduct } from './product.model';
import { TProductVariant } from './productVariant.model';
import { TUser } from './user.model';

export type TWishlist = {
  id: string;
  productId: string;
  variantId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  Product?: TProduct;
  Variant?: TProductVariant;
  User?: TUser;
};

// Prisma wishlist row with whichever relations the query included.
export type WishlistRow = Wishlist & {
  Product?: unknown;
  Variant?: ProductVariant | null;
};
