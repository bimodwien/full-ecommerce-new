import { Prisma } from '@prisma/client';
import prisma from '../../src/prisma';
import { renderMarkdownToHtml } from '../../src/libs/markdown';
import { cheapestPrice } from '../../src/services/product/variant-price.helpers';
import placeholderImage from './placeholderImage';
import products from './data/products.json';

type SeedProduct = (typeof products)[number];

async function buildData(
  p: SeedProduct,
  sellerId: string,
  categoryId: string,
): Promise<Prisma.ProductCreateInput> {
  const variants = p.variants ?? [];
  const png = await placeholderImage(p.name);
  return {
    name: p.name,
    description: p.description,
    descriptionHtml: renderMarkdownToHtml(p.description),
    // Same rule as the API: with per-variant prices, product price is the cheapest.
    price: cheapestPrice(variants.map((v) => v.price)) ?? p.price,
    seller: { connect: { id: sellerId } },
    Category: { connect: { id: categoryId } },
    Images: { create: [{ data: Uint8Array.from(png), isPrimary: true }] },
    Variants: variants.length ? { create: variants } : undefined,
  };
}

export default async function seedProducts(
  sellerId: string,
  categories: Map<string, string>,
) {
  for (const p of products) {
    const categoryId = categories.get(p.category);
    if (!categoryId) throw new Error(`Unknown category: ${p.category}`);

    const exists = await prisma.product.findFirst({ where: { name: p.name } });
    if (exists) continue;

    await prisma.product.create({
      data: await buildData(p, sellerId, categoryId),
    });
  }
}
