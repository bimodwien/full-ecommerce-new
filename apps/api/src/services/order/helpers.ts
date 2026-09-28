import { Prisma } from '@prisma/client';
import {
  sanitizeProductForList,
  PRODUCT_LIST_INCLUDE,
  PrismaProductWithRelations,
} from '../product/helpers';

export const ORDER_INCLUDE = {
  OrderItems: {
    include: {
      Product: { include: PRODUCT_LIST_INCLUDE },
      Variant: true,
    },
  },
  seller: { select: { id: true, name: true } },
  Payment: {
    select: {
      id: true,
      status: true,
      totalAmount: true,
      snapToken: true,
      snapRedirectUrl: true,
      createdAt: true,
      _count: { select: { Orders: true } },
    },
  },
} satisfies Prisma.OrderInclude;

export const ADMIN_ORDER_INCLUDE = {
  ...ORDER_INCLUDE,
  // Sellers don't need the buyer's Snap token
  Payment: {
    select: {
      id: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      _count: { select: { Orders: true } },
    },
  },
  user: { select: { id: true, name: true, email: true, username: true } },
} satisfies Prisma.OrderInclude;

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: typeof ORDER_INCLUDE;
}>;
type AdminOrderWithItems = Prisma.OrderGetPayload<{
  include: typeof ADMIN_ORDER_INCLUDE;
}>;

// An admin may only force-cancel a PENDING order once Midtrans' payment window
// has lapsed, so a buyer who is still mid-checkout never gets cut off.
export const CANCELLABLE_AFTER_MS = 24 * 60 * 60 * 1000;

export function sanitizeOrder(order: OrderWithItems | AdminOrderWithItems) {
  return {
    ...order,
    OrderItems: (order.OrderItems || []).map((item) => ({
      ...item,
      Product: item.Product
        ? sanitizeProductForList(item.Product as PrismaProductWithRelations)
        : undefined,
    })),
  };
}
