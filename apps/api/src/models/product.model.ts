import { TUser } from './user.model';
import { Prisma, TotalStock } from '@prisma/client';
import { TCategory } from './category.model';
import { TProductImage } from './productImage.model';
import { TProductVariant } from './productVariant.model';
import { TWishlist } from './wishlist.model';
import { TCart } from './cart.model';
import { TOrderItem } from './orderItem.model';

export type TProduct = {
  id: string;
  name: string;
  description?: string;
  descriptionHtml?: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  sellerId: string;
  seller?: TUser;
  categoryId?: string;
  Category?: TCategory;
  Images?: TProductImage[];
  Variants?: TProductVariant[];
  // aggregated stock information (computed server-side)
  stockTotal?: number;
  stockStatus?: TotalStock;
  Wishlist?: TWishlist[];
  Cart?: TCart[];
  OrderItems?: TOrderItem[];
};

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

// Processed upload, ready for productImage.create.
export type ImageInput = { data: Buffer; isPrimary?: boolean };
export type VariantsCreate = Prisma.ProductCreateInput['Variants'] | undefined;

export type GetProductsOptions = {
  page?: number;
  limit?: number;
  name?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | string;
  sellerId?: string;
};

// Validated fields for creating a product.
export type ProductCreateData = {
  name: string;
  description?: string;
  priceNum: number;
  sellerId: string;
  categoryId?: string;
  imagesCreate: ImageInput[];
  variantsCreate: VariantsCreate;
};
