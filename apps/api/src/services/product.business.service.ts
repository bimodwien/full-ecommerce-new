import { Request } from 'express';
import prisma from '@/prisma';
import sharp from 'sharp';
import { Prisma } from '@prisma/client';
import sanitizeProduct, { PrismaProductWithRelations } from './product.helpers';
import { renderMarkdownToHtml } from '@/libs/markdown';
import AppError from '@/libs/appError';

class ProductBusinessService {
  static async createProduct(req: Request) {
    return prisma.$transaction(async (prisma) => {
      const { name, description, price, categoryId, variant } = req.body;
      const files =
        (req.files as Express.Multer.File[] | undefined) ??
        (req.file ? [req.file as Express.Multer.File] : undefined);
      const sellerId = req.user?.id;

      if (!sellerId)
        throw new AppError('Unauthorized: Seller ID not found', 401);
      if (!name) throw new AppError('Product name is required', 400);
      const priceNum = Number(price);
      if (Number.isNaN(priceNum)) throw new AppError('Invalid price', 400);

      const existingProduct = await prisma.product.findFirst({
        where: { name },
      });
      if (existingProduct) throw new AppError('Product already exists', 409);

      if (categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: String(categoryId) },
        });
        if (!category) throw new AppError('Category not found', 404);
      }

      if (!files || files.length === 0)
        throw new AppError('Product image is required', 400);

