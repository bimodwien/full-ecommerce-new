import type { TProduct, TProductVariant } from './product.model';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RETURNED';

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
  midtransOrderId?: string | null;
  snapToken?: string | null;
  snapRedirectUrl?: string | null;
  paymentType?: string | null;
  transactionStatus?: string | null;
  paidAt?: string | null;
  returnReason?: string | null;
  createdAt: string;
  updatedAt: string;
  OrderItems?: TOrderItem[];
  // Only present on admin responses
  user?: {
    id: string;
    name: string;
    email: string;
    username: string;
  } | null;
};

export type TCreateOrderResponse = {
  order: TOrder;
  snapToken: string | null;
  redirectUrl: string | null;
  paymentInitError?: boolean;
};
