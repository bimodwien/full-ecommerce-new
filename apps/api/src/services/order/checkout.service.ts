import { Request } from 'express';
import prisma from '@/prisma';
import { Prisma, OrderStatus, Cart } from '@prisma/client';
import AppError from '@/libs/appError';
import { ORDER_INCLUDE, OrderWithItems, sanitizeOrder } from './helpers';
import { requireUserId } from '../common.helpers';
import { initiatePayment } from './payment.helpers';

type OrderItemInput = {
  productId: string;
  variantId?: string;
  quantity: number;
  price: Prisma.Decimal;
};

const subtotal = (items: OrderItemInput[]) =>
  items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

function parseCartItemIds(req: Request) {
  const cartItemIds = req.body?.cartItemIds;
  if (!Array.isArray(cartItemIds) || cartItemIds.length === 0)
    throw new AppError('cartItemIds is required', 400);
  if (!cartItemIds.every((id) => typeof id === 'string' && id.length > 0))
    throw new AppError(
      'cartItemIds must be an array of non-empty strings',
      400,
    );
  return Array.from(new Set(cartItemIds as string[]));
}

async function findSelectedCarts(userId: string, cartItemIds: string[]) {
  const carts = await prisma.cart.findMany({
    where: { id: { in: cartItemIds }, userId },
  });
  if (carts.length === 0) throw new AppError('Cart is empty', 400);
  if (carts.length !== cartItemIds.length)
    throw new AppError('Some selected items are no longer in your cart', 400);
  return carts;
}

async function reserveCartItem(tx: Prisma.TransactionClient, cartItem: Cart) {
  const product = await tx.product.findUnique({
    where: { id: cartItem.productId },
  });
  if (!product) throw new AppError('Product not found', 404);

  if (cartItem.variantId) {
    const variant = await tx.productVariant.findUnique({
      where: { id: cartItem.variantId },
    });
    if (!variant || variant.productId !== cartItem.productId)
      throw new AppError('Variant not found for product', 404);

    // Check and decrement in one statement. A separate read-then-update
    // lets two concurrent checkouts both pass the check and oversell.
    const { count } = await tx.productVariant.updateMany({
      where: { id: cartItem.variantId, stock: { gte: cartItem.quantity } },
      data: { stock: { decrement: cartItem.quantity } },
    });
    if (count === 0)
      throw new AppError(`Insufficient stock for ${product.name}`, 400);
  }

  const item: OrderItemInput = {
    productId: cartItem.productId,
    variantId: cartItem.variantId ?? undefined,
    quantity: cartItem.quantity,
    price: product.price,
  };
  return { sellerId: product.sellerId, item };
}

// One order per seller, all paid together through a single Payment.
async function createPaymentWithOrders(
  tx: Prisma.TransactionClient,
  userId: string,
  itemsBySeller: Map<string, OrderItemInput[]>,
) {
  const payment = await tx.payment.create({
    data: {
      userId,
      status: OrderStatus.PENDING,
      totalAmount: subtotal(Array.from(itemsBySeller.values()).flat()),
    },
  });

  const orders: OrderWithItems[] = [];
  for (const [sellerId, items] of itemsBySeller) {
    orders.push(
      await tx.order.create({
        data: {
          userId,
          sellerId,
          paymentId: payment.id,
          status: OrderStatus.PENDING,
          totalAmount: subtotal(items),
          OrderItems: { create: items },
        },
        include: ORDER_INCLUDE,
      }),
    );
  }

  return { payment, orders };
}

class OrderCheckoutService {
  static async createOrder(req: Request) {
    const userId = requireUserId(req);
    const uniqueCartItemIds = parseCartItemIds(req);
    const carts = await findSelectedCarts(userId, uniqueCartItemIds);

    const { payment, orders } = await prisma.$transaction(async (tx) => {
      const itemsBySeller = new Map<string, OrderItemInput[]>();
      for (const cartItem of carts) {
        const { sellerId, item } = await reserveCartItem(tx, cartItem);
        itemsBySeller.set(sellerId, [
          ...(itemsBySeller.get(sellerId) ?? []),
          item,
        ]);
      }

      const created = await createPaymentWithOrders(tx, userId, itemsBySeller);
      await tx.cart.deleteMany({
        where: { id: { in: uniqueCartItemIds }, userId },
      });
      return created;
    });

    const result = await initiatePayment(
      { ...payment, Orders: orders },
      userId,
    );

    return {
      orders: orders.map(sanitizeOrder),
      paymentId: payment.id,
      snapToken: result.snapToken,
      redirectUrl: result.redirectUrl,
      paymentInitError: result.paymentInitError,
    };
  }
}

export default OrderCheckoutService;
