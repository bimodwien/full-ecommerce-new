import { Request } from 'express';
import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import sanitizeProductForList, {
  PrismaProductWithRelations,
} from './product.helpers';

class CartService {
  static async getAllCart(req: Request) {
    const userId = req.user?.id as string;
    if (!userId) throw new Error('Unauthorized');

    const page = Math.max(1, Number(req.query.page || 1));
    let limit = Number(req.query.limit || 10);
    limit = Math.min(100, Math.max(1, limit));
    const skip = (page - 1) * limit;

    const [total, items] = await prisma.$transaction([
      prisma.cart.count({ where: { userId } }),
      prisma.cart.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' as Prisma.SortOrder },
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
      }),
    ]);

    const sanitized = items.map((it) => {
      const prod = it.Product as PrismaProductWithRelations | null;
      const product = sanitizeProductForList(prod);
      return {
        id: it.id,
        quantity: it.quantity,
        productId: it.productId,
        variantId: it.variantId ?? undefined,
        userId: it.userId,
        createdAt: it.createdAt,
        updatedAt: it.updatedAt,
        Product: product,
        Variant: it.Variant ?? undefined,
      };
    });

    return {
      carts: sanitized,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async createCart(req: Request) {
    const userId = req.user?.id as string;
    if (!userId) throw new Error('Unauthorized');

    const { productId, variantId, quantity } = req.body;
    if (!productId) throw new Error('productId is required');

    return prisma.$transaction(async (prisma) => {
      const product = await prisma.product.findUnique({
        where: { id: String(productId) },
      });
      if (!product) throw new Error('Product not found');

      if (variantId) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: String(variantId) },
        });
        if (!variant || variant.productId !== String(productId))
          throw new Error('Variant not found for product');
      }

      // normalize requested quantity
      const reqQty = Math.max(0, Number(quantity) || 1);

      // if variant specified, ensure requested quantity does not exceed stock
      if (variantId) {
        const variantRec = await prisma.productVariant.findUnique({
          where: { id: String(variantId) },
        });
        if (!variantRec) throw new Error('Variant not found for product');
        if (reqQty <= 0) throw new Error('Quantity must be at least 1');
        if (variantRec.stock !== undefined && reqQty > variantRec.stock)
          throw new Error('Requested quantity exceeds available stock');
      }

      // check if cart item exists for same user/product/variant -> if so, increment quantity
      const existing = await prisma.cart.findFirst({
        where: {
          userId,
          productId: String(productId),
          variantId: variantId ? String(variantId) : null,
        },
      });
      if (existing) {
        const newQty = existing.quantity + reqQty;
        if (variantId) {
          const variantRec2 = await prisma.productVariant.findUnique({
            where: { id: String(variantId) },
          });
          if (
            variantRec2 &&
            variantRec2.stock !== undefined &&
            newQty > variantRec2.stock
          )
            throw new Error('Requested quantity exceeds available stock');
        }

        const updated = await prisma.cart.update({
          where: { id: existing.id },
          data: { quantity: newQty },
        });

        const prod = await prisma.product.findUnique({
          where: { id: updated.productId },
          include: {
            Images: {
              orderBy: [
                { isPrimary: 'desc' as Prisma.SortOrder },
                { createdAt: 'asc' as Prisma.SortOrder },
              ],
              take: 1,
            },
            Category: true,
            seller: { select: { id: true, name: true } },
          },
        });
        const productSanitized = sanitizeProductForList(
          prod as PrismaProductWithRelations,
        );

        return {
          id: updated.id,
          quantity: updated.quantity,
          productId: updated.productId,
          variantId: updated.variantId ?? undefined,
          userId: updated.userId,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
          Product: productSanitized,
        };
      }

      const created = await prisma.cart.create({
        data: {
          quantity: reqQty,
          Product: { connect: { id: String(productId) } },
          Variant: variantId
            ? { connect: { id: String(variantId) } }
            : undefined,
          User: { connect: { id: userId } },
        },
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
      });

      const prod2 = created.Product as PrismaProductWithRelations | null;
      const productSanitized2 = sanitizeProductForList(prod2);

      return {
        id: created.id,
        quantity: created.quantity,
        productId: created.productId,
        variantId: created.variantId ?? undefined,
        userId: created.userId,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
        Product: productSanitized2,
        Variant: created.Variant ?? undefined,
      };
    });
  }

  static async updateCart(req: Request) {
    const userId = req.user?.id as string;
    if (!userId) throw new Error('Unauthorized');

    const id = String(req.params.id || req.body.id || '');
    if (!id) throw new Error('Cart id is required');

    const { quantity, delta } = req.body;

    return prisma.$transaction(async (prisma) => {
      const existing = await prisma.cart.findUnique({ where: { id } });
      if (!existing) throw new Error('Cart item not found');
      if (existing.userId !== userId) throw new Error('Unauthorized');

      let newQty = existing.quantity;
      if (delta !== undefined)
        newQty = Math.max(0, existing.quantity + Number(delta));
      else if (quantity !== undefined) newQty = Math.max(0, Number(quantity));

      if (!Number.isInteger(newQty) || newQty < 0)
        throw new Error('Quantity must be a non-negative integer');

      // if cart item has variant, ensure not exceed stock
      if (existing.variantId) {
        const variantRec = await prisma.productVariant.findUnique({
          where: { id: existing.variantId },
        });
        if (
          variantRec &&
          variantRec.stock !== undefined &&
          newQty > variantRec.stock
        )
          throw new Error('Requested quantity exceeds available stock');
      }

      await prisma.cart.update({ where: { id }, data: { quantity: newQty } });

      const updatedCart = await prisma.cart.findUnique({
        where: { id },
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
      });

      const productSanitized = sanitizeProductForList(
        updatedCart?.Product as PrismaProductWithRelations,
      );

      return {
        id: updatedCart!.id,
        quantity: updatedCart!.quantity,
        productId: updatedCart!.productId,
        variantId: updatedCart!.variantId ?? undefined,
        userId: updatedCart!.userId,
        createdAt: updatedCart!.createdAt,
        updatedAt: updatedCart!.updatedAt,
        Product: productSanitized,
        Variant: updatedCart!.Variant ?? undefined,
      };
    });
  }

  static async deleteCart(req: Request) {
    const userId = req.user?.id as string;
    if (!userId) throw new Error('Unauthorized');

    const id = String(req.params.id || req.body.id || '');
    if (!id) throw new Error('Cart id is required');

    return prisma.$transaction(async (prisma) => {
      const existing = await prisma.cart.findUnique({
        where: { id },
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
              seller: { select: { id: true, name: true } },
            },
          },
          Variant: true,
        },
      });
      if (!existing) throw new Error('Cart item not found');
      if (existing.userId !== userId) throw new Error('Unauthorized');

      const prod = existing.Product as PrismaProductWithRelations | null;
      const productSanitized = sanitizeProductForList(prod);

      await prisma.cart.delete({ where: { id } });

      return {
        id: existing.id,
        quantity: existing.quantity,
        productId: existing.productId,
        variantId: existing.variantId ?? undefined,
        userId: existing.userId,
        createdAt: existing.createdAt,
        updatedAt: existing.updatedAt,
        Product: productSanitized,
        Variant: existing.Variant ?? undefined,
      };
    });
  }
}

export default CartService;
