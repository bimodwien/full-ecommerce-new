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

// One Midtrans payment, shared by every order from the same checkout
export type TOrderPayment = {
  id: string;
  status: OrderStatus;
  totalAmount: string | number; // Prisma Decimal serialized
  // Buyer responses only
  snapToken?: string | null;
  snapRedirectUrl?: string | null;
  createdAt: string;
  _count: { Orders: number };
};

export type TOrder = {
  id: string;
  userId: string;
  sellerId: string;
  paymentId: string;
  status: OrderStatus;
  totalAmount: string | number; // Prisma Decimal serialized, this seller's subtotal
  returnReason?: string | null;
  createdAt: string;
  updatedAt: string;
  OrderItems?: TOrderItem[];
  seller?: { id: string; name: string } | null;
  Payment?: TOrderPayment | null;
  // Only present on admin responses
  user?: {
    id: string;
    name: string;
    email: string;
    username: string;
  } | null;
};

export type TCreateOrderResponse = {
  // Checkout is split into one order per seller
  orders: TOrder[];
  paymentId: string;
  snapToken: string | null;
  redirectUrl: string | null;
  paymentInitError?: boolean;
};
