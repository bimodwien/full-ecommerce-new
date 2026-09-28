import { Prisma, Wishlist, ProductVariant } from '@prisma/client';
import AppError from '@/libs/appError';
import {
  sanitizeProductForList,
  PrismaProductWithRelations,
} from '../product/helpers';

type WishlistRow = Wishlist & {
  Product?: unknown;
  Variant?: ProductVariant | null;
};

export function toWishlistDto(wishlist: WishlistRow) {
  return {
    id: wishlist.id,
    productId: wishlist.productId,
    variantId: wishlist.variantId ?? undefined,
    userId: wishlist.userId,
    createdAt: wishlist.createdAt,
    updatedAt: wishlist.updatedAt,
    Product: sanitizeProductForList(
      wishlist.Product as PrismaProductWithRelations | null,
    ),
    Variant: wishlist.Variant ?? undefined,
  };
}

// Product must exist, and a given variant must belong to it.
export async function assertProductAndVariant(
  tx: Prisma.TransactionClient,
  productId: string,
  variantId: string | null,
) {
  const product = await tx.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError('Product not found', 404);

  if (variantId) {
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant || variant.productId !== productId)
      throw new AppError('Variant not found for product', 404);
  }
}

export function wishlistCreateData(
  userId: string,
  productId: string,
  variantId: string | null,
): Prisma.WishlistCreateInput {
  return {
    Product: { connect: { id: productId } },
    Variant: variantId ? { connect: { id: variantId } } : undefined,
    User: { connect: { id: userId } },
  };
}
