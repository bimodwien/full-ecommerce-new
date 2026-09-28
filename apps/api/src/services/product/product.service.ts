import { Request } from 'express';
import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import AppError from '@/libs/appError';
import sanitizeProduct, {
  sanitizeProductForList,
  PRIMARY_IMAGE_FIRST,
  PRODUCT_LIST_INCLUDE,
  PRODUCT_PAGE_INCLUDE,
} from './helpers';
import type {
  GetProductsOptions,
  PrismaProductWithRelations,
} from '@/models/product.model';

function buildProductWhere(opts: GetProductsOptions): Prisma.ProductWhereInput {
  const name = (opts.name || '').trim();
  const { categoryId, minPrice, maxPrice, sellerId } = opts;
  return {
    AND: [
      name ? { name: { contains: name, mode: 'insensitive' } } : undefined,
      categoryId ? { categoryId } : undefined,
      minPrice !== undefined ? { price: { gte: minPrice } } : undefined,
      maxPrice !== undefined ? { price: { lte: maxPrice } } : undefined,
      sellerId ? { sellerId } : undefined,
    ].filter(Boolean) as Prisma.ProductWhereInput[],
  };
}

function buildProductOrderBy(
  sort: string,
): Prisma.ProductOrderByWithRelationInput {
  if (sort === 'price_asc') return { price: 'asc' as Prisma.SortOrder };
  if (sort === 'price_desc') return { price: 'desc' as Prisma.SortOrder };
  return { createdAt: 'desc' as Prisma.SortOrder };
}

// Query-string filters shared by the public listing endpoints.
function parseProductQuery(req: Request): GetProductsOptions {
  const q = req.query;
  return {
    page: q.page ? Number(q.page) : undefined,
    limit: q.limit ? Number(q.limit) : undefined,
    name: q.name ? String(q.name) : undefined,
    categoryId: q.categoryId ? String(q.categoryId) : undefined,
    minPrice: q.minPrice ? Number(q.minPrice) : undefined,
    maxPrice: q.maxPrice ? Number(q.maxPrice) : undefined,
    sort: q.sort ? String(q.sort) : undefined,
  };
}

class ProductService {
  // core implementation that accepts plain options (testable)
  static async getAllProductsWithOptions(opts: GetProductsOptions = {}) {
    const page = Math.max(1, opts.page || 1);
    let limit = opts.limit ?? 10;
    limit = Math.min(100, Math.max(1, limit));
    const where = buildProductWhere(opts);

    // get total and paginated data in a single transaction
    const [total, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: buildProductOrderBy(opts.sort || 'newest'),
        include: PRODUCT_LIST_INCLUDE,
      }),
    ]);

    // remove large binary fields before returning to clients (list: only primary image)
    return {
      products: products.map((p) =>
        sanitizeProductForList(p as PrismaProductWithRelations),
      ),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // Request-based wrapper so controllers can forward req directly (like CategoryService)
  static async getAllProducts(req: Request) {
    return this.getAllProductsWithOptions(parseProductQuery(req));
  }

  // Seller dashboard: same filters as getAllProducts minus price, scoped to the logged-in seller
  static async getMyProducts(req: Request) {
    const sellerId = req.user?.id;
    if (!sellerId) throw new AppError('Unauthorized', 401);

    return this.getAllProductsWithOptions({
      ...parseProductQuery(req),
      minPrice: undefined,
      maxPrice: undefined,
      sellerId,
    });
  }

  // Request-based get by category to keep controller simple and match your preference
  static async getProductsByCategory(req: Request) {
    const categoryId =
      req.params.categoryId || (req.query.categoryId as string | undefined);
    return this.getAllProductsWithOptions({
      ...parseProductQuery(req),
      categoryId: categoryId ? String(categoryId) : undefined,
    });
  }

  // Get single product by id (returns all images)
  static async getProductById(req: Request) {
    const id = String(req.params.id || req.query.id || '');
    if (!id) throw new AppError('Product id is required', 400);

    const product = await prisma.product.findUnique({
      where: { id },
      include: PRODUCT_PAGE_INCLUDE,
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
          orderBy: PRIMARY_IMAGE_FIRST,
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
}

export default ProductService;
