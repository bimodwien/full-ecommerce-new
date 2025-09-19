import { Request } from 'express';
import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import sanitizeProductForList, {
  PrismaProductWithRelations,
} from './product.helpers';
import AppError from '@/libs/appError';

class WishlistService {
  static async getAllWishlist(req: Request) {
    const userId = req.user?.id as string;
    if (!userId) throw new AppError('Unauthorized', 401);

    const page = Math.max(1, Number(req.query.page || 1));
    let limit = Number(req.query.limit || 10);
    limit = Math.min(100, Math.max(1, limit));
    const skip = (page - 1) * limit;

    // Fetch total and items with product primary image + variant (if any)
    const [total, items] = await prisma.$transaction([
      prisma.wishlist.count({ where: { userId } }),
      prisma.wishlist.findMany({
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
              Variants: { select: { stock: true } },
              Category: true,
              seller: { select: { id: true, name: true } },
            },
          },
          Variant: true,
        },
      }),
    ]);

    // sanitize each item's product to keep only primary image and remove binary
    const sanitized = items.map((it) => {
      const prod = it.Product as PrismaProductWithRelations | null;
      const product = sanitizeProductForList(prod);
      return {
        id: it.id,
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
      wishlists: sanitized,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async createWishlist(req: Request) {
    const userId = req.user?.id as string;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { productId, variantId } = req.body;
    if (!productId) throw new AppError('productId is required', 400);

    return prisma.$transaction(async (prisma) => {
      // prevent duplicate wishlist entries for same user/product/variant
      const existingWishlist = await prisma.wishlist.findFirst({
        where: {
          userId,
          productId: String(productId),
          variantId: variantId ? String(variantId) : null,
        },
      });
      if (existingWishlist) throw new AppError('Wishlist already exists', 409);

      // validate product
      const product = await prisma.product.findUnique({
        where: { id: String(productId) },
      });
      if (!product) throw new AppError('Product not found', 404);

      if (variantId) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: String(variantId) },
        });
        if (!variant || variant.productId !== String(productId))
          throw new AppError('Variant not found for product', 404);
      }

      // create wishlist entry
      const created = await prisma.wishlist.create({
        data: {
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

      const prod = created.Product as PrismaProductWithRelations | null;
      const productSanitized = sanitizeProductForList(prod);

      return {
        id: created.id,
        productId: created.productId,
        variantId: created.variantId ?? undefined,
        userId: created.userId,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
        Product: productSanitized,
        Variant: created.Variant ?? undefined,
      };
    });
  }

  static async deleteWishlist(req: Request) {
    const userId = req.user?.id as string;
    if (!userId) throw new AppError('Unauthorized', 401);

    const id = String(req.params.id || req.body.id || '');
    if (!id) throw new AppError('Wishlist id is required', 400);

    return prisma.$transaction(async (prisma) => {
      const existing = await prisma.wishlist.findUnique({
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

      if (!existing) throw new AppError('Wishlist not found', 404);
      if (existing.userId !== userId) throw new AppError('Unauthorized', 403);

      const prod = existing.Product as PrismaProductWithRelations | null;
      const productSanitized = sanitizeProductForList(prod);

      await prisma.wishlist.delete({ where: { id } });

      return {
        id: existing.id,
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

  static async toggleWishlist(req: Request) {
    const userId = req.user?.id as string;
    if (!userId) throw new AppError('Unauthorized', 401);

    const { productId, variantId } = req.body;
    if (!productId) throw new AppError('productId is required', 400);

    return prisma.$transaction(async (prisma) => {
      // try to find existing entry first
      const existing = await prisma.wishlist.findFirst({
        where: {
          userId,
          productId: String(productId),
          variantId: variantId ? String(variantId) : null,
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
              seller: { select: { id: true, name: true } },
            },
          },
          Variant: true,
        },
      });

      if (existing) {
        const prod = existing.Product as PrismaProductWithRelations | null;
        const productSanitized = sanitizeProductForList(prod);

        await prisma.wishlist.delete({ where: { id: existing.id } });

        return {
          action: 'deleted',
          wishlist: {
            id: existing.id,
            productId: existing.productId,
            variantId: existing.variantId ?? undefined,
            userId: existing.userId,
            createdAt: existing.createdAt,
            updatedAt: existing.updatedAt,
            Product: productSanitized,
            Variant: existing.Variant ?? undefined,
          },
        };
      }

      // validate product
      const product = await prisma.product.findUnique({
        where: { id: String(productId) },
      });
      if (!product) throw new AppError('Product not found', 404);

      if (variantId) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: String(variantId) },
        });
        if (!variant || variant.productId !== String(productId))
          throw new AppError('Variant not found for product', 404);
      }

      // create wishlist entry
      const created = await prisma.wishlist.create({
        data: {
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
              seller: { select: { id: true, name: true } },
            },
          },
          Variant: true,
        },
      });

      const prod2 = created.Product as PrismaProductWithRelations | null;
      const productSanitized2 = sanitizeProductForList(prod2);

      return {
        action: 'created',
        wishlist: {
          id: created.id,
          productId: created.productId,
          variantId: created.variantId ?? undefined,
          userId: created.userId,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
          Product: productSanitized2,
          Variant: created.Variant ?? undefined,
        },
      };
    });
  }
}

export default WishlistService;
