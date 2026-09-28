import { Request } from 'express';
import prisma from '@/prisma';
import { OrderStatus } from '@prisma/client';
import AppError from '@/libs/appError';
import {
  ORDER_INCLUDE,
  ADMIN_ORDER_INCLUDE,
  CANCELLABLE_AFTER_MS,
  sanitizeOrder,
} from './order.helpers';
import { requireUserId } from './common.helpers';
import { cancelPayment } from './order.payment.helpers';

class OrderStatusService {
  static async shipOrder(req: Request) {
    const sellerId = requireUserId(req);

    const id = String(req.params.id || '');
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new AppError('Order not found', 404);
    if (order.sellerId !== sellerId) throw new AppError('Unauthorized', 403);
    if (order.status !== OrderStatus.PAID)
      throw new AppError('Only paid orders can be marked as shipped', 400);

    const updated = await prisma.order.update({
      where: { id },
      data: { status: OrderStatus.SHIPPED },
      include: ADMIN_ORDER_INCLUDE,
    });

    return sanitizeOrder(updated);
  }

  static async cancelOrder(req: Request) {
    const sellerId = requireUserId(req);
    const id = String(req.params.id || '');

    const cancelled = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { Payment: true },
      });
      if (!order) throw new AppError('Order not found', 404);
      if (order.sellerId !== sellerId) throw new AppError('Unauthorized', 403);
      if (order.status !== OrderStatus.PENDING)
        throw new AppError('Only pending orders can be cancelled', 400);
      if (Date.now() - order.Payment.createdAt.getTime() < CANCELLABLE_AFTER_MS)
        throw new AppError(
          'Order can only be cancelled 24 hours after it was created, the buyer may still be paying',
          400,
        );

      // The buyer paid for all sibling orders in one Midtrans transaction, so
      // an unpaid order can't be cancelled on its own. The 24h gate above
      // means that transaction is already dead anyway.
      const won = await cancelPayment(tx, order.paymentId);
      if (!won) throw new AppError('Only pending orders can be cancelled', 400);

      return tx.order.findUniqueOrThrow({
        where: { id },
        include: ADMIN_ORDER_INCLUDE,
      });
    });

    return sanitizeOrder(cancelled);
  }

  static async completeOrder(req: Request) {
    const userId = requireUserId(req);

    const id = String(req.params.id || '');
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new AppError('Order not found', 404);
    if (order.userId !== userId) throw new AppError('Unauthorized', 403);
    if (order.status !== OrderStatus.SHIPPED)
      throw new AppError('Only shipped orders can be completed', 400);

    const updated = await prisma.order.update({
      where: { id },
      data: { status: OrderStatus.COMPLETED },
      include: ORDER_INCLUDE,
    });

    return sanitizeOrder(updated);
  }

  static async submitReturn(req: Request) {
    const userId = requireUserId(req);

    const id = String(req.params.id || '');
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new AppError('Order not found', 404);
    if (order.userId !== userId) throw new AppError('Unauthorized', 403);
    if (order.status !== OrderStatus.SHIPPED)
      throw new AppError('Only shipped orders can be returned', 400);

    const reason = String(req.body?.reason || '').trim();
    if (!reason) throw new AppError('Return reason is required', 400);
    if (reason.length > 500)
      throw new AppError('Return reason is too long', 400);

    const updated = await prisma.order.update({
      where: { id },
      data: { status: OrderStatus.RETURNED, returnReason: reason },
      include: ORDER_INCLUDE,
    });

    return sanitizeOrder(updated);
  }
}

export default OrderStatusService;
