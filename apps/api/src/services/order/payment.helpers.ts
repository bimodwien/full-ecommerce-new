import prisma from '@/prisma';
import { Prisma, OrderStatus, User } from '@prisma/client';
import { snap } from '@/libs/midtrans';
import { CLIENT_URL } from '@/config';

// Everything initiatePayment needs to build the Midtrans item list.
export const PAYMENT_INCLUDE = {
  Orders: {
    include: {
      OrderItems: { include: { Product: { select: { name: true } } } },
    },
  },
} satisfies Prisma.PaymentInclude;

type PayableItem = {
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

// Snap tokens expire 24 hours after they're issued (Midtrans default).
export const SNAP_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function buildSnapParameter(
  payment: PayablePayment,
  user: User | null,
  midtransOrderId: string,
) {
  return {
    transaction_details: {
      order_id: midtransOrderId,
      gross_amount: Number(payment.totalAmount),
    },
    item_details: payment.Orders.flatMap((order) => order.OrderItems).map(
      (item) => ({
        id: item.productId ?? item.id,
        price: Number(item.price),
        quantity: item.quantity,
        name: (item.Product?.name ?? 'Product').slice(0, 50),
      }),
    ),
    customer_details: {
      first_name: user?.name,
      email: user?.email,
    },
    callbacks: {
      finish: `${CLIENT_URL}/order`,
    },
  };
}

export async function initiatePayment(payment: PayablePayment, userId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const midtransOrderId = `${payment.id}-${Date.now()}`;
    const transaction = await snap.createTransaction(
      buildSnapParameter(payment, user, midtransOrderId),
    );

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        midtransOrderId,
        snapToken: transaction.token,
        snapRedirectUrl: transaction.redirect_url,
      },
    });

    return {
      snapToken: transaction.token as string,
      redirectUrl: transaction.redirect_url as string,
      paymentInitError: false,
    };
  } catch (error) {
    console.error('[MIDTRANS ERROR]', error);
    return {
      snapToken: null as string | null,
      redirectUrl: null as string | null,
      paymentInitError: true,
    };
  }
}

// Cancels a whole Payment and every order in it, then restores stock.
// The Payment row is what the seller cancel and the Midtrans webhook race
// on, so only flip it if it's still PENDING, and only whoever wins that
// update touches the orders and stock. Returns false if we lost the race.
export async function cancelPayment(
  tx: Prisma.TransactionClient,
  paymentId: string,
  data: Prisma.PaymentUpdateManyMutationInput = {},
) {
  const { count } = await tx.payment.updateMany({
    where: { id: paymentId, status: OrderStatus.PENDING },
    data: { ...data, status: OrderStatus.CANCELLED },
  });
  if (count === 0) return false;

  await tx.order.updateMany({
    where: { paymentId, status: OrderStatus.PENDING },
    data: { status: OrderStatus.CANCELLED },
  });

  const items = await tx.orderItem.findMany({
    where: { order: { paymentId } },
  });
  for (const item of items) {
    if (item.variantId) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      });
    }
  }

  return true;
}
