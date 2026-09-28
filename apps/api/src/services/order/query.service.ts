import { Request } from 'express';
import prisma from '@/prisma';
import { Prisma, OrderStatus } from '@prisma/client';
import AppError from '@/libs/appError';
import { ORDER_INCLUDE, ADMIN_ORDER_INCLUDE, sanitizeOrder } from './helpers';
import { requireUserId, parsePagination, pageMeta } from '../common.helpers';

function parseStatusFilter(req: Request, sellerId: string) {
  const statusQuery = req.query.status;
  const where: Prisma.OrderWhereInput = { sellerId };
  if (
    typeof statusQuery === 'string' &&
    statusQuery !== 'all' &&
    (Object.values(OrderStatus) as string[]).includes(statusQuery)
  ) {
    where.status = statusQuery as OrderStatus;
  }
  return where;
}

class OrderQueryService {
  static async getAllOrders(req: Request) {
    const userId = requireUserId(req);
    const { page, limit, skip } = parsePagination(req);

    const [total, orders] = await prisma.$transaction([
      prisma.order.count({ where: { userId } }),
      prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' as Prisma.SortOrder },
        include: ORDER_INCLUDE,
      }),
    ]);

    return {
      orders: orders.map(sanitizeOrder),
      ...pageMeta(total, page, limit),
    };
  }

  static async getOrderById(req: Request) {
    const userId = requireUserId(req);

    const id = String(req.params.id || '');
    const order = await prisma.order.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });
    if (!order) throw new AppError('Order not found', 404);
    if (order.userId !== userId) throw new AppError('Unauthorized', 403);

    return sanitizeOrder(order);
  }

  static async getAllOrdersAdmin(req: Request) {
    const sellerId = requireUserId(req);
    const { page, limit, skip } = parsePagination(req);
    const where = parseStatusFilter(req, sellerId);

    const [total, orders] = await prisma.$transaction([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' as Prisma.SortOrder },
        include: ADMIN_ORDER_INCLUDE,
      }),
    ]);

    return {
      orders: orders.map(sanitizeOrder),
      ...pageMeta(total, page, limit),
    };
  }
}

export default OrderQueryService;
