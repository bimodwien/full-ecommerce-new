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

// Lightweight wishlist entry kept in the Redux store.
export type WishlistEntry = {
  id: string; // wishlist row id
  productId: string;
  variantId: string | null;
};

export type TWishlistStoreState = {
  items: WishlistEntry[]; // most-recent first
  productIds: string[]; // derived from items, kept for convenient lookups
  count: number;
};
