import { Request } from 'express';
import { Prisma } from '@prisma/client';
import AppError from '@/libs/appError';
import { renderMarkdownToHtml } from '@/libs/markdown';
import {
  ImageInput,
  VariantsCreate,
  getUploadedFiles,
  processImages,
  parseVariantsCreate,
  parseJsonField,
  assertCategoryExists,
} from './product.input.helpers';

type Tx = Prisma.TransactionClient;
type VariantUpdate = { id?: string; variant?: string; stock?: number };
type UpdateInput = Awaited<ReturnType<typeof parseUpdateInput>>;

const isNonEmptyArray = <T>(v: T[] | undefined): v is T[] =>
  !!v && Array.isArray(v) && v.length > 0;

export async function parseUpdateInput(tx: Tx, req: Request) {
  const { name, description, price, categoryId, variant, removeImageIds } =
    req.body;
  await assertCategoryExists(tx, categoryId);
  const imagesCreate = await processImages(getUploadedFiles(req), false);

  return {
    name,
    description,
    price,
    categoryId,
    imagesCreate,
    variantsCreate: parseVariantsCreate(variant),
    variantUpdates: parseJsonField<VariantUpdate[]>(
      req.body.variantUpdates,
      'Invalid variantUpdates format; expected JSON array',
    ),
    removeVariantIds: parseJsonField<string[]>(
      req.body.removeVariantIds,
      'Invalid removeVariantIds format; expected JSON array of ids',
    ),
    removeImageIds: parseJsonField<string[]>(
      removeImageIds,
      'Invalid removeImageIds format; expected JSON array of ids',
    ),
  };
}

// Validate against existing variants and duplicates within payload.
async function assertVariantNames(
  tx: Tx,
  productId: string,
  updates: VariantUpdate[],
) {
  const existingVariants = await tx.productVariant.findMany({
    where: { productId },
    select: { id: true, variant: true },
  });
  const existingMap = new Map(existingVariants.map((e) => [e.variant, e.id]));
  const seen = new Set<string>();

  for (const v of updates) {
    const name = v.variant ? String(v.variant).trim() : undefined;
    if (!name) continue;
    if (seen.has(name))
      throw new AppError(`Duplicate variant name in payload: ${name}`, 400);
    seen.add(name);

    const existingId = existingMap.get(name);
    if (existingId && existingId !== v.id)
      throw new AppError(
        `Variant name already exists for this product: ${name}`,
        409,
      );
  }
}

async function upsertVariants(
  tx: Tx,
  productId: string,
  updates: VariantUpdate[],
) {
  for (const v of updates) {
    if (v.id) {
      await tx.productVariant.update({
        where: { id: v.id },
        data: { variant: v.variant ?? undefined, stock: v.stock ?? undefined },
      });
    } else {
      // creating a new variant; ensure it doesn't exist (checked in assertVariantNames)
      await tx.productVariant.create({
        data: {
          variant: String(v.variant ?? ''),
          stock: Number(v.stock ?? 0),
          productId,
        },
      });
    }
  }
}

// Removals and in-place variant edits, applied before the product row changes.
export async function applyRemovalsAndVariantUpdates(
  tx: Tx,
  productId: string,
  input: UpdateInput,
) {
  if (isNonEmptyArray(input.removeImageIds)) {
    await tx.productImage.deleteMany({
      where: { id: { in: input.removeImageIds }, productId },
    });
  }
  if (input.variantsCreate) {
    await tx.productVariant.deleteMany({ where: { productId } });
  }
  if (isNonEmptyArray(input.variantUpdates)) {
    await assertVariantNames(tx, productId, input.variantUpdates);
    await upsertVariants(tx, productId, input.variantUpdates);
  }
  if (isNonEmptyArray(input.removeVariantIds)) {
    await tx.productVariant.deleteMany({
      where: { id: { in: input.removeVariantIds }, productId },
    });
  }
}

export function buildProductUpdateData(input: UpdateInput) {
  const { name, description, price, categoryId } = input;
  const updateData: Prisma.ProductUpdateInput = {} as any;
  if (name) updateData.name = name;
  if (description !== undefined) {
    updateData.description = description ?? undefined;
    updateData.descriptionHtml = description
      ? renderMarkdownToHtml(String(description))
      : undefined;
  }
  if (price !== undefined) {
    const priceNum = Number(price);
    if (Number.isNaN(priceNum)) throw new AppError('Invalid price', 400);
    updateData.price = priceNum as any;
  }
  if (categoryId) updateData.Category = { connect: { id: String(categoryId) } };
  return updateData;
}

export async function createImagesAndVariants(
  tx: Tx,
  productId: string,
  imagesCreate: ImageInput[],
  variantsCreate: VariantsCreate,
) {
  if (imagesCreate.length > 0) {
    await tx.productImage.createMany({
      data: imagesCreate.map((img) => ({
        data: img.data as any,
        isPrimary: img.isPrimary ?? false,
        productId,
      })),
    });
  }
  if (variantsCreate) {
    await tx.productVariant.createMany({
      data: (variantsCreate.create as any[]).map((v) => ({
        variant: (v as any).variant,
        stock: (v as any).stock,
        productId,
      })),
    });
  }
}

// If the primary image was removed, promote the oldest remaining one.
export async function ensurePrimaryImage(tx: Tx, productId: string) {
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
