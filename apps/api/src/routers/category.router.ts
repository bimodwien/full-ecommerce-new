import { CategoryController } from '@/controllers/category.controller';
import { Router } from 'express';
import { validateToken } from '@/middlewares/auth.middleware';
import { verifyAdmin } from '@/middlewares/role.middleware';

export class CategoryRouter {
  private router = Router();
  private categoryController = new CategoryController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      '/',
      this.categoryController.getAll.bind(this.categoryController),
    );
    this.router.post(
      '/',
      validateToken,
      verifyAdmin,
      this.categoryController.create.bind(this.categoryController),
    );
    this.router.put(
      '/:id',
      validateToken,
      verifyAdmin,
      this.categoryController.update.bind(this.categoryController),
    );
    this.router.delete(
      '/:id',
      validateToken,
      verifyAdmin,
      this.categoryController.delete.bind(this.categoryController),
    );
  }

  public getRouter() {
    return this.router;
  }
}
