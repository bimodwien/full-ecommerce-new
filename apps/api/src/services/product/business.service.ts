import { Request } from 'express';
import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import sanitizeProduct, {
  PrismaProductWithRelations,
  PRODUCT_DETAIL_INCLUDE,
} from './helpers';
import { renderMarkdownToHtml } from '@/libs/markdown';
import AppError from '@/libs/appError';
import { requireId } from '../common.helpers';
import {
  ImageInput,
  VariantsCreate,
  getUploadedFiles,
  processImages,
  parseVariantsCreate,
  assertCategoryExists,
} from './input.helpers';
import {
  parseUpdateInput,
  applyRemovalsAndVariantUpdates,
  buildProductUpdateData,
  createImagesAndVariants,
} from './update.helpers';
import { cheapestPrice, syncProductPrice } from './variant-price.helpers';

type CreateInput = {
  name: string;
  description?: string;
  priceNum: number;
  sellerId: string;
  categoryId?: string;
  imagesCreate: ImageInput[];
  variantsCreate: VariantsCreate;
};

const variantPrices = (variantsCreate: VariantsCreate) =>
  ((variantsCreate?.create as any[]) ?? []).map((v) => v.price);

function buildCreateData(input: CreateInput): Prisma.ProductCreateInput {
  const { name, description, priceNum, sellerId, categoryId } = input;
  const createData: Prisma.ProductCreateInput = {
    name,
    description: description ?? undefined,
    // With per-variant prices, the product price is the cheapest variant.
    price: cheapestPrice(variantPrices(input.variantsCreate)) ?? priceNum,
    seller: { connect: { id: sellerId } },
    Category: categoryId ? { connect: { id: String(categoryId) } } : undefined,
    Images: {
      create: input.imagesCreate.map((img) => ({
        // Cast to any to satisfy Prisma Bytes type across Node typings
        data: img.data as any,
        isPrimary: img.isPrimary,
      })),
    },
    Variants: input.variantsCreate,
  };

  // attach rendered & sanitized HTML version of description
  if (description)
    createData.descriptionHtml = renderMarkdownToHtml(String(description));
  return createData;
}

// If the primary image was removed, promote the oldest remaining one.
async function ensurePrimaryImage(
  tx: Prisma.TransactionClient,
  productId: string,
) {
  const anyPrimary = await tx.productImage.findFirst({
    where: { productId, isPrimary: true },
  });
  if (anyPrimary) return;

  const firstImg = await tx.productImage.findFirst({
    where: { productId },
    orderBy: { createdAt: 'asc' },
  });
  if (firstImg)
    await tx.productImage.update({
      where: { id: firstImg.id },
      data: { isPrimary: true },
    });
}

class ProductBusinessService {
  static async createProduct(req: Request) {
    return prisma.$transaction(async (tx) => {
      const { name, description, price, categoryId, variant } = req.body;
      const files = getUploadedFiles(req);
      const sellerId = req.user?.id;

      if (!sellerId)
        throw new AppError('Unauthorized: Seller ID not found', 401);
      if (!name) throw new AppError('Product name is required', 400);
      const priceNum = Number(price);
      if (Number.isNaN(priceNum)) throw new AppError('Invalid price', 400);

      const existingProduct = await tx.product.findFirst({ where: { name } });
      if (existingProduct) throw new AppError('Product already exists', 409);
      await assertCategoryExists(tx, categoryId);

      if (!files || files.length === 0)
        throw new AppError('Product image is required', 400);
      const product = await tx.product.create({
        data: buildCreateData({
          name,
          description,
          priceNum,
          sellerId,
          categoryId,
          imagesCreate: await processImages(files, true),
          variantsCreate: parseVariantsCreate(variant),
        }),
        include: PRODUCT_DETAIL_INCLUDE,
      });
      return sanitizeProduct(product as PrismaProductWithRelations);
    });
  }

  static async updateProduct(req: Request) {
    return prisma.$transaction(async (tx) => {
      const productId = String(req.params.id || req.body.id);
      if (!productId) throw new AppError('Product id is required', 400);

      const existing = await tx.product.findUnique({
        where: { id: productId },
      });
      if (!existing) throw new AppError('Product not found', 404);
      if (existing.sellerId !== req.user?.id)
        throw new AppError('You can only edit your own products', 403);

      const input = await parseUpdateInput(tx, req);
      await applyRemovalsAndVariantUpdates(tx, productId, input);
      await tx.product.update({
        where: { id: productId },
        data: buildProductUpdateData(input),
      });
      await createImagesAndVariants(
        tx,
        productId,
        input.imagesCreate,
        input.variantsCreate,
      );
      await syncProductPrice(tx, productId);
      await ensurePrimaryImage(tx, productId);

      const product = await tx.product.findUnique({
        where: { id: productId },
        include: PRODUCT_DETAIL_INCLUDE,
      });
      return sanitizeProduct(product as PrismaProductWithRelations);
    });
  }

  static async deleteProduct(req: Request) {
    return prisma.$transaction(async (tx) => {
      const id = requireId(req, 'Product id is required');

      const product = await tx.product.findUnique({
        where: { id },
        include: PRODUCT_DETAIL_INCLUDE,
      });
      if (!product) throw new AppError('Product not found', 404);
      if (product.sellerId !== req.user?.id)
        throw new AppError('You can only delete your own products', 403);

      const sanitized = sanitizeProduct(product as PrismaProductWithRelations);
      await tx.product.delete({ where: { id } });
      return sanitized;
    });
  }
}

export default ProductBusinessService;
