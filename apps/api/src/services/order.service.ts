import { Request } from 'express';
import crypto from 'crypto';
import prisma from '@/prisma';
import { Prisma, OrderStatus } from '@prisma/client';
import AppError from '@/libs/appError';
import sanitizeProductForList, {
  PrismaProductWithRelations,
} from './product.helpers';
import { snap } from '@/libs/midtrans';
import { MIDTRANS_SERVER_KEY, CLIENT_URL } from '@/config';

const ORDER_INCLUDE = {
  OrderItems: {
    include: {
      Product: {
        include: {
          Images: {
            orderBy: [
              { isPrimary: 'desc' as Prisma.SortOrder },
              { createdAt: 'asc' as Prisma.SortOrder },
            ],
            take: 1,
          },
          Category: true,
          Variants: { select: { stock: true } },
          seller: { select: { id: true, name: true } },
        },
      },
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

// Everything initiatePayment needs to build the Midtrans item list.
const PAYMENT_INCLUDE = {
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

type PayablePayment = {
  id: string;
  totalAmount: Prisma.Decimal;
  Orders: { OrderItems: PayableItem[] }[];
};

// An admin may only force-cancel a PENDING order once Midtrans' payment window
// has lapsed, so a buyer who is still mid-checkout never gets cut off.
const CANCELLABLE_AFTER_MS = 24 * 60 * 60 * 1000;

// Snap tokens expire 24 hours after they're issued (Midtrans default).
const SNAP_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function clamp(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

// UTC calendar-day key, independent of server timezone.
function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

const ADMIN_ORDER_INCLUDE = {
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

type OrderWithItems = Prisma.OrderGetPayload<{ include: typeof ORDER_INCLUDE }>;
type AdminOrderWithItems = Prisma.OrderGetPayload<{
  include: typeof ADMIN_ORDER_INCLUDE;
}>;

function sanitizeOrder(order: OrderWithItems | AdminOrderWithItems) {
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

class OrderService {
  static async createOrder(req: Request) {
    const userId = req.user?.id as string;
    if (!userId) throw new AppError('Unauthorized', 401);

    const cartItemIds = req.body?.cartItemIds;
    if (!Array.isArray(cartItemIds) || cartItemIds.length === 0)
      throw new AppError('cartItemIds is required', 400);
    if (!cartItemIds.every((id) => typeof id === 'string' && id.length > 0))
      throw new AppError(
        'cartItemIds must be an array of non-empty strings',
        400,
      );
    const uniqueCartItemIds = Array.from(new Set(cartItemIds));

    const carts = await prisma.cart.findMany({
      where: { id: { in: uniqueCartItemIds }, userId },
    });
    if (carts.length === 0) throw new AppError('Cart is empty', 400);
    if (carts.length !== uniqueCartItemIds.length)
      throw new AppError('Some selected items are no longer in your cart', 400);

    const { payment, orders } = await prisma.$transaction(async (tx) => {
      type OrderItemInput = {
        productId: string;
        variantId?: string;
        quantity: number;
        price: Prisma.Decimal;
      };
      // One order per seller, all paid together through a single Payment.
      const itemsBySeller = new Map<string, OrderItemInput[]>();
      const subtotal = (items: OrderItemInput[]) =>
        items.reduce(
          (sum, item) => sum + Number(item.price) * item.quantity,
          0,
        );

      for (const cartItem of carts) {
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
            where: {
              id: cartItem.variantId,
              stock: { gte: cartItem.quantity },
            },
            data: { stock: { decrement: cartItem.quantity } },
          });
          if (count === 0)
            throw new AppError(`Insufficient stock for ${product.name}`, 400);
        }

        const sellerItems = itemsBySeller.get(product.sellerId) ?? [];
        sellerItems.push({
          productId: cartItem.productId,
          variantId: cartItem.variantId ?? undefined,
          quantity: cartItem.quantity,
          price: product.price,
        });
        itemsBySeller.set(product.sellerId, sellerItems);
      }

      const createdPayment = await tx.payment.create({
        data: {
          userId,
          status: OrderStatus.PENDING,
          totalAmount: subtotal(Array.from(itemsBySeller.values()).flat()),
        },
      });

      const createdOrders: OrderWithItems[] = [];
      for (const [sellerId, items] of itemsBySeller) {
        createdOrders.push(
          await tx.order.create({
            data: {
              userId,
              sellerId,
              paymentId: createdPayment.id,
              status: OrderStatus.PENDING,
              totalAmount: subtotal(items),
              OrderItems: { create: items },
            },
            include: ORDER_INCLUDE,
          }),
        );
      }

      await tx.cart.deleteMany({
        where: { id: { in: uniqueCartItemIds }, userId },
      });

      return { payment: createdPayment, orders: createdOrders };
    });

    const result = await OrderService.initiatePayment(
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

  private static async initiatePayment(
    payment: PayablePayment,
    userId: string,
  ) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const midtransOrderId = `${payment.id}-${Date.now()}`;

      const parameter = {
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

      const transaction = await snap.createTransaction(parameter);

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

  static async retryPayment(req: Request) {
    const userId = req.user?.id as string;
    if (!userId) throw new AppError('Unauthorized', 401);

    const id = String(req.params.id || '');
    const order = await prisma.order.findUnique({
      where: { id },
      include: { Payment: { include: PAYMENT_INCLUDE } },
    });
    if (!order) throw new AppError('Order not found', 404);
    if (order.userId !== userId) throw new AppError('Unauthorized', 403);

    // The Snap transaction belongs to the Payment, which covers every order
    // from the same checkout.
    const payment = order.Payment;
    if (payment.status !== OrderStatus.PENDING)
      throw new AppError('Order is not payable', 400);

    // Reopen the existing transaction instead of starting a new one. A new
    // midtransOrderId would orphan the old one, so a buyer who already got a
    // VA number from the first popup and pays it would never be matched.
    // Measured from createdAt, since that's the earliest the token could
    // have been issued.
    if (
      payment.snapToken &&
      payment.snapRedirectUrl &&
      Date.now() - payment.createdAt.getTime() < SNAP_TOKEN_TTL_MS
    ) {
      return {
        snapToken: payment.snapToken,
        redirectUrl: payment.snapRedirectUrl,
      };
    }

    const result = await OrderService.initiatePayment(payment, userId);
    if (result.paymentInitError)
      throw new AppError('Failed to initialize payment, please try again', 502);

    return { snapToken: result.snapToken, redirectUrl: result.redirectUrl };
  }

  static async getAllOrders(req: Request) {
    const userId = req.user?.id as string;
    if (!userId) throw new AppError('Unauthorized', 401);

    const page = Math.max(1, Number(req.query.page || 1));
    let limit = Number(req.query.limit || 10);
    limit = Math.min(100, Math.max(1, limit));
    const skip = (page - 1) * limit;

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
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async getOrderById(req: Request) {
    const userId = req.user?.id as string;
    if (!userId) throw new AppError('Unauthorized', 401);

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
    const sellerId = req.user?.id as string;
    if (!sellerId) throw new AppError('Unauthorized', 401);

    const page = Math.max(1, Number(req.query.page || 1));
    let limit = Number(req.query.limit || 10);
    limit = Math.min(100, Math.max(1, limit));
    const skip = (page - 1) * limit;

    const statusQuery = req.query.status;
    const where: Prisma.OrderWhereInput = { sellerId };
    if (
      typeof statusQuery === 'string' &&
      statusQuery !== 'all' &&
      (Object.values(OrderStatus) as string[]).includes(statusQuery)
    ) {
      where.status = statusQuery as OrderStatus;
    }

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
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async getAdminStats(req: Request) {
    const sellerId = req.user?.id as string;
    if (!sellerId) throw new AppError('Unauthorized', 401);

    const days = clamp(Number(req.query.days || 14), 7, 30);
    const topCancelledLimit = clamp(
      Number(req.query.topCancelledLimit || 5),
      1,
      20,
    );

    const todayKey = toDateKey(new Date());
    const todayStart = new Date(`${todayKey}T00:00:00.000Z`);
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const trendStart = new Date(
      todayStart.getTime() - (days - 1) * 24 * 60 * 60 * 1000,
    );

    const [rangeOrders, statusGroups, cancelledItemGroups] =
      await prisma.$transaction([
        prisma.order.findMany({
          where: {
            sellerId,
            createdAt: { gte: trendStart, lt: tomorrowStart },
          },
          select: { createdAt: true, status: true, totalAmount: true },
        }),
        prisma.order.groupBy({
          by: ['status'],
          where: { sellerId },
          _count: { _all: true },
        }),
        prisma.orderItem.groupBy({
          by: ['productId'],
          where: {
            productId: { not: null },
            order: { sellerId, status: OrderStatus.CANCELLED },
          },
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: topCancelledLimit,
        }),
      ]);

    // Pre-seed every day in the window so the trend chart has no gaps.
    const buckets = new Map<string, { sales: number; orderCount: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(trendStart.getTime() + i * 24 * 60 * 60 * 1000);
      buckets.set(toDateKey(d), { sales: 0, orderCount: 0 });
    }

    let cancelledToday = 0;
    for (const order of rangeOrders) {
      const key = toDateKey(order.createdAt);
      const bucket = buckets.get(key);
      if (!bucket) continue;
      bucket.orderCount += 1;
      if (
        order.status === OrderStatus.PAID ||
        order.status === OrderStatus.COMPLETED
      ) {
        bucket.sales += Number(order.totalAmount);
      }
      if (key === todayKey && order.status === OrderStatus.CANCELLED) {
        cancelledToday += 1;
      }
    }

    const trend = Array.from(buckets.entries()).map(([date, v]) => ({
      date,
      sales: v.sales,
      orderCount: v.orderCount,
    }));

    const todayBucket = buckets.get(todayKey) ?? { sales: 0, orderCount: 0 };

    const statusCountMap = new Map(
      statusGroups.map((g) => [g.status, g._count._all]),
    );
    const statusBreakdown = Object.values(OrderStatus).map((status) => ({
      status,
      count: statusCountMap.get(status) ?? 0,
    }));

    const cancelledProductIds = cancelledItemGroups
      .map((g) => g.productId)
      .filter((id): id is string => !!id);
    const cancelledProducts = cancelledProductIds.length
      ? await prisma.product.findMany({
          where: { id: { in: cancelledProductIds } },
          select: { id: true, name: true },
        })
      : [];
    const productNameById = new Map(
      cancelledProducts.map((p) => [p.id, p.name]),
    );

    const topCancelledProducts = cancelledItemGroups
      .filter((g): g is typeof g & { productId: string } => !!g.productId)
      .map((g) => ({
        productId: g.productId,
        productName: productNameById.get(g.productId) ?? 'Unknown product',
        cancelledQuantity: g._sum.quantity ?? 0,
      }));

    return {
      days,
      today: {
        salesTotal: todayBucket.sales,
        orderCount: todayBucket.orderCount,
        cancelledCount: cancelledToday,
      },
      trend,
      statusBreakdown,
      topCancelledProducts,
    };
  }

  static async shipOrder(req: Request) {
    const sellerId = req.user?.id as string;
    if (!sellerId) throw new AppError('Unauthorized', 401);

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

  // Cancels a whole Payment and every order in it, then restores stock.
  // The Payment row is what the seller cancel and the Midtrans webhook race
  // on, so only flip it if it's still PENDING, and only whoever wins that
  // update touches the orders and stock. Returns false if we lost the race.
  private static async cancelPayment(
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

  static async cancelOrder(req: Request) {
    const sellerId = req.user?.id as string;
    if (!sellerId) throw new AppError('Unauthorized', 401);

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
      const won = await OrderService.cancelPayment(tx, order.paymentId);
      if (!won) throw new AppError('Only pending orders can be cancelled', 400);

      return tx.order.findUniqueOrThrow({
        where: { id },
        include: ADMIN_ORDER_INCLUDE,
      });
    });

    return sanitizeOrder(cancelled);
  }

  static async completeOrder(req: Request) {
    const userId = req.user?.id as string;
    if (!userId) throw new AppError('Unauthorized', 401);

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
    const userId = req.user?.id as string;
    if (!userId) throw new AppError('Unauthorized', 401);

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

  static async handleNotification(body: any) {
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
    } = body;

    const expectedSignature = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`)
      .digest('hex');

    if (expectedSignature !== signature_key)
      throw new AppError('Invalid signature', 401);

    const payment = await prisma.payment.findUnique({
      where: { midtransOrderId: order_id },
    });
    if (!payment) throw new AppError('Payment not found', 404);

    // Idempotency guard: Midtrans retries notifications, only act once per payment.
    if (payment.status !== OrderStatus.PENDING) {
      return { message: 'Payment already processed' };
    }

    const isPaid =
      transaction_status === 'settlement' ||
      (transaction_status === 'capture' && fraud_status === 'accept');
    const isCancelled = ['deny', 'cancel', 'expire', 'failure'].includes(
      transaction_status,
    );

    if (isCancelled) {
      // Returns false if a seller cancel or a retried notification got here first.
      await prisma.$transaction((tx) =>
        OrderService.cancelPayment(tx, payment.id, {
          paymentType: payment_type,
          transactionStatus: transaction_status,
        }),
      );
    } else if (isPaid) {
      await prisma.$transaction(async (tx) => {
        const { count } = await tx.payment.updateMany({
          where: { id: payment.id, status: OrderStatus.PENDING },
          data: {
            status: OrderStatus.PAID,
            paidAt: new Date(),
            paymentType: payment_type,
            transactionStatus: transaction_status,
          },
        });
        if (count === 0) return;

        await tx.order.updateMany({
          where: { paymentId: payment.id, status: OrderStatus.PENDING },
          data: { status: OrderStatus.PAID },
        });
      });
    } else {
      // still pending (e.g. capture+challenge, or pending) - just record raw status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          paymentType: payment_type,
          transactionStatus: transaction_status,
        },
      });
    }

    return { message: 'Notification processed' };
  }
}

export default OrderService;
