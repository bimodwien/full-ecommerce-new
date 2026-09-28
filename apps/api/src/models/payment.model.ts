import { Prisma } from '@prisma/client';

// What initiatePayment needs to build the Midtrans item list.
export type PayableItem = {
  id: string;
  productId: string | null;
  price: Prisma.Decimal;
  quantity: number;
  Product: { name: string } | null;
};

export type PayablePayment = {
  id: string;
  totalAmount: Prisma.Decimal;
  Orders: { OrderItems: PayableItem[] }[];
};
