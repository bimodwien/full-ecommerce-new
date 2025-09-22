import type { Role, TUser } from './user.model';

export type TotalStock = 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK';

export type TProductImage = {
  id: string;
  isPrimary: boolean;
  productId: string;
  // When coming directly from DB, backend holds binary; the web never needs it
  data?: never;
  createdAt: string;
  updatedAt: string;
};

export type TProductVariant = {
  id: string;
  variant: string;
  stock: number;
  productId: string;
  createdAt: string;
  updatedAt: string;
};

export type TCategoryRef = {
  id: string;
  name: string;
};

export type TSellerRef = Pick<TUser, 'id' | 'name'>;

// Detail payload (may include description and full images)
export type TProduct = {
  id: string;
  name: string;
  description?: string;
  descriptionHtml?: string;
  price: string | number; // Prisma Decimal serialized; backend may send string
  sellerId: string;
  categoryId?: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations (as typically included by our API)
  Images?: TProductImage[];
  Variants?: TProductVariant[];
  Category?: TCategoryRef | null;
  seller?: TSellerRef;
  // Derived fields provided by helpers
  stockTotal?: number;
  stockStatus?: TotalStock;
};

// Slim version used in list endpoints where we keep only primary image
export type TProductList = Omit<
  TProduct,
  'Images' | 'description' | 'descriptionHtml' | 'Variants'
> & {
  Images?: (Omit<TProductImage, 'data'> & { imageUrl: string })[];
};