      const imagesCreate: Array<{ data: Buffer; isPrimary?: boolean }> = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        let inputBuffer: Buffer | undefined = f.buffer;
        if (!inputBuffer && f.path) {
          const fs = await import('fs');
          inputBuffer = fs.readFileSync(f.path as string);
        }
        if (!inputBuffer)
          throw new AppError('Uploaded file buffer not available', 400);
        const processed = await sharp(inputBuffer).png().toBuffer();
        imagesCreate.push({ data: processed, isPrimary: i === 0 });
      }

      let variantsCreate: Prisma.ProductCreateInput['Variants'] | undefined =
        undefined;
      if (variant) {
        try {
          const parsed =
            typeof variant === 'string' ? JSON.parse(variant) : variant;
          if (Array.isArray(parsed) && parsed.length > 0) {
            variantsCreate = {
              create: parsed.map((v: any) => ({
                variant: String(v.variant ?? v.name ?? ''),
                stock: Number(v.stock ?? 0),
              })),
            };
          }
        } catch (err) {
          throw new AppError(
            'Invalid variant format; expected JSON array',
            400,
          );
        }
      }

      // validate duplicates in variantsCreate payload (if any)
      if (variantsCreate && Array.isArray(variantsCreate.create)) {
        const names = (variantsCreate.create as any[]).map((x) =>
          String(x.variant).trim(),
        );
        const dup = names.find((n, i) => names.indexOf(n) !== i);
        if (dup)
          throw new AppError(`Duplicate variant name in payload: ${dup}`, 400);
      }

      const createData: Prisma.ProductCreateInput = {
        name,
        description: description ?? undefined,
        price: priceNum,
        seller: { connect: { id: sellerId } },
        Category: categoryId
          ? { connect: { id: String(categoryId) } }
          : undefined,
        Images: {
          create: imagesCreate.map((img) => ({
            data: img.data,
            isPrimary: img.isPrimary,
          })),
        },
        Variants: variantsCreate,
      };

      // attach rendered & sanitized HTML version of description
      if (description)
        createData.descriptionHtml = renderMarkdownToHtml(String(description));

      const product = await prisma.product.create({
        data: createData,
        include: {
          Images: true,
          Variants: true,
          Category: true,
          seller: { select: { id: true, name: true } },
        },
      });

      return sanitizeProduct(product as PrismaProductWithRelations);
    });
  }

  static async updateProduct(req: Request) {
    return prisma.$transaction(async (prisma) => {
      const productId = String(req.params.id || req.body.id);
      if (!productId) throw new AppError('Product id is required', 400);

      const existing = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (!existing) throw new AppError('Product not found', 404);

      const { name, description, price, categoryId, variant, removeImageIds } =
        req.body;
      const files =
        (req.files as Express.Multer.File[] | undefined) ??
        (req.file ? [req.file as Express.Multer.File] : undefined);

      if (categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: String(categoryId) },
        });
        if (!category) throw new AppError('Category not found', 404);
      }

      const imagesCreate: Array<{ data: Buffer; isPrimary?: boolean }> = [];
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          let inputBuffer: Buffer | undefined = f.buffer;
          if (!inputBuffer && f.path) {
            const fs = await import('fs');
            inputBuffer = fs.readFileSync(f.path as string);
          }
          if (!inputBuffer)
            throw new AppError('Uploaded file buffer not available', 400);
          const processed = await sharp(inputBuffer).png().toBuffer();
          imagesCreate.push({ data: processed, isPrimary: false });
        }
      }

      let variantsCreate: Prisma.ProductCreateInput['Variants'] | undefined =
        undefined;
      if (variant) {
        try {
          const parsed =
            typeof variant === 'string' ? JSON.parse(variant) : variant;
          if (Array.isArray(parsed) && parsed.length > 0) {
            variantsCreate = {
              create: parsed.map((v: any) => ({
                variant: String(v.variant ?? v.name ?? ''),
                stock: Number(v.stock ?? 0),
              })),
            };
          }
        } catch (err) {
          throw new AppError(
            'Invalid variant format; expected JSON array',
            400,
          );
        }
      }

      // validate duplicates in variantsCreate payload (if provided during update)
      if (variantsCreate && Array.isArray(variantsCreate.create)) {
        const names = (variantsCreate.create as any[]).map((x) =>
          String(x.variant).trim(),
        );
        const dup = names.find((n, i) => names.indexOf(n) !== i);
        if (dup)
          throw new AppError(`Duplicate variant name in payload: ${dup}`, 400);
      }

      const variantUpdatesRaw = req.body.variantUpdates;
      let variantUpdates:
        | Array<{ id?: string; variant?: string; stock?: number }>
        | undefined;
      if (variantUpdatesRaw) {
        try {
          variantUpdates =
            typeof variantUpdatesRaw === 'string'
              ? JSON.parse(variantUpdatesRaw)
              : variantUpdatesRaw;
        } catch (err) {
          throw new AppError(
            'Invalid variantUpdates format; expected JSON array',
            400,
          );
        }
      }

      const removeVariantIdsRaw = req.body.removeVariantIds;
      let removeVariantIdsArr: string[] | undefined;
      if (removeVariantIdsRaw) {
        try {
          removeVariantIdsArr =
            typeof removeVariantIdsRaw === 'string'
              ? JSON.parse(removeVariantIdsRaw)
              : removeVariantIdsRaw;
        } catch (err) {
          throw new AppError(
            'Invalid removeVariantIds format; expected JSON array of ids',
            400,
          );
        }
      }

      if (removeImageIds) {
        let ids: string[] = [];
        try {
          ids =
            typeof removeImageIds === 'string'
              ? JSON.parse(removeImageIds)
              : removeImageIds;
        } catch (e) {
          throw new AppError(
            'Invalid removeImageIds format; expected JSON array of ids',
            400,
          );
        }
        if (Array.isArray(ids) && ids.length > 0) {
          await prisma.productImage.deleteMany({
            where: { id: { in: ids }, productId },
          });
        }
      }

      if (variantsCreate) {
        await prisma.productVariant.deleteMany({ where: { productId } });
      }

      if (
        variantUpdates &&
        Array.isArray(variantUpdates) &&
        variantUpdates.length > 0
      ) {
        // validate against existing variants and duplicates within payload
        const existingVariants = await prisma.productVariant.findMany({
          where: { productId },
          select: { id: true, variant: true },
        });
        const existingMap = new Map(
          existingVariants.map((e) => [e.variant, e.id]),
        );
        const seen = new Set<string>();

        for (const v of variantUpdates) {
          const name = v.variant ? String(v.variant).trim() : undefined;
          if (name) {
            if (seen.has(name)) {
              throw new AppError(
                `Duplicate variant name in payload: ${name}`,
                400,
              );
            }
            seen.add(name);

            const existingId = existingMap.get(name);
            if (existingId && existingId !== v.id) {
              throw new AppError(
                `Variant name already exists for this product: ${name}`,
                409,
              );
            }
          }

          if (v.id) {
            await prisma.productVariant.update({
              where: { id: v.id },
              data: {
                variant: v.variant ?? undefined,
                stock: v.stock ?? undefined,
              },
            });
          } else {
            // creating a new variant; ensure it doesn't exist (checked above against existingMap)
            await prisma.productVariant.create({
              data: {
                variant: String(v.variant ?? ''),
                stock: Number(v.stock ?? 0),
                productId,
              },
            });
          }
        }
      }

      if (
        removeVariantIdsArr &&
        Array.isArray(removeVariantIdsArr) &&
        removeVariantIdsArr.length > 0
      ) {
        await prisma.productVariant.deleteMany({
          where: { id: { in: removeVariantIdsArr }, productId },
        });
      }

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
      if (categoryId)
        updateData.Category = { connect: { id: String(categoryId) } };

      const updated = await prisma.product.update({
        where: { id: productId },
        data: updateData,
      });

      if (imagesCreate.length > 0) {
        await prisma.productImage.createMany({
          data: imagesCreate.map((img) => ({
            data: img.data as any,
            isPrimary: img.isPrimary ?? false,
            productId,
          })),
        });
      }

      if (variantsCreate) {
        await prisma.productVariant.createMany({
          data: (variantsCreate.create as any[]).map((v) => ({
            variant: (v as any).variant,
            stock: (v as any).stock,
            productId,
          })),
        });
      }

      const anyPrimary = await prisma.productImage.findFirst({
        where: { productId, isPrimary: true },
      });
      if (!anyPrimary) {
        const firstImg = await prisma.productImage.findFirst({
          where: { productId },
          orderBy: { createdAt: 'asc' },
        });
        if (firstImg)
          await prisma.productImage.update({
            where: { id: firstImg.id },
            data: { isPrimary: true },
          });
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          Images: true,
          Variants: true,
          Category: true,
          seller: { select: { id: true, name: true } },
        },
      });

      return sanitizeProduct(product as PrismaProductWithRelations);
    });
  }

  static async deleteProduct(req: Request) {
    return prisma.$transaction(async (prisma) => {
      const id = String(req.params.id || req.body.id || '');
      if (!id) throw new AppError('Product id is required', 400);

      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          Images: true,
          Variants: true,
          Category: true,
          seller: { select: { id: true, name: true } },
        },
      });
      if (!product) throw new AppError('Product not found', 404);

      const sanitized = sanitizeProduct(product as PrismaProductWithRelations);

      await prisma.product.delete({ where: { id } });

      return sanitized;
    });
  }
}

export default ProductBusinessService;
