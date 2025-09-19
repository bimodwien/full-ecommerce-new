import { Request } from 'express';
import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import AppError from '@/libs/appError';
import sanitizeProduct, {
  PrismaProductWithRelations,
  sanitizeProductForList,
} from './product.helpers';

export type GetProductsOptions = {
  page?: number;
  limit?: number;
  name?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | string;
};

// types are imported from product.helpers

class ProductService {
  // core implementation that accepts plain options (testable)
  static async getAllProductsWithOptions(opts: GetProductsOptions = {}) {
    const page = Math.max(1, opts.page || 1);
    let limit = opts.limit ?? 10;
    limit = Math.min(100, Math.max(1, limit));
    const skip = (page - 1) * limit;

    const name = (opts.name || '').trim();
    const categoryId = opts.categoryId;
    const minPrice = opts.minPrice;
    const maxPrice = opts.maxPrice;
    const sort = opts.sort || 'newest';

    const where: Prisma.ProductWhereInput = {
      AND: [
        name ? { name: { contains: name, mode: 'insensitive' } } : undefined,
        categoryId ? { categoryId } : undefined,
        minPrice !== undefined ? { price: { gte: minPrice } } : undefined,
        maxPrice !== undefined ? { price: { lte: maxPrice } } : undefined,
      ].filter(Boolean) as Prisma.ProductWhereInput[],
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === 'price_asc'
        ? { price: 'asc' as Prisma.SortOrder }
        : sort === 'price_desc'
          ? { price: 'desc' as Prisma.SortOrder }
          : { createdAt: 'desc' as Prisma.SortOrder };
    // get total and paginated data in a single transaction
    const [total, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          Images: {
            orderBy: [
              { isPrimary: 'desc' as Prisma.SortOrder },
              { createdAt: 'asc' as Prisma.SortOrder },
            ],
            take: 1,
          },
          // include variant stock to compute aggregated stock for list
          Variants: { select: { stock: true } },
          Category: true,
          seller: { select: { id: true, name: true } },
        },
      }),
    ]);

    // remove large binary fields before returning to clients (list: only primary image)
    const sanitizedProducts = products.map((p) =>
      sanitizeProductForList(p as PrismaProductWithRelations),
    );

    return {
      products: sanitizedProducts,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // Request-based wrapper so controllers can forward req directly (like CategoryService)
  static async getAllProducts(req: Request) {
    const opts: GetProductsOptions = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      name: req.query.name ? String(req.query.name) : undefined,
      categoryId: req.query.categoryId
        ? String(req.query.categoryId)
        : undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      sort: req.query.sort ? String(req.query.sort) : undefined,
    };

    return this.getAllProductsWithOptions(opts);
  }

  // Request-based get by category to keep controller simple and match your preference
  static async getProductsByCategory(req: Request) {
    const categoryId =
      req.params.categoryId || (req.query.categoryId as string | undefined);
    const opts: GetProductsOptions = {
      categoryId: categoryId ? String(categoryId) : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort ? String(req.query.sort) : undefined,
      name: req.query.name ? String(req.query.name) : undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    };

    return this.getAllProductsWithOptions(opts);
  }

  // create/update/delete moved to product.business.service.ts

  // Get single product by id (returns all images)
  static async getProductById(req: Request) {
    const id = String(req.params.id || req.query.id || '');
    if (!id) throw new AppError('Product id is required', 400);

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        Images: {
          orderBy: [
            { isPrimary: 'desc' as Prisma.SortOrder },
            { createdAt: 'asc' as Prisma.SortOrder },
          ],
        },
        Variants: true,
        Category: true,
        seller: { select: { id: true, name: true } },
      },
    });

    return sanitizeProduct(product as PrismaProductWithRelations);
  }

  // core render helper (testable) - returns buffer + metadata
  static async renderImage(productId: string) {
    // Try to treat the id as a ProductImage id first
    const image = await prisma.productImage.findUnique({
      where: { id: productId },
      select: { data: true, updatedAt: true },
    });

    if (image) {
      return { buffer: image.data as Buffer, updatedAt: image.updatedAt };
    }

    // Fallback: treat the id as a Product id and return its primary image
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        Images: {
          orderBy: [
            { isPrimary: 'desc' as Prisma.SortOrder },
            { createdAt: 'asc' as Prisma.SortOrder },
          ],
          select: { data: true, updatedAt: true },
          take: 1,
        },
      },
    });

    if (!product || !product.Images || product.Images.length === 0) {
      return null;
    }

    const img = product.Images[0];
    return { buffer: img.data as Buffer, updatedAt: img.updatedAt };
  }

  // Request-based wrapper used by controllers: returns payload suitable for sending
  static async render(req: Request) {
    const id = String(req.params.id);
    const result = await this.renderImage(id);
    if (!result) throw new AppError('Image not found', 404);

    // images created by service are PNG; expose contentType for controller
    return {
      buffer: result.buffer,
      updatedAt: result.updatedAt,
      contentType: 'image/png',
    };
  }

  // sanitizeProduct moved to product.helpers.ts
}

export default ProductService;
