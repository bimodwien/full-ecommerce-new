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
    const created = await prisma.$transaction(async (prisma) => {
      const name = req.body.name;
      const existingCategory = await prisma.category.findFirst({
        where: {
          name,
        },
      });
      if (existingCategory) {
        throw new AppError('Category already exists', 409);
      }
      const data: Prisma.CategoryCreateInput = {
        name,
      };
      const newCategory = await prisma.category.create({
        data,
      });
      return newCategory;
    });
    // Capitalize only in response
    return { ...created, name: CategoryService.capitalizeFirst(created.name) };
  }

  static async editCategory(req: Request) {
    const updated = await prisma.$transaction(async (prisma) => {
      const id = req.params.id;
      const name = req.body.name;
      const existingCategory = await prisma.category.findUnique({
        where: { id: String(id) },
      });
      if (!existingCategory) throw new AppError('Category not found', 404);
      const data: Prisma.CategoryUpdateInput = {
        name,
      };
      const updatedCategory = await prisma.category.update({
        where: { id: String(id) },
        data,
      });
      return updatedCategory;
    });
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
      await prisma.category.delete({
        where: { id: String(id) },
      });
    });
    return { message: 'Category deleted successfully' };
  }
}

export default CategoryService;
