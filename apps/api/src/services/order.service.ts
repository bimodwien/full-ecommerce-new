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
} satisfies Prisma.OrderInclude;

type OrderWithItems = Prisma.OrderGetPayload<{ include: typeof ORDER_INCLUDE }>;

function sanitizeOrder(order: OrderWithItems) {
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

    const order = await prisma.$transaction(async (tx) => {
      const orderItemsData: {
        productId: string;
        variantId?: string;
        quantity: number;
        price: Prisma.Decimal;
      }[] = [];

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
          if (variant.stock < cartItem.quantity)
            throw new AppError(
              `Insufficient stock for ${product.name}`,
              400,
            );
        }

        orderItemsData.push({
          productId: cartItem.productId,
          variantId: cartItem.variantId ?? undefined,
          quantity: cartItem.quantity,
          price: product.price,
        });
      }

      const totalAmount = orderItemsData.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0,
      );

      const created = await tx.order.create({
        data: {
          userId,
          status: OrderStatus.PENDING,
          totalAmount,
          OrderItems: {
            create: orderItemsData.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: ORDER_INCLUDE,
      });

      for (const item of orderItemsData) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      await tx.cart.deleteMany({
        where: { id: { in: uniqueCartItemIds }, userId },
      });

      return created;
    });

    const payment = await OrderService.initiatePayment(order, userId);

    return {
      order: sanitizeOrder({ ...order, ...payment.orderUpdate }),
      snapToken: payment.snapToken,
      redirectUrl: payment.redirectUrl,
      paymentInitError: payment.paymentInitError,
    };
  }

  private static async initiatePayment(order: OrderWithItems, userId: string) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const midtransOrderId = `${order.id}-${Date.now()}`;

      const parameter = {
        transaction_details: {
          order_id: midtransOrderId,
          gross_amount: Number(order.totalAmount),
        },
        item_details: order.OrderItems.map((item) => ({
          id: item.productId ?? item.id,
          price: Number(item.price),
          quantity: item.quantity,
          name: (item.Product?.name ?? 'Product').slice(0, 50),
        })),
        customer_details: {
          first_name: user?.name,
          email: user?.email,
        },
        callbacks: {
          finish: `${CLIENT_URL}/order/${order.id}`,
        },
      };

      const transaction = await snap.createTransaction(parameter);

      const updated = await prisma.order.update({
        where: { id: order.id },
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
        orderUpdate: updated,
      };
    } catch (error) {
      console.error('[MIDTRANS ERROR]', error);
      return {
        snapToken: null as string | null,
        redirectUrl: null as string | null,
        paymentInitError: true,
        orderUpdate: {},
      };
    }
  }

  static async retryPayment(req: Request) {
    const userId = req.user?.id as string;
    if (!userId) throw new AppError('Unauthorized', 401);

    const id = String(req.params.id || '');
    const order = await prisma.order.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });
    if (!order) throw new AppError('Order not found', 404);
    if (order.userId !== userId) throw new AppError('Unauthorized', 403);
    if (order.status !== OrderStatus.PENDING)
      throw new AppError('Order is not payable', 400);

    const payment = await OrderService.initiatePayment(order, userId);
    if (payment.paymentInitError)
      throw new AppError(
        'Failed to initialize payment, please try again',
        502,
      );

    return { snapToken: payment.snapToken, redirectUrl: payment.redirectUrl };
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

    const order = await prisma.order.findUnique({
      where: { midtransOrderId: order_id },
      include: { OrderItems: true },
    });
    if (!order) throw new AppError('Order not found', 404);

    // Idempotency guard: Midtrans retries notifications, only act once per order.
    if (order.status !== OrderStatus.PENDING) {
      return { message: 'Order already processed' };
    }

    const isPaid =
      transaction_status === 'settlement' ||
      (transaction_status === 'capture' && fraud_status === 'accept');
    const isCancelled = ['deny', 'cancel', 'expire', 'failure'].includes(
      transaction_status,
    );

    if (isCancelled) {
      await prisma.$transaction(async (tx) => {
        for (const item of order.OrderItems) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.CANCELLED,
            paymentType: payment_type,
            transactionStatus: transaction_status,
          },
        });
      });
    } else if (isPaid) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PAID,
          paidAt: new Date(),
          paymentType: payment_type,
          transactionStatus: transaction_status,
        },
      });
    } else {
      // still pending (e.g. capture+challenge, or pending) - just record raw status
      await prisma.order.update({
        where: { id: order.id },
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
