import { ProductController } from '@/controllers/product/product.controller';
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

  // Seller routes go first so "/mine" isn't matched as an id by "/:id".
  private initializeRoutes(): void {
    this.initializeSellerRoutes();
    this.initializePublicRoutes();
  }

  private initializeSellerRoutes(): void {
    const guards = [validateToken, verifyAdmin];
    const c = this.productController;
    const upload = imageUploader().array('image', 5);
    // Seller dashboard list
    this.router.get('/mine', ...guards, c.getMine.bind(c));
    this.router.post('/', ...guards, upload, c.create.bind(c));
    this.router.patch('/:id', ...guards, upload, c.update.bind(c));
    this.router.delete('/:id', ...guards, c.delete.bind(c));
  }

  private initializePublicRoutes(): void {
    const c = this.productController;
    // GET /api/products?categoryId=... supports filtering via query
    this.router.get('/', c.getAll.bind(c));
    // convenience route: GET /api/products/category/:categoryId
    this.router.get('/category/:categoryId', c.getByCategory.bind(c));
    // Render product image
    this.router.get('/image/:id', c.render.bind(c));
    // Get product by id (full product with all images)
    this.router.get('/:id', c.getById.bind(c));
  }

  getRouter(): Router {
    return this.router;
  }
}
