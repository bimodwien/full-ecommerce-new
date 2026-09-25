import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import AppError from '@/libs/appError';

class CategoryService {
  // Capitalize only for output; do not alter DB values
  private static capitalizeFirst(s: string) {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  private static normalizeName(raw: unknown) {
    const name = String(raw ?? '').trim();
    if (!name) throw new AppError('Category name is required', 400);
    return name;
  }

  // Case-insensitive so "Sepatu" and "sepatu" can't both exist; they'd look
  // identical after capitalizeFirst.
  private static async assertNameAvailable(
    tx: Prisma.TransactionClient,
    name: string,
    excludeId?: string,
  ) {
    const duplicate = await tx.category.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    if (duplicate) throw new AppError('Category already exists', 409);
  }

  // The DB unique constraint still catches an exact-name race between the
  // check above and the write.
  private static toConflict(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    )
      throw new AppError('Category already exists', 409);
    throw error;
  }

  static async getAllCategory(req: Request) {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 10)));
    const name = String(req.query.name || '');

    const where: Prisma.CategoryWhereInput = {
      name: { contains: name, mode: 'insensitive' as Prisma.QueryMode },
    };

    const [total, rows] = await prisma.$transaction([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { Product: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const categories = rows.map(({ _count, ...c }) => ({
      ...c,
      name: CategoryService.capitalizeFirst(c.name),
      productCount: _count.Product,
    }));

    return {
      categories,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async createCategory(req: Request) {
    const name = CategoryService.normalizeName(req.body.name);
    const created = await prisma
      .$transaction(async (prisma) => {
        await CategoryService.assertNameAvailable(prisma, name);
        const data: Prisma.CategoryCreateInput = {
          name,
        };
        const newCategory = await prisma.category.create({
          data,
        });
        return newCategory;
      })
      .catch(CategoryService.toConflict);
    // Capitalize only in response
    return { ...created, name: CategoryService.capitalizeFirst(created.name) };
  }

  static async getCategoryById(req: Request) {
    const id = String(req.params.id);
    const found = await prisma.category.findUnique({ where: { id } });
    if (!found) throw new AppError('Category not found', 404);
    return {
      category: { ...found, name: CategoryService.capitalizeFirst(found.name) },
    };
  }

  static async editCategory(req: Request) {
    const name = CategoryService.normalizeName(req.body.name);
    const updated = await prisma
      .$transaction(async (prisma) => {
        const id = req.params.id;
        const existingCategory = await prisma.category.findUnique({
          where: { id: String(id) },
        });
        if (!existingCategory) throw new AppError('Category not found', 404);
        await CategoryService.assertNameAvailable(
          prisma,
          name,
          existingCategory.id,
        );
        const data: Prisma.CategoryUpdateInput = {
          name,
        };
        const updatedCategory = await prisma.category.update({
          where: { id: String(id) },
          data,
        });
        return updatedCategory;
      })
      .catch(CategoryService.toConflict);
    // Capitalize only in response
    return { ...updated, name: CategoryService.capitalizeFirst(updated.name) };
  }

  static async deleteCategory(req: Request) {
    const id = req.params.id;
    await prisma.$transaction(async (prisma) => {
      const existingCategory = await prisma.category.findUnique({
        where: { id: String(id) },
      });
      if (!existingCategory) throw new AppError('Category not found', 404);
      // Categories are shared between sellers, so don't silently uncategorize
      // someone else's products.
      const productCount = await prisma.product.count({
        where: { categoryId: String(id) },
      });
      if (productCount > 0)
        throw new AppError(
          `Category still has ${productCount} product(s), move them to another category first`,
          409,
        );
      await prisma.category.delete({
        where: { id: String(id) },
      });
    });
    return { message: 'Category deleted successfully' };
  }
}

export default CategoryService;
