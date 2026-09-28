import { Prisma, TotalStock } from '@prisma/client';
import { TProductImage } from '@/models/productImage.model';
import type {
  PrismaProductWithRelations,
  SanitizedProduct,
} from '@/models/product.model';

export const PRIMARY_IMAGE_FIRST = [
  { isPrimary: 'desc' as Prisma.SortOrder },
  { createdAt: 'asc' as Prisma.SortOrder },
];

const SELLER_SELECT = { select: { id: true, name: true } };

// List payloads: primary image only, plus variant stock for stockStatus.
export const PRODUCT_LIST_INCLUDE = {
  Images: { orderBy: PRIMARY_IMAGE_FIRST, take: 1 },
  Variants: { select: { stock: true, price: true } },
  Category: true,
  seller: SELLER_SELECT,
} satisfies Prisma.ProductInclude;

export const PRODUCT_DETAIL_INCLUDE = {
  Images: true,
  Variants: true,
  Category: true,
  seller: SELLER_SELECT,
} satisfies Prisma.ProductInclude;

export const PRODUCT_PAGE_INCLUDE = {
  ...PRODUCT_DETAIL_INCLUDE,
  Images: { orderBy: PRIMARY_IMAGE_FIRST },
} satisfies Prisma.ProductInclude;

// Cart and wishlist rows share the same Product + Variant relations.
export const USER_ITEM_INCLUDE = {
  Product: { include: PRODUCT_LIST_INCLUDE },
  Variant: true,
};

function stockStatusOf(total: number) {
  if (total <= 0) return TotalStock.OUT_OF_STOCK;
  if (total < 5) return TotalStock.LOW_STOCK;
  return TotalStock.IN_STOCK;
}

// Stock totals from variants, plus priceMax (the priciest effective variant
// price) so list cards can show a "Rp X – Rp Y" range.
function derivedFields(product: PrismaProductWithRelations) {
  const variants = Array.isArray(product.Variants) ? product.Variants : null;
  const total = variants
    ? variants.reduce((s, v) => s + (v.stock ?? 0), 0)
    : undefined;
  const prices = (variants ?? []).map((v) => Number(v.price ?? product.price));
  return {
    stockTotal: total,
    stockStatus: stockStatusOf(total ?? 0),
    priceMax: prices.length > 0 ? Math.max(...prices) : Number(product.price),
  };
}

export function sanitizeProduct(
  product: PrismaProductWithRelations | null,
): SanitizedProduct | null {
  if (!product) return null;

  const base = process.env.API_BASE_URL?.replace(/\/$/, '') || '';
  const images = product.Images?.map((img) => {
    const { data, ...rest } = img as any;
    const imageUrl = `${base}/api/products/image/${rest.id}`;
    return { ...(rest as Omit<TProductImage, 'data'>), imageUrl };
  });

  const sanitized = {
    // include description fields for detail responses
    ...product,
    description: product.description ?? undefined,
    descriptionHtml: (product as any).descriptionHtml ?? undefined,
    Images: images,
    ...derivedFields(product),
  };

  return sanitized as unknown as SanitizedProduct;
}

export default sanitizeProduct;

// Sanitizer optimized for list endpoints: only include the primary image (or first) to keep payload small
export function sanitizeProductForList(
  product: PrismaProductWithRelations | null,
): SanitizedProduct | null {
  if (!product) return null;

  const base = process.env.API_BASE_URL?.replace(/\/$/, '') || '';
  const img =
    (product.Images || []).find((i) => i.isPrimary) || product.Images?.[0];
  const images = img
    ? [
        {
          id: img.id,
          isPrimary: img.isPrimary,
          productId: img.productId,
          createdAt: img.createdAt,
          updatedAt: img.updatedAt,
          imageUrl: `${base}/api/products/image/${img.id}`,
        },
      ]
    : undefined;

  const sanitized = {
    // exclude description fields from list payloads (detail endpoint includes them)
    ...(() => {
      const {
        description,
        descriptionHtml,
        Images: _img,
        Variants: _v,
        ...rest
      } = product as any;
      return rest;
    })(),
    Images: images,
    ...derivedFields(product),
  };

  return sanitized as unknown as SanitizedProduct;
}
