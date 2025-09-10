import { Prisma } from '@prisma/client';
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
    // exclude description fields from list payloads (detail endpoint includes them)
    ...(() => {
      const {
        description,
        descriptionHtml,
        Images: _img,
        ...rest
      } = product as any;
      return rest;
    })(),
    Images: images,
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
        ...rest
      } = product as any;
      return rest;
    })(),
    Images: images,
  };

  return sanitized as unknown as SanitizedProduct;
}
