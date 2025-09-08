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
    ...product,
    description: product.description ?? undefined,
    Images: images,
  };

  return sanitized as unknown as SanitizedProduct;
}

export default sanitizeProduct;
