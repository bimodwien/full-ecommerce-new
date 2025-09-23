import { Request, Response, NextFunction } from 'express';
import CategoryService from '@/services/category.service';

export class CategoryController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CategoryService.getAllCategory(req);
      res.status(200).json({
        message: 'Get all categories success',
        ...data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.getCategoryById(req);
      res.status(200).json({
        message: 'Get category success',
        ...category,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const newCategory = await CategoryService.createCategory(req);
      res.status(201).json({
        message: 'Category created successfully',
        category: newCategory,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updatedCategory = await CategoryService.editCategory(req);
      res.status(200).json({
        message: 'Category updated successfully',
        category: updatedCategory,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CategoryService.deleteCategory(req);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
