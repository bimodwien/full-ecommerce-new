import { Request } from 'express';
import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import AppError from '@/libs/appError';
import {
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
  toWishlistDto,
  assertProductAndVariant,
  wishlistCreateData,
} from './wishlist.helpers';

function parseWishlistBody(req: Request) {
  const { productId, variantId } = req.body;
  if (!productId) throw new AppError('productId is required', 400);
  return {
    productId: String(productId),
    variantId: variantId ? String(variantId) : null,
  };
}

class WishlistService {
  static async getAllWishlist(req: Request) {
    const userId = requireUserId(req);
    const { page, limit, skip } = parsePagination(req);

    // Fetch total and items with product primary image + variant (if any)
    const [total, items] = await prisma.$transaction([
      prisma.wishlist.count({ where: { userId } }),
      prisma.wishlist.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' as Prisma.SortOrder },
        include: USER_ITEM_INCLUDE,
      }),
    ]);

    return {
      wishlists: items.map(toWishlistDto),
      ...pageMeta(total, page, limit),
    };
  }

  static async createWishlist(req: Request) {
    const userId = requireUserId(req);
    const { productId, variantId } = parseWishlistBody(req);

    return prisma.$transaction(async (tx) => {
      // prevent duplicate wishlist entries for same user/product/variant
      const existingWishlist = await tx.wishlist.findFirst({
        where: { userId, productId, variantId },
      });
      if (existingWishlist) throw new AppError('Wishlist already exists', 409);

      await assertProductAndVariant(tx, productId, variantId);
      const created = await tx.wishlist.create({
        data: wishlistCreateData(userId, productId, variantId),
        include: USER_ITEM_INCLUDE,
      });
      return toWishlistDto(created);
    });
  }

  static async deleteWishlist(req: Request) {
    const userId = requireUserId(req);
    const id = requireId(req, 'Wishlist id is required');

    return prisma.$transaction(async (tx) => {
      const existing = await tx.wishlist.findUnique({
        where: { id },
        include: USER_ITEM_INCLUDE,
      });
      if (!existing) throw new AppError('Wishlist not found', 404);
      if (existing.userId !== userId) throw new AppError('Unauthorized', 403);

      await tx.wishlist.delete({ where: { id } });
      return toWishlistDto(existing);
    });
  }

  static async toggleWishlist(req: Request) {
    const userId = requireUserId(req);
    const { productId, variantId } = parseWishlistBody(req);

    return prisma.$transaction(async (tx) => {
      // try to find existing entry first
      const existing = await tx.wishlist.findFirst({
        where: { userId, productId, variantId },
        include: USER_ITEM_INCLUDE_NO_STOCK,
      });
      if (existing) {
        await tx.wishlist.delete({ where: { id: existing.id } });
        return { action: 'deleted', wishlist: toWishlistDto(existing) };
      }

      await assertProductAndVariant(tx, productId, variantId);
      const created = await tx.wishlist.create({
        data: wishlistCreateData(userId, productId, variantId),
        include: USER_ITEM_INCLUDE_NO_STOCK,
      });
      return { action: 'created', wishlist: toWishlistDto(created) };
    });
  }
}

export default WishlistService;
