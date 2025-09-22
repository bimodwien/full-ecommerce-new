import type { TProduct, TProductVariant } from './product.model';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED';

export type TOrderItem = {
  id: string;
  orderId: string;
  productId?: string | null;
  variantId?: string | null;
  quantity: number;
  // snapshot price at order time (Prisma Decimal serialized)
  price: string | number;
  createdAt: string;
  updatedAt: string;
  // Optional includes
  Product?: TProduct | null;
  Variant?: TProductVariant | null;
};

export type TOrder = {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: string | number; // Prisma Decimal serialized
  createdAt: string;
  updatedAt: string;
  OrderItems?: TOrderItem[];
};
