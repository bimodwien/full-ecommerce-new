import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import { Request } from 'express';

class CategoryService {
  static async getAllCategory(req: Request) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const name = String(req.query.name || '');
    const categories = await prisma.category.findMany({
      where: {
        name: { contains: name },
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    const total = await prisma.category.count();
    return {
      categories,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async createCategory(req: Request) {
    await prisma.$transaction(async (prisma) => {
      const name = req.body.name;
      const existingCategory = await prisma.category.findFirst({
        where: {
          name,
        },
      });
      if (existingCategory) {
        throw new Error('Category already exists');
      }
      const data: Prisma.CategoryCreateInput = {
        name,
      };
      const newCategory = await prisma.category.create({
        data,
      });
      return newCategory;
    });
  }

  static async editCategory(req: Request) {
    await prisma.$transaction(async (prisma) => {
      const id = req.params.id;
      const name = req.body.name;
      const existingCategory = await prisma.category.findUnique({
        where: { id: String(id) },
      });
      if (!existingCategory) throw new Error('Category not found');
      const data: Prisma.CategoryUpdateInput = {
        name,
      };
      const updatedCategory = await prisma.category.update({
        where: { id: String(id) },
        data,
      });
      return updatedCategory;
    });
  }

  static async deleteCategory(req: Request) {
    const id = req.params.id;
    await prisma.$transaction(async (prisma) => {
      const existingCategory = await prisma.category.findUnique({
        where: { id: String(id) },
      });
      if (!existingCategory) throw new Error('Category not found');
      await prisma.category.delete({
        where: { id: String(id) },
      });
    });
    return { message: 'Category deleted successfully' };
  }
}

export default CategoryService;
