import { ProductController } from '@/controllers/product.controller';
import { imageUploader } from '@/libs/multer';
import { Router } from 'express';
import { validateToken } from '@/middlewares/auth.middleware';
import { verifyAdmin } from '@/middlewares/role.middleware';

export class ProductRouter {
  private router: Router;
  private productController: ProductController;

  constructor() {
    this.productController = new ProductController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /api/products?categoryId=... supports filtering via query
    this.router.get(
      '/',
      this.productController.getAll.bind(this.productController),
    );

    // convenience route: GET /api/products/category/:categoryId
    this.router.get(
      '/category/:categoryId',
      this.productController.getByCategory.bind(this.productController),
    );

    // Create product (single image)
    this.router.post(
      '/',
      validateToken,
      verifyAdmin,
      imageUploader().array('image', 5),
      this.productController.create.bind(this.productController),
    );

    // Update product
    this.router.patch(
      '/:id',
      validateToken,
      verifyAdmin,
      imageUploader().array('image', 5),
      this.productController.update.bind(this.productController),
    );

    // Render product image
    this.router.get(
      '/image/:id',
      this.productController.render.bind(this.productController),
    );

    // Delete product
    this.router.delete(
      '/:id',
      validateToken,
      verifyAdmin,
      this.productController.delete.bind(this.productController),
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
