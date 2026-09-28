import { Request } from 'express';
import prisma from '@/prisma';
import { Prisma, Cart } from '@prisma/client';
import AppError from '@/libs/appError';
import {
  PRODUCT_LIST_INCLUDE_NO_STOCK,
  USER_ITEM_INCLUDE,
  USER_ITEM_INCLUDE_NO_STOCK,
} from './product.helpers';
import {
  requireUserId,
  requireId,
  parsePagination,
  pageMeta,
} from './common.helpers';
import {
  toCartDto,
  assertVariantQuantity,
  assertWithinStock,
  resolveQuantity,
} from './cart.helpers';

async function incrementCartItem(
  tx: Prisma.TransactionClient,
  existing: Cart,
  quantity: number,
) {
  const newQty = existing.quantity + quantity;
  if (existing.variantId)
    await assertWithinStock(tx, existing.variantId, newQty);

  const updated = await tx.cart.update({
    where: { id: existing.id },
    data: { quantity: newQty },
    include: { Product: { include: PRODUCT_LIST_INCLUDE_NO_STOCK } },
  });
  return toCartDto(updated);
}

async function createCartItem(
  tx: Prisma.TransactionClient,
  userId: string,
  productId: string,
  variantId: string | null,
  quantity: number,
) {
  const created = await tx.cart.create({
    data: {
      quantity,
      Product: { connect: { id: productId } },
      Variant: variantId ? { connect: { id: variantId } } : undefined,
      User: { connect: { id: userId } },
    },
    include: USER_ITEM_INCLUDE,
  });
  return toCartDto(created);
}

class CartService {
  static async getAllCart(req: Request) {
    const userId = requireUserId(req);
    const { page, limit, skip } = parsePagination(req);

    const [total, items] = await prisma.$transaction([
      prisma.cart.count({ where: { userId } }),
      prisma.cart.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' as Prisma.SortOrder },
        include: USER_ITEM_INCLUDE,
      }),
    ]);

    return { carts: items.map(toCartDto), ...pageMeta(total, page, limit) };
  }

  static async createCart(req: Request) {
    const userId = requireUserId(req);
    const { productId, variantId, quantity } = req.body;
    if (!productId) throw new AppError('productId is required', 400);
    const pid = String(productId);
    const vid = variantId ? String(variantId) : null;

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: pid } });
      if (!product) throw new AppError('Product not found', 404);

      // normalize requested quantity
      const reqQty = Math.max(0, Number(quantity) || 1);
      if (vid) await assertVariantQuantity(tx, pid, vid, reqQty);

      // check if cart item exists for same user/product/variant -> if so, increment quantity
      const existing = await tx.cart.findFirst({
        where: { userId, productId: pid, variantId: vid },
      });
      if (existing) return incrementCartItem(tx, existing, reqQty);
      return createCartItem(tx, userId, pid, vid, reqQty);
    });
  }

  static async updateCart(req: Request) {
    const userId = requireUserId(req);
    const id = requireId(req, 'Cart id is required');
    const { quantity, delta } = req.body;

    return prisma.$transaction(async (tx) => {
      const existing = await tx.cart.findUnique({ where: { id } });
      if (!existing) throw new AppError('Cart item not found', 404);
      if (existing.userId !== userId) throw new AppError('Unauthorized', 403);

      const newQty = resolveQuantity(existing.quantity, quantity, delta);
      // if cart item has variant, ensure not exceed stock
      if (existing.variantId)
        await assertWithinStock(tx, existing.variantId, newQty);

      const updated = await tx.cart.update({
        where: { id },
        data: { quantity: newQty },
        include: USER_ITEM_INCLUDE,
      });
      return toCartDto(updated);
    });
  }

  static async deleteCart(req: Request) {
    const userId = requireUserId(req);
    const id = requireId(req, 'Cart id is required');

    return prisma.$transaction(async (tx) => {
      const existing = await tx.cart.findUnique({
        where: { id },
        include: USER_ITEM_INCLUDE_NO_STOCK,
      });
      if (!existing) throw new AppError('Cart item not found', 404);
      if (existing.userId !== userId) throw new AppError('Unauthorized', 403);

      await tx.cart.delete({ where: { id } });
      return toCartDto(existing);
    });
  }
}

export default CartService;
