import { Prisma, TotalStock } from '@prisma/client';
import { TProduct } from '@/models/product.model';
import { TProductImage } from '@/models/productImage.model';

// Prisma product type including relations we include in queries
export type PrismaProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    Images: true;
    Variants: true;
    Category: true;
    seller: { select: { id: true; name: true } };
  };
}>;

export const PRIMARY_IMAGE_FIRST = [
  { isPrimary: 'desc' as Prisma.SortOrder },
  { createdAt: 'asc' as Prisma.SortOrder },
];

const SELLER_SELECT = { select: { id: true, name: true } };

// List payloads: primary image only. Without Variants, stockStatus is always
// OUT_OF_STOCK, some cart/wishlist endpoints still use this one.
export const PRODUCT_LIST_INCLUDE_NO_STOCK = {
  Images: { orderBy: PRIMARY_IMAGE_FIRST, take: 1 },
  Category: true,
  seller: SELLER_SELECT,
} satisfies Prisma.ProductInclude;

export const PRODUCT_LIST_INCLUDE = {
  ...PRODUCT_LIST_INCLUDE_NO_STOCK,
  Variants: { select: { stock: true } },
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

export const USER_ITEM_INCLUDE_NO_STOCK = {
  Product: { include: PRODUCT_LIST_INCLUDE_NO_STOCK },
  Variant: true,
};

export type SanitizedProduct = Omit<TProduct, 'Images'> & {
  Images?: (Omit<TProductImage, 'data'> & { imageUrl: string })[];
};

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
    stockTotal: Array.isArray(product.Variants)
      ? product.Variants.reduce((s, v) => s + (v.stock ?? 0), 0)
      : undefined,
    stockStatus: (() => {
      const total = Array.isArray(product.Variants)
        ? product.Variants.reduce((s, v) => s + (v.stock ?? 0), 0)
        : 0;
      if (total <= 0) return TotalStock.OUT_OF_STOCK;
      if (total < 5) return TotalStock.LOW_STOCK;
      return TotalStock.IN_STOCK;
    })(),
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
    stockTotal: Array.isArray(product.Variants)
      ? product.Variants.reduce((s, v) => s + (v.stock ?? 0), 0)
      : undefined,
    stockStatus: (() => {
      const total = Array.isArray(product.Variants)
        ? product.Variants.reduce((s, v) => s + (v.stock ?? 0), 0)
        : 0;
      if (total <= 0) return TotalStock.OUT_OF_STOCK;
      if (total < 5) return TotalStock.LOW_STOCK;
      return TotalStock.IN_STOCK;
    })(),
  };

  return sanitized as unknown as SanitizedProduct;
}
