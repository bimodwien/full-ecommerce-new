import { Prisma } from '@prisma/client';
import AppError from '@/libs/appError';

type PriceLike = Prisma.Decimal | number | null | undefined;

// undefined = field not sent (leave as is), null = cleared (use product price).
export function parseVariantPrice(raw: unknown): number | null | undefined {
  if (raw === undefined) return undefined;
  if (raw === null || raw === '') return null;
  const price = Number(raw);
  if (Number.isNaN(price) || price < 0)
    throw new AppError('Invalid variant price', 400);
  return price;
}

// Either every variant has its own price or none do, so Product.price can
// always mean "cheapest option" for sorting and filtering.
export function assertAllOrNonePriced(prices: PriceLike[]) {
  const priced = prices.filter((p) => p != null).length;
  if (priced > 0 && priced < prices.length)
    throw new AppError('Set a price for every variant or none', 400);
}

export function cheapestPrice(prices: PriceLike[]) {
  const nums = prices.filter((p) => p != null).map(Number);
  return nums.length > 0 ? Math.min(...nums) : undefined;
}

// After variants change, keep Product.price at the cheapest variant price.
export async function syncProductPrice(
  tx: Prisma.TransactionClient,
  productId: string,
) {
  const variants = await tx.productVariant.findMany({
    where: { productId },
    select: { price: true },
  });
  const prices = variants.map((v) => v.price);
  assertAllOrNonePriced(prices);
  const cheapest = cheapestPrice(prices);
  if (cheapest === undefined) return;
  await tx.product.update({
    where: { id: productId },
    data: { price: cheapest },
  });
}
