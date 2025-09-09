import { WishlistController } from '@/controllers/wishlist.controller';
import { Router } from 'express';
import { validateToken } from '@/middlewares/auth.middleware';
import { verifyUser } from '@/middlewares/role.middleware';

export class WishlistRouter {
  private router = Router();
  private controller = new WishlistController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      '/',
      validateToken,
      verifyUser,
      this.controller.getAll.bind(this.controller),
    );
    this.router.post(
      '/',
      validateToken,
      verifyUser,
      this.controller.create.bind(this.controller),
    );
    this.router.post(
      '/toggle',
      validateToken,
      verifyUser,
      this.controller.toggle.bind(this.controller),
    );
    this.router.delete(
      '/:id',
      validateToken,
      verifyUser,
      this.controller.delete.bind(this.controller),
    );
  }

  public getRouter() {
    return this.router;
  }
}
