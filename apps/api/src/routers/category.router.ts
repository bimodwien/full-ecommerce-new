import { CategoryController } from '@/controllers/category.controller';
import { Router } from 'express';

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
      this.categoryController.create.bind(this.categoryController),
    );
    this.router.put(
      '/:id',
      this.categoryController.update.bind(this.categoryController),
    );
    this.router.delete(
      '/:id',
      this.categoryController.delete.bind(this.categoryController),
    );
  }

  public getRouter() {
    return this.router;
  }
}
