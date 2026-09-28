import { Prisma, Cart, ProductVariant } from '@prisma/client';
import AppError from '@/libs/appError';
import sanitizeProductForList, {
  PrismaProductWithRelations,
} from './product.helpers';

type CartRow = Cart & { Product?: unknown; Variant?: ProductVariant | null };

export function toCartDto(cart: CartRow) {
  return {
    id: cart.id,
    quantity: cart.quantity,
    productId: cart.productId,
    variantId: cart.variantId ?? undefined,
    userId: cart.userId,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
    Product: sanitizeProductForList(
      cart.Product as PrismaProductWithRelations | null,
    ),
    Variant: cart.Variant ?? undefined,
  };
}

// Variant must belong to the product, and the requested quantity must fit stock.
export async function assertVariantQuantity(
  tx: Prisma.TransactionClient,
  productId: string,
  variantId: string,
  quantity: number,
) {
  const variant = await tx.productVariant.findUnique({
    where: { id: variantId },
  });
  if (!variant || variant.productId !== productId)
    throw new AppError('Variant not found for product', 404);
  if (quantity <= 0) throw new AppError('Quantity must be at least 1', 400);
  if (quantity > variant.stock)
    throw new AppError('Requested quantity exceeds available stock', 400);
}

export async function assertWithinStock(
  tx: Prisma.TransactionClient,
  variantId: string,
  quantity: number,
) {
  const variant = await tx.productVariant.findUnique({
    where: { id: variantId },
  });
  if (variant && quantity > variant.stock)
    throw new AppError('Requested quantity exceeds available stock', 400);
}

// `delta` wins over `quantity`; neither means keep the current quantity.
export function resolveQuantity(
  current: number,
  quantity: unknown,
  delta: unknown,
) {
  let newQty = current;
  if (delta !== undefined) newQty = Math.max(0, current + Number(delta));
  else if (quantity !== undefined) newQty = Math.max(0, Number(quantity));

  if (!Number.isInteger(newQty) || newQty < 0)
    throw new AppError('Quantity must be a non-negative integer', 400);
  return newQty;
}
