import { Request } from 'express';
import crypto from 'crypto';
import prisma from '@/prisma';
import { OrderStatus } from '@prisma/client';
import AppError from '@/libs/appError';
import { MIDTRANS_SERVER_KEY } from '@/config';
import { requireUserId } from '../common.helpers';
import {
  PAYMENT_INCLUDE,
  SNAP_TOKEN_TTL_MS,
  cancelPayment,
  initiatePayment,
} from './payment.helpers';

function verifySignature(body: any) {
  const { order_id, status_code, gross_amount, signature_key } = body;
  const expectedSignature = crypto
    .createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`)
    .digest('hex');

  if (expectedSignature !== signature_key)
    throw new AppError('Invalid signature', 401);
}

function classifyTransaction(transactionStatus: string, fraudStatus: string) {
  const isPaid =
    transactionStatus === 'settlement' ||
    (transactionStatus === 'capture' && fraudStatus === 'accept');
  const isCancelled = ['deny', 'cancel', 'expire', 'failure'].includes(
    transactionStatus,
  );
  return { isPaid, isCancelled };
}

function markPaymentPaid(
  paymentId: string,
  paymentType: string,
  transactionStatus: string,
) {
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.payment.updateMany({
      where: { id: paymentId, status: OrderStatus.PENDING },
      data: {
        status: OrderStatus.PAID,
        paidAt: new Date(),
        paymentType,
        transactionStatus,
      },
    });
    if (count === 0) return;

    await tx.order.updateMany({
      where: { paymentId, status: OrderStatus.PENDING },
      data: { status: OrderStatus.PAID },
    });
  });
}

class OrderPaymentService {
  static async retryPayment(req: Request) {
    const userId = requireUserId(req);

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

    const result = await initiatePayment(payment, userId);
    if (result.paymentInitError)
      throw new AppError('Failed to initialize payment, please try again', 502);

    return { snapToken: result.snapToken, redirectUrl: result.redirectUrl };
  }

  static async handleNotification(body: any) {
    verifySignature(body);
    const { order_id, transaction_status, fraud_status, payment_type } = body;

    const payment = await prisma.payment.findUnique({
      where: { midtransOrderId: order_id },
    });
    if (!payment) throw new AppError('Payment not found', 404);

    // Idempotency guard: Midtrans retries notifications, only act once per payment.
    if (payment.status !== OrderStatus.PENDING) {
      return { message: 'Payment already processed' };
    }

    const { isPaid, isCancelled } = classifyTransaction(
      transaction_status,
      fraud_status,
    );
    const rawStatus = {
      paymentType: payment_type,
      transactionStatus: transaction_status,
    };

    if (isCancelled) {
      // Returns false if a seller cancel or a retried notification got here first.
      await prisma.$transaction((tx) =>
        cancelPayment(tx, payment.id, rawStatus),
      );
    } else if (isPaid) {
      await markPaymentPaid(payment.id, payment_type, transaction_status);
    } else {
      // still pending (e.g. capture+challenge, or pending) - just record raw status
      await prisma.payment.update({
        where: { id: payment.id },
        data: rawStatus,
      });
    }

    return { message: 'Notification processed' };
  }
}

export default OrderPaymentService;
